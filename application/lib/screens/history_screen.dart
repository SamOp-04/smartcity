import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final SupabaseClient _client = Supabase.instance.client;
  late Future<List<Map<String, dynamic>>> _userIssues;

  @override
  void initState() {
    super.initState();
    _userIssues = _fetchUserIssues();
  }

  Future<List<Map<String, dynamic>>> _fetchUserIssues() async {
    final userId = _client.auth.currentUser?.id;
    print('🔍 Current User ID: $userId');

    if (userId == null) {
      debugPrint("⚠️ No user logged in.");
      return [];
    }

    try {
      final response = await _client
          .from('issues')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      print('✅ Issues fetched: ${response.length}');
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint("❌ Error fetching issues: $e");
      return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('My Submitted Issues'),
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _userIssues,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final issues = snapshot.data ?? [];

          if (issues.isEmpty) {
            return const Center(child: Text('No issues submitted yet.'));
          }

          return ListView.builder(
            itemCount: issues.length,
            itemBuilder: (context, index) {
              final issue = issues[index];
              final title = issue['title'] ?? 'No Title';
              final status = issue['status'] ?? 'Unknown';
              final address = issue['address'] ?? 'No Address';
              final createdAt = DateTime.tryParse(issue['created_at'] ?? '');
              final imageUrls = List<String>.from(issue['image_urls'] ?? []);
              final description = issue['description'] ?? '';
              final category = issue['category'] ?? 'General';

              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: ListTile(
                  leading: imageUrls.isNotEmpty
                      ? ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Image.network(
                      imageUrls.first,
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                      const Icon(Icons.image_not_supported),
                    ),
                  )
                      : const Icon(Icons.image_not_supported, size: 40),
                  title: Text(title,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (description.isNotEmpty)
                        Text('📝 $description',
                            style: const TextStyle(fontSize: 13)),
                      Text('📂 Category: $category',
                          style: const TextStyle(fontSize: 13)),
                      const SizedBox(height: 4),
                      Text('📍 $address',
                          style: const TextStyle(fontSize: 13)),
                      if (createdAt != null)
                        Text(
                          '🕒 ${createdAt.toLocal().toString().split('.').first}',
                          style: const TextStyle(fontSize: 13),
                        ),
                      Text('🟡 Status: $status',
                          style: const TextStyle(fontSize: 13)),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
