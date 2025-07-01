import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../widgets/custom_app_bar.dart';
import '../supabase_client.dart';

class Issue {
  final String id;
  final String title;
  final String description;
  final String status;
  final String category;
  final DateTime createdAt;
  final List<String> imageUrls;

  Issue({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.category,
    required this.createdAt,
    required this.imageUrls,
  });

  factory Issue.fromMap(Map<String, dynamic> map) {
    print('DEBUG: Creating Issue from map: $map'); // Debug statement

    return Issue(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? 'No Title',
      description: map['description']?.toString() ?? '',
      status: map['status']?.toString() ?? 'open',
      category: map['category']?.toString() ?? 'General',
      createdAt: map['created_at'] != null
          ? DateTime.tryParse(map['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      imageUrls: (map['image_urls'] as List<dynamic>?)
          ?.map((url) => url?.toString() ?? '')
          .where((url) => url.isNotEmpty)
          .toList() ?? [],
    );
  }
}

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Issue> _issues = [];
  bool _isLoading = true;
  bool _isError = false;

  @override
  void initState() {
    super.initState();
    print('DEBUG: HistoryScreen initState called'); // Debug statement
    _fetchIssues();
  }

  Future<void> _fetchIssues() async {
    print('DEBUG: _fetchIssues called'); // Debug statement

    try {
      setState(() {
        _isLoading = true;
        _isError = false;
      });

      final userId = SupabaseClientManager.client.auth.currentUser?.id;
      print('DEBUG: Current user ID: $userId'); // Debug statement

      if (userId == null) {
        throw Exception('User not authenticated');
      }

      print('DEBUG: Fetching issues from Supabase...'); // Debug statement

      final response = await SupabaseClientManager.client
          .from('issues')
          .select('''
            id,
            title,
            description,
            status,
            category,
            created_at,
            image_urls
          ''')
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      print('DEBUG: Raw response from Supabase: $response'); // Debug statement

      print('DEBUG: Found ${response.length} issues in response'); // Debug statement

      final issues = response.map((issue) {
        print('DEBUG: Processing issue: $issue'); // Debug statement
        return Issue.fromMap(issue);
      }).toList();

      print('DEBUG: Successfully created ${issues.length} Issue objects'); // Debug statement

      if (mounted) {
        setState(() {
          _issues = issues;
          _isLoading = false;
        });
      }
        } catch (e) {
      print('DEBUG: Error in _fetchIssues: $e'); // Debug statement
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isError = true;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error fetching issues: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    print('DEBUG: HistoryScreen build called with ${_issues.length} issues'); // Debug statement
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Issue History',
        automaticallyImplyLeading: false,
      ),
      body: RefreshIndicator(
        onRefresh: () {
          print('DEBUG: RefreshIndicator triggered'); // Debug statement
          return _fetchIssues();
        },
        child: _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    print('DEBUG: _buildContent called with _isLoading: $_isLoading, _isError: $_isError, _issues.length: ${_issues.length}'); // Debug statement

    if (_isLoading) {
      print('DEBUG: Showing loading indicator'); // Debug statement
      return const Center(child: CircularProgressIndicator());
    }

    if (_isError) {
      print('DEBUG: Showing error state'); // Debug statement
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Error loading issues'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                print('DEBUG: Retry button pressed'); // Debug statement
                _fetchIssues();
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_issues.isEmpty) {
      print('DEBUG: Showing empty state'); // Debug statement
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No issues found',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    print('DEBUG: Showing ${_issues.length} issues'); // Debug statement
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _issues.length,
      itemBuilder: (context, index) {
        final issue = _issues[index];
        print('DEBUG: Building issue card for issue ${issue.id}'); // Debug statement
        return _buildIssueCard(issue);
      },
    );
  }

  Widget _buildIssueCard(Issue issue) {
    print('DEBUG: Building card for issue: ${issue.title}'); // Debug statement
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  issue.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(issue.status),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    issue.status.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              issue.description,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    issue.category,
                    style: const TextStyle(
                      fontSize: 12,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  DateFormat.yMMMd().add_jm().format(issue.createdAt),
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
            if (issue.imageUrls.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text(
                'Attachments:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 100,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: issue.imageUrls.length,
                  itemBuilder: (context, index) {
                    final imageUrl = issue.imageUrls[index];
                    print('DEBUG: Loading image $index: $imageUrl'); // Debug statement
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          imageUrl,
                          width: 100,
                          height: 100,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            print('DEBUG: Error loading image $imageUrl: $error'); // Debug statement
                            return Container(
                              width: 100,
                              height: 100,
                              color: Colors.grey[200],
                              child: const Icon(Icons.broken_image),
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'open':
        return Colors.blue;
      case 'in progress':
        return Colors.orange;
      case 'pending':
        return Colors.purple;
      case 'resolved':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}
