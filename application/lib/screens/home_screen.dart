import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/issue_report_form.dart';
import '../supabase_client.dart';
import '../screens/history_screen.dart';
import '../providers/language_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<String> _imageUrls = [];
  final ImagePicker _picker = ImagePicker();

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _checkAuthState();
  }

  @override
  void dispose() {
    super.dispose();
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
        _showSnackBar('Logout error: ${e.message}', isError: true);
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar('An unexpected error occurred during logout', isError: true);
      }
    }
  }

  Future<void> _pickImage() async {
    setState(() => _isLoading = true);

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
          _showSnackBar(AppLocalizations.of(context)!.imageUploadedSuccessfully, isSuccess: true);
        }
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar('Error uploading image: ${e.toString()}', isError: true);
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String message, {bool isError = false, bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline :
              isSuccess ? Icons.check_circle_outline :
              Icons.info_outline,
              color: Colors.white,
            ),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: isError ? Colors.red.shade600 :
        isSuccess ? Colors.green.shade600 :
        Colors.blue.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.grey[50],
      appBar: _buildModernAppBar(),
      body: RefreshIndicator(
        onRefresh: () async {
          // Refresh functionality can be added here
        },
        color: Colors.blue.shade600,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // Hero Section
            SliverToBoxAdapter(
              child: _buildHeroSection(),
            ),

            // Quick Actions
            SliverToBoxAdapter(
              child: _buildQuickActions(),
            ),

            // Recent Activity
           
          ],
        ),
      ),
      drawer: _buildModernDrawer(),
    );
  }

  PreferredSizeWidget _buildModernAppBar() {
    return AppBar(
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blue.shade400, Colors.blue.shade600],
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.location_city, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Text(
            AppLocalizations.of(context)!.smartCity360,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
          ),
        ],
      ),
      backgroundColor: Colors.white,
      foregroundColor: Colors.grey[800],
      elevation: 0,
      shadowColor: Colors.transparent,
      actions: [
        IconButton(
          onPressed: () => _showNotificationsDialog(),
          icon: Stack(
            children: [
              const Icon(Icons.notifications_outlined),
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: Colors.red.shade500,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  constraints: const BoxConstraints(minWidth: 12, minHeight: 12),
                  child: const Text(
                    '3',
                    style: TextStyle(color: Colors.white, fontSize: 10),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildHeroSection() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.blue.shade600,
            Colors.blue.shade800,
            Colors.indigo.shade700,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.shade200.withOpacity(0.5),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.goodMorning,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    StreamBuilder<AuthState>(
                      stream: SupabaseClientManager.client.auth.onAuthStateChange,
                      builder: (context, snapshot) {
                        final user = SupabaseClientManager.client.auth.currentUser;
                        final name = user?.userMetadata?['full_name'] ??
                            user?.email?.split('@')[0] ?? AppLocalizations.of(context)!.citizen;
                        return Text(
                          '${AppLocalizations.of(context)!.welcomeBackUser}, $name',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const Icon(
                  Icons.eco_outlined,
                  color: Colors.white,
                  size: 30,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            AppLocalizations.of(context)!.helpMakeCityBetter,
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 16,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 16),
            child: Text(
              AppLocalizations.of(context)!.quickActions,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
          ),
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  title: AppLocalizations.of(context)!.reportIssue,
                  subtitle: AppLocalizations.of(context)!.reportNewProblem,
                  icon: Icons.add_circle_outline,
                  color: Colors.red.shade600,
                  onTap: () => _navigateToReportIssue(),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionCard(
                  title: AppLocalizations.of(context)!.viewHistory,
                  subtitle: AppLocalizations.of(context)!.checkYourReports,
                  icon: Icons.history_rounded,
                  color: Colors.blue.shade600,
                  onTap: () => _navigateToHistory(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  title: AppLocalizations.of(context)!.emergency,
                  subtitle: AppLocalizations.of(context)!.reportUrgentIssues,
                  icon: Icons.emergency_outlined,
                  color: Colors.red.shade700,
                  onTap: () => _showEmergencyDialog(),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionCard(
                  title: AppLocalizations.of(context)!.helpCenter,
                  subtitle: AppLocalizations.of(context)!.getSupport,
                  icon: Icons.help_outline_rounded,
                  color: Colors.green.shade600,
                  onTap: () => _showModernHelpCenter(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(String title, String time, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  time,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
        ],
      ),
    );
  }

  Widget _buildModernDrawer() {
    return Drawer(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.blue.shade700,
              Colors.blue.shade800,
              Colors.indigo.shade900,
            ],
          ),
        ),
        child: Column(
          children: [
            _buildDrawerHeader(),
            Expanded(child: _buildDrawerItems()),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerHeader() {
    return Container(
      padding: const EdgeInsets.only(top: 50, left: 20, right: 20, bottom: 30),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [Colors.white.withOpacity(0.3), Colors.white.withOpacity(0.1)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.white.withOpacity(0.3),
                      blurRadius: 15,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(Icons.person, size: 30, color: Colors.white),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'SmartCity360',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                    StreamBuilder<AuthState>(
                      stream: SupabaseClientManager.client.auth.onAuthStateChange,
                      builder: (context, snapshot) {
                        final user = SupabaseClientManager.client.auth.currentUser;
                        return Text(
                          user?.email ?? 'Not logged in',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.white70,
                          ),
                          overflow: TextOverflow.ellipsis,
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItems() {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Column(
          children: [
            _buildDrawerItem(Icons.home_rounded, AppLocalizations.of(context)!.home, () => Navigator.pop(context)),
            _buildDrawerItem(Icons.report_problem_rounded, AppLocalizations.of(context)!.reportIssue, () {
              Navigator.pop(context);
              _navigateToReportIssue();
            }),
            _buildDrawerItem(Icons.history_rounded, AppLocalizations.of(context)!.history, () {
              Navigator.pop(context);
              _navigateToHistory();
            }),
            _buildDrawerItem(Icons.settings_rounded, AppLocalizations.of(context)!.settings, () {
              Navigator.pop(context);
              _showComingSoon('Settings');
            }),
            _buildDrawerItem(Icons.help_outline_rounded, AppLocalizations.of(context)!.helpSupport, () {
              Navigator.pop(context);
              _showModernHelpCenter();
            }),
            _buildLanguageToggle(),
            const SizedBox(height: 30),
            _buildDrawerItem(
              Icons.logout_rounded,
              AppLocalizations.of(context)!.logout,
                  () {
                Navigator.pop(context);
                _logout();
              },
              isDestructive: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, VoidCallback onTap, {bool isDestructive = false}) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(15),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(15),
              color: isDestructive
                  ? Colors.red.withOpacity(0.1)
                  : Colors.white.withOpacity(0.1),
            ),
            child: Row(
              children: [
                Icon(icon, color: isDestructive ? Colors.red.shade300 : Colors.white, size: 22),
                const SizedBox(width: 16),
                Text(
                  title,
                  style: TextStyle(
                    color: isDestructive ? Colors.red.shade300 : Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageToggle() {
    return Consumer<LanguageProvider>(
      builder: (context, languageProvider, child) {
        return Container(
          margin: const EdgeInsets.symmetric(vertical: 4),
          child: Material(
            color: Colors.transparent,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                color: Colors.white.withOpacity(0.1),
              ),
              child: Row(
                children: [
                  Icon(Icons.language_rounded, color: Colors.white, size: 22),
                  const SizedBox(width: 16),
                  Text(
                    AppLocalizations.of(context)!.language,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () {
                      languageProvider.changeLanguage(
                        languageProvider.isEnglish 
                          ? const Locale('hi') 
                          : const Locale('en')
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        color: Colors.white.withOpacity(0.2),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        languageProvider.isEnglish ? 'हिंदी' : 'English',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // Navigation methods
  void _navigateToReportIssue() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: const CustomAppBar(title: 'Report Issue'),
          body: IssueReportForm(initialImageUrls: _imageUrls),
          floatingActionButton: FloatingActionButton(
            onPressed: _pickImage,
            tooltip: 'Take Photo',
            child: const Icon(Icons.camera_alt),
          ),
        ),
      ),
    );
  }

  void _navigateToHistory() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const Scaffold(
          appBar: CustomAppBar(title: 'Issue History'),
          body: HistoryScreen(),
        ),
      ),
    );
  }

  // Dialog methods
  void _showNotificationsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Notifications'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildNotificationItem('Pothole on Main St has been fixed! 🎉', '5 min ago'),
            _buildNotificationItem('New community update available', '1 hour ago'),
            _buildNotificationItem('Your report #1234 is under review', '2 hours ago'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem(String message, String time) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            message,
            style: const TextStyle(fontSize: 14),
          ),
          const SizedBox(height: 4),
          Text(
            time,
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  void _showEmergencyDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.emergency, color: Colors.red.shade600),
            const SizedBox(width: 8),
            const Text('Emergency Report'),
          ],
        ),
        content: const Text(
          'For life-threatening emergencies, please call 911 immediately.\n\n'
              'Use this feature only for urgent city infrastructure issues that pose immediate safety risks.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _navigateToReportIssue();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              foregroundColor: Colors.white,
            ),
            child: const Text('Report Emergency'),
          ),
        ],
      ),
    );
  }

  void _showModernHelpCenter() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.6,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
          ),
          child: Column(
            children: [
              // Handle Bar
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.blue.shade50, Colors.white],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.blue.shade400, Colors.blue.shade600],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blue.shade200,
                            blurRadius: 15,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.support_agent, color: Colors.white, size: 32),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Help & Support Center',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[800],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'We\'re here to help you 24/7',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),

              // Content
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Quick Actions
                    _buildHelpSection(
                      'Quick Actions',
                      [
                        _buildInteractiveHelpCard(
                          'Live Chat Support',
                          'Chat with our support team',
                          Icons.chat_bubble_outline,
                          Colors.green,
                              () => _startLiveChat(),
                        ),
                        _buildInteractiveHelpCard(
                          'Call Support',
                          'Speak with a representative',
                          Icons.phone_outlined,
                          Colors.blue,
                              () => _callSupport(),
                        ),
                        _buildInteractiveHelpCard(
                          'Email Support',
                          'Send us your questions',
                          Icons.email_outlined,
                          Colors.orange,
                              () => _emailSupport(),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Resources
                    _buildHelpSection(
                      'Resources',
                      [
                        _buildInteractiveHelpCard(
                          'User Guide',
                          'Learn how to use SmartCity360',
                          Icons.menu_book_outlined,
                          Colors.purple,
                              () => _openUserGuide(),
                        ),
                        _buildInteractiveHelpCard(
                          'Video Tutorials',
                          'Watch step-by-step guides',
                          Icons.play_circle_outline,
                          Colors.red,
                              () => _openVideoTutorials(),
                        ),
                        _buildInteractiveHelpCard(
                          'FAQs',
                          'Find answers to common questions',
                          Icons.quiz_outlined,
                          Colors.indigo,
                              () => _openFAQs(),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Emergency Info
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.red.shade50, Colors.red.shade100],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.red.shade600,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.emergency, color: Colors.white, size: 20),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                'Emergency Information',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _buildEmergencyContact('Police', '100', Icons.local_police),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildEmergencyContact('Fire Dept', '101', Icons.local_fire_department),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHelpSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
        const SizedBox(height: 16),
        ...children,
      ],
    );
  }

  Widget _buildInteractiveHelpCard(
      String title,
      String subtitle,
      IconData icon,
      Color color,
      VoidCallback onTap,
      ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }

  Widget _buildEmergencyContact(String title, String number, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.red.shade600, size: 24),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            number,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.red.shade600,
            ),
          ),
        ],
      ),
    );
  }

  // Helper methods for help center actions
  void _startLiveChat() {
    _showComingSoon('Live Chat Support');
  }

  void _callSupport() {
    _showComingSoon('Call Support');
  }

  void _emailSupport() {
    _showComingSoon('Email Support');
  }

  void _openUserGuide() {
    _showComingSoon('User Guide');
  }

  void _openVideoTutorials() {
    _showComingSoon('Video Tutorials');
  }

  void _openFAQs() {
    _showComingSoon('FAQs');
  }

  void _showComingSoon(String feature) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.construction, color: Colors.orange.shade600),
            const SizedBox(width: 8),
            const Text('Coming Soon'),
          ],
        ),
        content: Text('$feature feature is coming soon! Stay tuned for updates.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}