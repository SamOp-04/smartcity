import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../l10n/app_localizations.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/issue_report_form.dart';

import '../supabase_client.dart';
import '../screens/history_screen.dart';
import '../providers/language_provider.dart';
import '../providers/notification_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _checkAuthState();
    _initializeNotifications();
  }

  Future<void> _initializeNotifications() async {
    final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);
    await notificationProvider.initialize();
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
      floatingActionButton: _buildFloatingCameraButton(),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
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
        Consumer<NotificationProvider>(
          builder: (context, notificationProvider, child) {
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              child: Material(
                borderRadius: BorderRadius.circular(12),
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => _showNotificationsDialog(),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    child: Stack(
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          child: Icon(
                            notificationProvider.hasUnread 
                                ? Icons.notifications_active
                                : Icons.notifications_outlined,
                            color: notificationProvider.hasUnread 
                                ? Colors.blue.shade600
                                : Colors.grey.shade600,
                            size: 24,
                          ),
                        ),
                        if (notificationProvider.hasUnread)
                          Positioned(
                            right: 0,
                            top: 0,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    Colors.red.shade400,
                                    Colors.red.shade600,
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: Colors.white,
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.red.withOpacity(0.3),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              constraints: const BoxConstraints(
                                minWidth: 20,
                                minHeight: 20,
                              ),
                              child: Text(
                                notificationProvider.unreadCount > 99 
                                    ? '99+' 
                                    : '${notificationProvider.unreadCount}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
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
              _showAppSettings();
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
                      final newLocale = languageProvider.isEnglish 
                          ? const Locale('hi') 
                          : const Locale('en');
                      languageProvider.changeLanguage(newLocale, context);
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
        builder: (context) => const Scaffold(
          appBar: CustomAppBar(title: 'Report Issue'),
          body: IssueReportForm(),
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
      barrierColor: Colors.black.withOpacity(0.5),
      builder: (context) => Consumer<NotificationProvider>(
        builder: (context, notificationProvider, child) {
          return Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            elevation: 16,
            child: Container(
              width: MediaQuery.of(context).size.width * 0.9,
              height: MediaQuery.of(context).size.height * 0.8,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white,
                    Colors.blue.shade50,
                  ],
                ),
              ),
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.blue.shade600,
                          Colors.blue.shade800,
                        ],
                      ),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(20),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.notifications_active,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Notifications',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (notificationProvider.hasUnread)
                                Text(
                                  '${notificationProvider.unreadCount} unread',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 14,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        if (notificationProvider.hasUnread)
                          TextButton.icon(
                            onPressed: () async {
                              await notificationProvider.markAllAsRead();
                            },
                            icon: const Icon(
                              Icons.done_all,
                              color: Colors.white,
                              size: 16,
                            ),
                            label: const Text(
                              'Mark all read',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                              ),
                            ),
                            style: TextButton.styleFrom(
                              backgroundColor: Colors.white.withOpacity(0.2),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  
                  // Content
                  Expanded(
                    child: notificationProvider.notifications.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(24),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade100,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.notifications_none_rounded,
                                    size: 64,
                                    color: Colors.grey.shade400,
                                  ),
                                ),
                                const SizedBox(height: 24),
                                Text(
                                  'No notifications yet',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'When you have notifications, they\'ll appear here',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey.shade500,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                            itemCount: notificationProvider.notifications.length,
                            itemBuilder: (context, index) {
                              final notification = notificationProvider.notifications[index];
                              return _buildNotificationItem(
                                notification,
                                notificationProvider,
                              );
                            },
                          ),
                  ),
                  
                  // Footer Actions
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: const BorderRadius.vertical(
                        bottom: Radius.circular(20),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, -2),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // First row of buttons
                        Row(
                          children: [
                            if (notificationProvider.notifications.isNotEmpty)
                              Expanded(
                                child: Container(
                                  height: 45,
                                  child: ElevatedButton.icon(
                                    onPressed: () async {
                                      await notificationProvider.clearAllNotifications();
                                    },
                                    icon: Icon(
                                      Icons.clear_all_rounded,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    label: const Text(
                                      'Clear All',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.red.shade500,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      elevation: 2,
                                    ),
                                  ),
                                ),
                              ),
                            if (notificationProvider.notifications.isNotEmpty)
                              const SizedBox(width: 8),
                            Expanded(
                              child: Container(
                                height: 45,
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    notificationProvider.sendTestNotification();
                                  },
                                  icon: Icon(
                                    Icons.science_rounded,
                                    color: Colors.white,
                                    size: 16,
                                  ),
                                  label: const Text(
                                    'Test',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.orange.shade500,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    elevation: 2,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 8),
                        
                        // Close button
                        Container(
                          width: double.infinity,
                          height: 45,
                          child: ElevatedButton.icon(
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(
                              Icons.close_rounded,
                              color: Colors.white,
                              size: 16,
                            ),
                            label: const Text(
                              'Close',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue.shade600,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 2,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildNotificationItem(NotificationItem notification, NotificationProvider provider) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 8),
      child: Material(
        elevation: notification.isRead ? 2 : 8,
        borderRadius: BorderRadius.circular(16),
        shadowColor: Colors.blue.withOpacity(0.3),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: notification.isRead 
                ? LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.grey.shade50,
                      Colors.grey.shade100,
                    ],
                  )
                : LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white,
                      Colors.blue.shade50,
                    ],
                  ),
            border: Border.all(
              color: notification.isRead ? Colors.grey.shade200 : Colors.blue.shade200,
              width: 1,
            ),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () async {
              if (!notification.isRead) {
                await provider.markAsRead(notification.id);
              }
            },
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon with animation
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: notification.isRead 
                            ? [Colors.grey.shade300, Colors.grey.shade400]
                            : [Colors.blue.shade400, Colors.blue.shade600],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: notification.isRead 
                          ? null
                          : [
                              BoxShadow(
                                color: Colors.blue.withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                    ),
                    child: Icon(
                      _getNotificationIcon(notification.type),
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  
                  const SizedBox(width: 16),
                  
                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                notification.title,
                                style: TextStyle(
                                  fontWeight: notification.isRead ? FontWeight.w500 : FontWeight.bold,
                                  color: notification.isRead ? Colors.grey.shade600 : Colors.black87,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            if (!notification.isRead)
                              Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: Colors.red.shade500,
                                  shape: BoxShape.circle,
                                ),
                                child: const SizedBox(width: 8, height: 8),
                              ),
                          ],
                        ),
                        
                        const SizedBox(height: 8),
                        
                        Text(
                          notification.body,
                          style: TextStyle(
                            color: notification.isRead ? Colors.grey.shade500 : Colors.grey.shade700,
                            fontSize: 14,
                            height: 1.4,
                          ),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                        
                        const SizedBox(height: 12),
                        
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade100,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: Colors.blue.shade300,
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                notification.type.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.blue.shade700,
                                ),
                              ),
                            ),
                            
                            Text(
                              _getTimeAgo(notification.timestamp),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade400,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  // Action menu
                  PopupMenuButton<String>(
                    onSelected: (value) async {
                      if (value == 'read') {
                        await provider.markAsRead(notification.id);
                      } else if (value == 'delete') {
                        await provider.deleteNotification(notification.id);
                      }
                    },
                    icon: Icon(
                      Icons.more_vert,
                      color: Colors.grey.shade400,
                      size: 18,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 8,
                    itemBuilder: (context) => [
                      if (!notification.isRead)
                        PopupMenuItem(
                          value: 'read',
                          child: Row(
                            children: [
                              Icon(
                                Icons.mark_email_read_outlined,
                                size: 18,
                                color: Colors.green.shade600,
                              ),
                              const SizedBox(width: 8),
                              const Text('Mark as read'),
                            ],
                          ),
                        ),
                      PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            Icon(
                              Icons.delete_outline,
                              size: 18,
                              color: Colors.red.shade600,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Delete',
                              style: TextStyle(color: Colors.red.shade600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _getTimeAgo(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type.toLowerCase()) {
      case 'alert':
        return Icons.warning_rounded;
      case 'info':
        return Icons.info_rounded;
      case 'success':
        return Icons.check_circle_rounded;
      case 'error':
        return Icons.error_rounded;
      case 'reminder':
        return Icons.schedule_rounded;
      case 'update':
        return Icons.system_update_rounded;
      case 'message':
        return Icons.message_rounded;
      case 'emergency':
        return Icons.emergency_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  void _showEmergencyDialog() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.red.shade50,
                Colors.red.shade100,
              ],
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade600,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.emergency,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Emergency Contacts',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.red.shade800,
                          ),
                        ),
                        Text(
                          'Tap to call emergency services',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.red.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Emergency Contacts
              _buildEmergencyContactCard(
                'Police',
                '100',
                Icons.local_police,
                Colors.blue.shade600,
              ),
              const SizedBox(height: 12),
              _buildEmergencyContactCard(
                'Fire Department',
                '101',
                Icons.local_fire_department,
                Colors.red.shade600,
              ),
              const SizedBox(height: 12),
              _buildEmergencyContactCard(
                'Ambulance',
                '108',
                Icons.local_hospital,
                Colors.green.shade600,
              ),
              
              const SizedBox(height: 24),
              
              // Close button
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    backgroundColor: Colors.grey.shade200,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Close',
                    style: TextStyle(
                      color: Colors.grey.shade700,
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
  }

  Widget _buildEmergencyContactCard(String title, String number, IconData icon, Color color) {
    return Container(
      width: double.infinity,
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        elevation: 2,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _makePhoneCall(number),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    icon,
                    color: color,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey.shade800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Call $number',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.phone,
                  color: color,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
    try {
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri);
      } else {
        if (mounted) {
          _showSnackBar('Unable to make phone call', isError: true);
        }
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar('Error making phone call: ${e.toString()}', isError: true);
      }
    }
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

  void _showAppSettings() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.5,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.symmetric(vertical: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            
            // Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Icon(
                    Icons.settings,
                    color: Theme.of(context).colorScheme.primary,
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    AppLocalizations.of(context)!.settings,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),
            
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Consumer<LanguageProvider>(
                  builder: (context, languageProvider, child) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Language Settings
                        Text(
                          'Language Settings',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 12),
                        
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: ListTile(
                              leading: const Icon(Icons.language),
                              title: const Text('App Language'),
                              subtitle: Text(languageProvider.currentLanguageNativeName),
                              trailing: Switch(
                                value: languageProvider.isHindi,
                                onChanged: (value) {
                                  final newLocale = value 
                                      ? const Locale('hi') 
                                      : const Locale('en');
                                  languageProvider.changeLanguage(newLocale, context);
                                },
                              ),
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 20),
                        
                        // App Info
                        Text(
                          'App Information',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 12),
                        
                        Card(
                          child: Column(
                            children: [
                              ListTile(
                                leading: const Icon(Icons.info_outline),
                                title: const Text('Version'),
                                subtitle: const Text('1.0.0'),
                              ),
                              ListTile(
                                leading: const Icon(Icons.privacy_tip_outlined),
                                title: const Text('Privacy Policy'),
                                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                                onTap: () {
                                  // Handle privacy policy tap
                                },
                              ),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 40),
                      ],
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingCameraButton() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.orange.shade500,
            Colors.orange.shade700,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.orange.shade200.withOpacity(0.5),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () async {
            try {
              final picker = ImagePicker();
              final pickedFile = await picker.pickImage(
                source: ImageSource.camera,
                imageQuality: 80,
              );

              if (pickedFile != null && mounted) {
                // Navigate to issue report form with the captured image
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => Scaffold(
                      backgroundColor: Colors.grey[50],
                      appBar: AppBar(
                        title: Text(AppLocalizations.of(context)!.submitReport),
                        backgroundColor: Colors.blue.shade600,
                        foregroundColor: Colors.white,
                        elevation: 0,
                      ),
                      body: IssueReportForm(initialImageFile: pickedFile),
                    ),
                  ),
                );
              }
            } catch (e) {
              if (mounted) {
                _showSnackBar('Error taking photo: ${e.toString()}', isError: true);
              }
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.camera_alt,
                  color: Colors.white,
                  size: 24,
                ),
                const SizedBox(height: 4),
                Text(
                  'Quick\nCamera',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    height: 1.1,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}