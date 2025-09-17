import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart' as geo;
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import '../l10n/app_localizations.dart';
import '../supabase_client.dart';

class IssueReportForm extends StatefulWidget {
  final List<String>? initialImageUrls;

  const IssueReportForm({super.key, this.initialImageUrls});

  @override
  State<IssueReportForm> createState() => _IssueReportFormState();
}

class _IssueReportFormState extends State<IssueReportForm>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _addressController = TextEditingController();
  bool _isLoading = false;
  final List<XFile> _imageFiles = [];
  final List<String> _uploadedImageUrls = [];
  LatLng? _selectedLocation;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();

    if (widget.initialImageUrls != null) {
      _uploadedImageUrls.addAll(widget.initialImageUrls!);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _titleController.dispose();
    _descriptionController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<Position?> _getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      _showSnackBar(AppLocalizations.of(context)!.enableLocationServices, SnackBarType.error);
      return null;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        _showSnackBar(AppLocalizations.of(context)!.locationPermissionDenied, SnackBarType.error);
        return null;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      _showSnackBar(
        AppLocalizations.of(context)!.locationPermissionPermanentlyDenied,
        SnackBarType.error,
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
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            padding: const EdgeInsets.all(24),
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.9,
              maxHeight: MediaQuery.of(context).size.height * 0.8,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        AppLocalizations.of(context)!.pinYourLocation,
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Flexible(
                  child: Container(
                    width: double.maxFinite,
                    height: 300,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Theme.of(
                          context,
                        ).colorScheme.outline.withOpacity(0.3),
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
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
                                userAgentPackageName: 'com.example.app',
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
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(outerContext),
                      child: Text(AppLocalizations.of(context)!.cancel),
                    ),
                    const SizedBox(width: 8),
                    FilledButton.icon(
                      onPressed: () async {
                        try {
                          final placemarks = await geo.placemarkFromCoordinates(
                            selectedPosition.latitude,
                            selectedPosition.longitude,
                          );

                          if (placemarks.isNotEmpty) {
                            final place = placemarks.first;
                            final address =
                                [
                                      place.name,
                                      place.street,
                                      place.locality,
                                      place.administrativeArea,
                                      place.postalCode,
                                    ]
                                    .where((e) => e != null && e.isNotEmpty)
                                    .join(', ');

                            setState(() {
                              _addressController.text = address;
                              _selectedLocation = selectedPosition;
                            });
                          }
                        } catch (e) {
                          _showSnackBar(
                            AppLocalizations.of(context)!.errorGettingAddress(e.toString()),
                            SnackBarType.error,
                          );
                        }

                        Navigator.pop(outerContext);
                      },
                      icon: const Icon(Icons.check),
                      label: Text(AppLocalizations.of(context)!.useLocation),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _pickImage() async {
    _showImagePickerOptions();
  }

  void _showImagePickerOptions() {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.photo_camera),
                title: Text(AppLocalizations.of(context)!.takePhoto),
                onTap: () {
                  Navigator.pop(context);
                  _pickImageFromSource(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: Text(AppLocalizations.of(context)!.chooseFromGallery),
                onTap: () {
                  Navigator.pop(context);
                  _pickImageFromSource(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Icons.cancel),
                title: Text(AppLocalizations.of(context)!.cancel),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _pickImageFromSource(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        imageQuality: 80,
      );

      if (pickedFile != null && mounted) {
        setState(() {
          _imageFiles.add(pickedFile);
        });
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar(
          AppLocalizations.of(context)!.errorPickingImage(e.toString()),
          SnackBarType.error,
        );
      }
    }
  }

  Future<String?> _uploadImage(XFile imageFile) async {
    try {
      final userId = SupabaseClientManager.client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      final fileExt = imageFile.path.split('.').last;
      final fileName =
          '$userId-${DateTime.now().millisecondsSinceEpoch}.$fileExt';
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
        _showSnackBar(
          'Error uploading image: ${e.toString()}',
          SnackBarType.error,
        );
      }
      return null;
    }
  }

Future<String?> getBackendUrlFromSupabase() async {
    try {
      final response = await Supabase.instance.client
          .from('backend_url')
          .select('url')
          .eq('name', 'Main API') // Query by name instead of ID
          .maybeSingle();
      print(response?['url']);
      if (response != null && response['url'] != null) {
        return response['url'] as String;
      } else {
        print('No matching backend_url found.');
        return null;
      }
    } catch (e) {
      print('Error fetching backend URL: $e');
      return null;
    }
  }

  Future<void> _triggerAssessment(String issueId) async {
    try {
      final backendUrl = await getBackendUrlFromSupabase();

      if (backendUrl == null) {
        _showSnackBar('Failed to get backend URL.', SnackBarType.error);
        return;
      }

      final response = await http.post(
        Uri.parse('$backendUrl/assess-issue'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'issue_id': issueId}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          _showSnackBar(
            'Issue queued for AI assessment!',
            SnackBarType.success,
          );
        } else {
          _showSnackBar(
            'Assessment queuing failed: ${data['message']}',
            SnackBarType.warning,
          );
        }
      } else {
        throw Exception('HTTP ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('Assessment trigger error: $e');
      _showSnackBar(
        'Assessment queuing failed, but issue was saved',
        SnackBarType.warning,
      );
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
      final response =
          await SupabaseClientManager.client.from('issues').insert({
            'user_id': userId,
            'title': _titleController.text.trim(),
            'description': _descriptionController.text.trim(),
            'category': 'General',
            'status': 'Pending',
            'image_urls': allImageUrls,
            'address': _addressController.text.trim(),
            'latitude': latLng.latitude,
            'longitude': latLng.longitude,
          }).select();

      if (response.isNotEmpty) {
        final issueId = response[0]['id'].toString();

        if (mounted) {
          _showSnackBar(AppLocalizations.of(context)!.issueReportedSuccessfully, SnackBarType.success);

          // Trigger AI assessment in the background
          _triggerAssessment(issueId);

          // Reset the form
          _formKey.currentState!.reset();
          setState(() {
            _imageFiles.clear();
            _uploadedImageUrls.clear();
            _titleController.clear();
            _descriptionController.clear();
            _addressController.clear();
          });
        }
      } else {
        throw Exception('Failed to insert issue');
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar(
          AppLocalizations.of(context)!.errorSubmittingIssue(e.toString()),
          SnackBarType.error,
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

  Future<void> _removeUploadedImage(int index) async {
    setState(() {
      _uploadedImageUrls.removeAt(index);
    });
  }

  void _showSnackBar(String message, SnackBarType type) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              type == SnackBarType.success ? Icons.check_circle : Icons.error,
              color: Colors.white,
            ),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: type == SnackBarType.success
            ? Colors.green
            : Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        margin: const EdgeInsets.all(16),
      ),
    );
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
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.primary,
            width: 2,
          ),
        ),
        filled: true,
        fillColor: Theme.of(
          context,
        ).colorScheme.surfaceVariant.withOpacity(0.3),
      ),
      validator: validator,
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: Theme.of(context).colorScheme.onPrimaryContainer,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageCard(String imageUrl, {VoidCallback? onRemove}) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        width: 120,
        height: 120,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
        child: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                imageUrl,
                width: 120,
                height: 120,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return Container(
                    width: 120,
                    height: 120,
                    color: Theme.of(context).colorScheme.surfaceVariant,
                    child: Center(
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        value: loadingProgress.expectedTotalBytes != null
                            ? loadingProgress.cumulativeBytesLoaded /
                                  loadingProgress.expectedTotalBytes!
                            : null,
                      ),
                    ),
                  );
                },
                errorBuilder: (context, _, __) => Container(
                  width: 120,
                  height: 120,
                  color: Theme.of(context).colorScheme.errorContainer,
                  child: Icon(
                    Icons.broken_image,
                    color: Theme.of(context).colorScheme.onErrorContainer,
                  ),
                ),
              ),
            ),
            if (onRemove != null)
              Positioned(
                right: 4,
                top: 4,
                child: GestureDetector(
                  onTap: onRemove,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.errorContainer,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.close,
                      size: 16,
                      color: Theme.of(context).colorScheme.onErrorContainer,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocalImageCard(XFile imageFile, int index) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        width: 120,
        height: 120,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
        child: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(
                File(imageFile.path),
                width: 120,
                height: 120,
                fit: BoxFit.cover,
              ),
            ),
            Positioned(
              right: 4,
              top: 4,
              child: GestureDetector(
                onTap: () => _removeImage(index),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.errorContainer,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.close,
                    size: 16,
                    color: Theme.of(context).colorScheme.onErrorContainer,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSection() {
    final totalImages = _uploadedImageUrls.length + _imageFiles.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(AppLocalizations.of(context)!.images, Icons.photo_library),
        const SizedBox(height: 8),
        if (totalImages > 0)
          SizedBox(
            height: 130,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: totalImages + 1, // +1 for the add button
              itemBuilder: (context, index) {
                if (index < _uploadedImageUrls.length) {
                  // Show uploaded images
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _buildImageCard(
                      _uploadedImageUrls[index],
                      onRemove: () => _removeUploadedImage(index),
                    ),
                  );
                } else if (index <
                    _uploadedImageUrls.length + _imageFiles.length) {
                  // Show local images
                  final localIndex = index - _uploadedImageUrls.length;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _buildLocalImageCard(
                      _imageFiles[localIndex],
                      localIndex,
                    ),
                  );
                } else {
                  // Show add button
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _buildAddImageCard(),
                  );
                }
              },
            ),
          )
        else
          _buildAddImageCard(),
      ],
    );
  }

  Widget _buildAddImageCard() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: _pickImage,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Theme.of(context).colorScheme.outline.withOpacity(0.3),
              style: BorderStyle.solid,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.add_photo_alternate,
                size: 32,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 8),
              Text(
                AppLocalizations.of(context)!.addPhoto,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionHeader(
                        AppLocalizations.of(context)!.basicInformation,
                        Icons.info_outline,
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: _titleController,
                        label: AppLocalizations.of(context)!.issueTitle,
                        icon: Icons.title,
                        validator: (value) => value == null || value.isEmpty
                            ? AppLocalizations.of(context)!.pleaseEnterTitle
                            : null,
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: _descriptionController,
                        label: AppLocalizations.of(context)!.description,
                        icon: Icons.description,
                        maxLines: 4,
                        validator: (value) => value == null || value.isEmpty
                            ? AppLocalizations.of(context)!.pleaseEnterDescription
                            : null,
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionHeader(AppLocalizations.of(context)!.location, Icons.location_on),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: _buildTextField(
                              controller: _addressController,
                              label: AppLocalizations.of(context)!.addressOrLandmark,
                              icon: Icons.location_on,
                              validator: (value) =>
                                  value == null || value.isEmpty
                                  ? AppLocalizations.of(context)!.pleaseEnterAddress
                                  : null,
                            ),
                          ),
                          const SizedBox(width: 8),
                          FilledButton.tonalIcon(
                            onPressed: _pinAndFetchAddress,
                            icon: const Icon(Icons.pin_drop),
                            label: Text(AppLocalizations.of(context)!.pin),
                            style: FilledButton.styleFrom(
                              backgroundColor: Colors.blue.shade100,
                              foregroundColor: Colors.blue.shade700,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: _buildImageSection(),
                ),
              ),
              const SizedBox(height: 30),
              FilledButton(
                onPressed: _isLoading ? null : _submitForm,
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Colors.white,
                    ),
                  ),
                )
                    : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.send),
                    const SizedBox(width: 8),
                    Text(
                      AppLocalizations.of(context)!.submitReport,
                      style: Theme.of(context).textTheme.titleMedium
                          ?.copyWith(
                        color: Theme.of(
                          context,
                        ).colorScheme.onPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
enum SnackBarType { success, error, warning }
