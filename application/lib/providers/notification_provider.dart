import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/notification_service.dart';

class NotificationItem {
  final String id;
  final String title;
  final String body;
  final DateTime timestamp;
  final String type;
  final Map<String, dynamic>? data;
  final bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.timestamp,
    required this.type,
    this.data,
    this.isRead = false,
  });

  NotificationItem copyWith({
    String? id,
    String? title,
    String? body,
    DateTime? timestamp,
    String? type,
    Map<String, dynamic>? data,
    bool? isRead,
  }) {
    return NotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      timestamp: timestamp ?? this.timestamp,
      type: type ?? this.type,
      data: data ?? this.data,
      isRead: isRead ?? this.isRead,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'timestamp': timestamp.toIso8601String(),
      'type': type,
      'data': data,
      'isRead': isRead,
    };
  }

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'],
      title: json['title'],
      body: json['body'],
      timestamp: DateTime.parse(json['timestamp']),
      type: json['type'],
      data: json['data'],
      isRead: json['isRead'] ?? false,
    );
  }
}

class NotificationProvider extends ChangeNotifier {
  final List<NotificationItem> _notifications = [];
  bool _initialized = false;

  List<NotificationItem> get notifications => List.unmodifiable(_notifications);
  int get unreadCount => _notifications.where((n) => !n.isRead).length;
  bool get hasUnread => unreadCount > 0;

  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Initialize notification service
      await NotificationService().initialize();
      
      // Set up notification tap callback
      NotificationService.onNotificationTapped = _handleNotificationTapped;
      
      // Load saved notifications
      await _loadNotifications();
      
      // Add some sample notifications for demonstration
      await _addSampleNotifications();
      
      _initialized = true;
      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('Error initializing notification provider: $e');
      }
    }
  }

  void _handleNotificationTapped(String? payload) {
    if (payload != null) {
      try {
        final data = jsonDecode(payload);
        final type = data['type'] as String?;
        
        if (kDebugMode) {
          print('Notification tapped: $type');
        }
        
        // Handle different notification types
        switch (type) {
          case 'issue_update':
            // Navigate to issue details
            break;
          case 'emergency':
            // Show emergency details
            break;
          case 'community_update':
            // Navigate to community updates
            break;
          case 'maintenance':
            // Show maintenance details
            break;
        }
      } catch (e) {
        if (kDebugMode) {
          print('Error handling notification tap: $e');
        }
      }
    }
  }

  Future<void> _loadNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final notificationsJson = prefs.getStringList('notifications') ?? [];
      
      _notifications.clear();
      for (final json in notificationsJson) {
        final notification = NotificationItem.fromJson(jsonDecode(json));
        _notifications.add(notification);
      }
      
      // Sort by timestamp (newest first)
      _notifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    } catch (e) {
      if (kDebugMode) {
        print('Error loading notifications: $e');
      }
    }
  }

  Future<void> _saveNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final notificationsJson = _notifications
          .map((n) => jsonEncode(n.toJson()))
          .toList();
      
      await prefs.setStringList('notifications', notificationsJson);
    } catch (e) {
      if (kDebugMode) {
        print('Error saving notifications: $e');
      }
    }
  }

  Future<void> addNotification(NotificationItem notification) async {
    _notifications.insert(0, notification);
    await _saveNotifications();
    notifyListeners();
  }

  Future<void> markAsRead(String notificationId) async {
    final index = _notifications.indexWhere((n) => n.id == notificationId);
    if (index != -1) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
      await _saveNotifications();
      notifyListeners();
    }
  }

  Future<void> markAllAsRead() async {
    for (int i = 0; i < _notifications.length; i++) {
      _notifications[i] = _notifications[i].copyWith(isRead: true);
    }
    await _saveNotifications();
    notifyListeners();
  }

  Future<void> deleteNotification(String notificationId) async {
    _notifications.removeWhere((n) => n.id == notificationId);
    await _saveNotifications();
    notifyListeners();
  }

  Future<void> clearAllNotifications() async {
    _notifications.clear();
    await _saveNotifications();
    notifyListeners();
  }

  // Methods to show different types of notifications
  Future<void> showIssueUpdateNotification({
    required String issueTitle,
    required String status,
    required String issueId,
  }) async {
    // Show local notification
    await NotificationService().showIssueUpdateNotification(
      issueTitle: issueTitle,
      status: status,
      issueId: issueId,
    );

    // Add to notification list
    final notification = NotificationItem(
      id: '${issueId}_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Issue Update: $issueTitle',
      body: 'Your reported issue status has been updated to: $status',
      timestamp: DateTime.now(),
      type: 'issue_update',
      data: {
        'issueId': issueId,
        'status': status,
      },
    );

    await addNotification(notification);
  }

  Future<void> showEmergencyAlert({
    required String message,
    required String location,
  }) async {
    // Show local notification
    await NotificationService().showEmergencyAlert(
      message: message,
      location: location,
    );

    // Add to notification list
    final notification = NotificationItem(
      id: 'emergency_${DateTime.now().millisecondsSinceEpoch}',
      title: '🚨 Emergency Alert',
      body: '$message at $location',
      timestamp: DateTime.now(),
      type: 'emergency',
      data: {
        'message': message,
        'location': location,
      },
    );

    await addNotification(notification);
  }

  Future<void> showCommunityUpdate({
    required String title,
    required String message,
  }) async {
    // Show local notification
    await NotificationService().showCommunityUpdate(
      title: title,
      message: message,
    );

    // Add to notification list
    final notification = NotificationItem(
      id: 'community_${DateTime.now().millisecondsSinceEpoch}',
      title: '📢 Community Update',
      body: message,
      timestamp: DateTime.now(),
      type: 'community_update',
      data: {
        'title': title,
        'message': message,
      },
    );

    await addNotification(notification);
  }

  Future<void> _addSampleNotifications() async {
    // Only add samples if no notifications exist
    if (_notifications.isEmpty) {
      final sampleNotifications = [
        NotificationItem(
          id: 'sample_1',
          title: 'Welcome to SmartCity! 🎉',
          body: 'Thank you for joining our community. Start reporting issues and making your city better!',
          timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
          type: 'welcome',
        ),
        NotificationItem(
          id: 'sample_2',
          title: 'Issue Update: Pothole on Main St',
          body: 'Your reported pothole has been fixed! Thank you for making your city better.',
          timestamp: DateTime.now().subtract(const Duration(hours: 1)),
          type: 'issue_update',
          data: {'issueId': '1234', 'status': 'Fixed'},
        ),
        NotificationItem(
          id: 'sample_3',
          title: '📢 Community Update',
          body: 'New community guidelines have been published. Check them out in the help section.',
          timestamp: DateTime.now().subtract(const Duration(hours: 2)),
          type: 'community_update',
        ),
      ];

      for (final notification in sampleNotifications) {
        await addNotification(notification);
      }
    }
  }

  // Test notification method
  Future<void> sendTestNotification() async {
    await NotificationService().showNotification(
      id: DateTime.now().millisecondsSinceEpoch,
      title: 'Test Notification',
      body: 'This is a test notification from SmartCity app!',
      payload: jsonEncode({'type': 'test'}),
    );

    final notification = NotificationItem(
      id: 'test_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Test Notification',
      body: 'This is a test notification from SmartCity app!',
      timestamp: DateTime.now(),
      type: 'test',
    );

    await addNotification(notification);
  }
}