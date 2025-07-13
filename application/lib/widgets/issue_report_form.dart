import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart' as geo;
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../supabase_client.dart';

class IssueReportForm extends StatefulWidget {
  final List<String>? initialImageUrls;

  const IssueReportForm({super.key, this.initialImageUrls});

  @override
  State<IssueReportForm> createState() => _IssueReportFormState();
}

class _IssueReportFormState extends State<IssueReportForm> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _addressController = TextEditingController();
  String _selectedCategory = 'General';
  bool _isLoading = false;
  final List<XFile> _imageFiles = [];
  final List<String> _uploadedImageUrls = [];
  LatLng? _selectedLocation;


  final List<String> _categories = [
    'General',
    'Infrastructure',
    'Safety',
    'Environment',
    'Other'
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialImageUrls != null) {
      _uploadedImageUrls.addAll(widget.initialImageUrls!);
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<Position?> _getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enable location services.')),
      );
      return null;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permission denied.')),
        );
        return null;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location permission permanently denied.')),
      );
      return null;
    }

    return await Geolocator.getCurrentPosition();
  }

  Future<void> _pinAndFetchAddress() async {
    final position = await _getCurrentLocation();
    if (position == null) return;

    LatLng selectedPosition = LatLng(position.latitude, position.longitude);

    await showDialog(
      context: context,
      builder: (outerContext) {
        return AlertDialog(
          title: const Text("Pin Your Location"),
          content: SizedBox(
            width: double.maxFinite,
            height: 300,
            child: StatefulBuilder(
              builder: (context, setStateDialog) {
                return FlutterMap(
                  options: MapOptions(
                    center: selectedPosition,
                    zoom: 16,
                    onTap: (tapPosition, point) {
                      setStateDialog(() {
                        selectedPosition = point;
                      });
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                      subdomains: const ['a', 'b', 'c'],
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: selectedPosition,
                          width: 40,
                          height: 40,
                          child: const Icon(
                            Icons.location_on,
                            size: 40,
                            color: Colors.red,
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),
          ),
          actions: [
            TextButton(
              child: const Text("Use this location"),
              onPressed: () async {
                final placemarks = await geo.placemarkFromCoordinates(
                    selectedPosition.latitude, selectedPosition.longitude);

                if (placemarks.isNotEmpty) {
                  final place = placemarks.first;
                  final address = [
                    place.name,
                    place.street,
                    place.locality,
                    place.administrativeArea,
                    place.postalCode,
                  ].where((e) => e != null && e.isNotEmpty).join(', ');

                  setState(() {
                    _addressController.text = address;
                    _selectedLocation = selectedPosition; // ✅ Store selected location
                  });
                }

                Navigator.pop(outerContext);
              },

            ),
            TextButton(
              child: const Text("Cancel"),
              onPressed: () => Navigator.pop(outerContext),
            ),
          ],
        );
      },
    );
  }

  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );

      if (pickedFile != null && mounted) {
        setState(() {
          _imageFiles.add(pickedFile);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error picking image: ${e.toString()}')),
        );
      }
    }
  }

  Future<String?> _uploadImage(XFile imageFile) async {
    try {
      final userId = SupabaseClientManager.client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      final fileExt = imageFile.path.split('.').last;
      final fileName = '$userId-${DateTime.now().millisecondsSinceEpoch}.$fileExt';
      final bytes = await imageFile.readAsBytes();

      await SupabaseClientManager.client.storage
          .from('issue-images')
          .uploadBinary(
        fileName,
        bytes,
        fileOptions: FileOptions(
          contentType: 'image/$fileExt',
          upsert: false,
        ),
      );

      return SupabaseClientManager.client.storage
          .from('issue-images')
          .getPublicUrl(fileName);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error uploading image: ${e.toString()}')),
        );
      }
      return null;
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    LatLng? latLng = _selectedLocation;
    if (latLng == null) {
      final currentPos = await _getCurrentLocation();
      if (currentPos == null) {
        setState(() => _isLoading = false);
        return;
      }
      latLng = LatLng(currentPos.latitude, currentPos.longitude);
    }

    try {
      final newImageUrls = <String>[];
      for (final imageFile in _imageFiles) {
        final url = await _uploadImage(imageFile);
        if (url != null) newImageUrls.add(url);
      }

      final allImageUrls = [..._uploadedImageUrls, ...newImageUrls];

      final userId = SupabaseClientManager.client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      await SupabaseClientManager.client.from('issues').insert({
        'user_id': userId,
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'category': _selectedCategory,
        'status': 'Pending',
        'image_urls': allImageUrls,
        'address': _addressController.text.trim(),
        'latitude': latLng.latitude,
        'longitude': latLng.longitude,

      }).select();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Issue reported successfully')),
        );
        _formKey.currentState!.reset();
        setState(() {
          _imageFiles.clear();
          _selectedCategory = 'General';
          _uploadedImageUrls.clear();
        });
      }
    } on PostgrestException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Database error: ${e.message}')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error submitting issue: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _removeImage(int index) async {
    setState(() {
      _imageFiles.removeAt(index);
    });
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(),
      ),
      validator: validator,
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: Theme.of(context).colorScheme.primary),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildImageGallery(List<String> urls) {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: urls.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                urls[index],
                width: 100,
                height: 100,
                fit: BoxFit.cover,
                errorBuilder: (context, _, __) => Container(
                  color: Colors.grey[300],
                  child: const Icon(Icons.broken_image),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildLocalImageGallery() {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _imageFiles.length,
        itemBuilder: (context, index) {
          return Stack(
            children: [
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.file(
                    File(_imageFiles[index].path),
                    width: 100,
                    height: 100,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              Positioned(
                right: 0,
                top: 0,
                child: GestureDetector(
                  onTap: () => _removeImage(index),
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Colors.black54,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, size: 20, color: Colors.white),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildSectionTitle('Title', Icons.title),
              const SizedBox(height: 8),
              _buildTextField(
                controller: _titleController,
                label: 'Title',
                icon: Icons.title,
                validator: (value) =>
                value == null || value.isEmpty ? 'Please enter a title' : null,
              ),
              const SizedBox(height: 16),
              _buildSectionTitle('Description', Icons.description),
              const SizedBox(height: 8),
              _buildTextField(
                controller: _descriptionController,
                label: 'Description',
                icon: Icons.description,
                maxLines: 4,
                validator: (value) => value == null || value.isEmpty
                    ? 'Please enter a description'
                    : null,
              ),
              const SizedBox(height: 16),
              _buildSectionTitle('Category', Icons.category),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.category),
                ),
                items: _categories.map((category) {
                  return DropdownMenuItem<String>(
                    value: category,
                    child: Text(category),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedCategory = value!;
                  });
                },
              ),
              const SizedBox(height: 16),
              _buildSectionTitle('Address / Landmark', Icons.location_on),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _addressController,
                      label: 'Address',
                      icon: Icons.location_on,
                      validator: (value) => value == null || value.isEmpty
                          ? 'Please enter address'
                          : null,
                    ),
                  ),
                  IconButton(
                    onPressed: _pinAndFetchAddress,
                    icon: const Icon(Icons.pin_drop),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildSectionTitle('Uploaded Images', Icons.cloud_done),
              const SizedBox(height: 8),
              if (_uploadedImageUrls.isNotEmpty)
                _buildImageGallery(_uploadedImageUrls),
              const SizedBox(height: 8),
              _buildLocalImageGallery(),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: _pickImage,
                icon: const Icon(Icons.add_a_photo),
                label: const Text('Pick Image'),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _submitForm,
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Submit'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
