import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/issue_report_form.dart';
import '../supabase_client.dart';
import '../screens/history_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
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

  // Define the target size in logical pixels (approx 5cm)
  static const double _boxSize = 5 * 38.0; // 5 cm * 38 logical pixels/cm = 190.0

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: CustomAppBar(
        title: 'Issue Reporter',
        automaticallyImplyLeading: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Welcome message / Header section
              Padding(
                padding: const EdgeInsets.only(bottom: 20.0),
                child: Text(
                  'Welcome to the SmartCity360!',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.blueGrey[800],
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(bottom: 30.0),
                child: Text(
                  'Choose an option below to get started.',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
              ),

              // The GridView containing your square boxes
              // We'll use a FixedExtent to ensure the size.
              GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16.0,
                mainAxisSpacing: 16.0,
                childAspectRatio: 1, // Keep children square
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                children: [
                  _buildSquareOptionContainer(
                    context: context,
                    icon: Icons.error_outline,
                    title: 'Report New Issue',
                    color: Colors.red.shade600,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => Scaffold(
                            appBar: CustomAppBar(title: 'Report Issue'),
                            body: IssueReportForm(initialImageUrls: _imageUrls),
                            floatingActionButton: FloatingActionButton(
                              onPressed: _pickImage,
                              tooltip: 'Take Photo',
                              child: const Icon(Icons.camera_alt),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  _buildSquareOptionContainer(
                    context: context,
                    icon: Icons.history,
                    title: 'View History',
                    color: Colors.blue.shade600,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const Scaffold(
                            appBar: CustomAppBar(title: 'Issue History'),
                            body: HistoryScreen(),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(height: 40),

              // Example of future content
              Align(
                alignment: Alignment.center,
                child: Column(
                  children: [
                    const Icon(Icons.info_outline, size: 40, color: Colors.grey),
                    const SizedBox(height: 10),
                    Text(
                      'More features coming soon!',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.grey[700],
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: () {
                        // Action for future content, e.g., "Learn More"
                      },
                      icon: const Icon(Icons.lightbulb_outline),
                      label: const Text('Learn About Our App'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
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
    );
  }

  Widget _buildSquareOptionContainer({
    required BuildContext context,
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return SizedBox( // Use SizedBox to enforce exact dimensions
      width: _boxSize,
      height: _boxSize,
      child: Card(
        elevation: 5,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(15),
          child: Container(
            padding: const EdgeInsets.all(8.0), // Slightly reduced padding to fit content
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 50, // Adjusted icon size to fit within smaller box
                  color: color,
                ),
                const SizedBox(height: 10), // Reduced spacing
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16, // Reduced font size for smaller box
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[800],
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}