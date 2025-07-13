import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/issue_report_form.dart';
import '../supabase_client.dart';
import '../screens/history_screen.dart'; // ✅ Import the HistoryScreen here

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<String> _imageUrls = [];
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _checkAuthState();
  }

  Future<void> _checkAuthState() async {
    final session = SupabaseClientManager.client.auth.currentSession;
    if (session == null && mounted) {
      Navigator.pushReplacementNamed(context, '/auth');
    }
  }

  Future<void> _logout() async {
    try {
      await SupabaseClientManager.client.auth.signOut();
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/auth');
      }
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Logout error: ${e.message}')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('An unexpected error occurred during logout')),
        );
      }
    }
  }

  Future<void> _pickImage() async {
    try {
      final pickedFile = await _picker.pickImage(source: ImageSource.camera);
      if (pickedFile != null && mounted) {
        final userId = SupabaseClientManager.client.auth.currentUser?.id;
        if (userId == null) throw Exception('User not authenticated');

        final fileName = '${DateTime.now().millisecondsSinceEpoch}_${pickedFile.name}';
        final storagePath = 'user_uploads/$userId/$fileName';

        await SupabaseClientManager.client.storage
            .from('issue-images')
            .uploadBinary(
          storagePath,
          await pickedFile.readAsBytes(),
          fileOptions: FileOptions(contentType: 'image/jpeg'),
        );

        final imageUrl = SupabaseClientManager.client.storage
            .from('issue-images')
            .getPublicUrl(storagePath);

        setState(() {
          _imageUrls.add(imageUrl);
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Image uploaded successfully')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error uploading image: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: CustomAppBar(
        title: _currentIndex == 0 ? 'Report Issue' : 'Issue History',
        automaticallyImplyLeading: true,
      ),
      body: _currentIndex == 0
          ? IssueReportForm(initialImageUrls: _imageUrls)
          : const HistoryScreen(), // ✅ Fixed: Show HistoryScreen instead of placeholder

      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton(
        onPressed: _pickImage,
        tooltip: 'Take Photo',
        child: const Icon(Icons.camera_alt),
      )
          : null,

      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Colors.blue),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Issue Reporter',
                    style: TextStyle(fontSize: 24, color: Colors.white),
                  ),
                  const SizedBox(height: 8),
                  StreamBuilder<AuthState>(
                    stream: SupabaseClientManager.client.auth.onAuthStateChange,
                    builder: (context, snapshot) {
                      final user = SupabaseClientManager.client.auth.currentUser;
                      return Text(
                        user?.email ?? 'Not logged in',
                        style: const TextStyle(fontSize: 16, color: Colors.white70),
                      );
                    },
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Home'),
              selected: _currentIndex == 0,
              onTap: () {
                setState(() {
                  _currentIndex = 0;
                });
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('History'),
              selected: _currentIndex == 1,
              onTap: () {
                setState(() {
                  _currentIndex = 1;
                });
                Navigator.pop(context);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () {
                Navigator.pop(context);
                _logout();
              },
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.report_problem),
            label: 'Report',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'History',
          ),
        ],
      ),
    );
  }
}
