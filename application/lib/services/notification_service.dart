import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  static const String channelId = 'smartcity_channel';
  static const String channelName = 'SmartCity Notifications';
  static const String channelDescription = 'Notifications for SmartCity app updates and alerts';

  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  
  // Callback for when notification is tapped
  static Function(String?)? onNotificationTapped;

  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Android initialization
      const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      
      // iOS initialization
      const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      const InitializationSettings initSettings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      await _notifications.initialize(
        initSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          if (kDebugMode) {
            print('Notification tapped: ${response.payload}');
          }
          onNotificationTapped?.call(response.payload);
        },
      );

      // Create notification channel for Android
      await _createNotificationChannel();
      
      // Request permissions
      await _requestPermissions();
      
      _initialized = true;
      if (kDebugMode) {
        print('Notification service initialized successfully');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error initializing notifications: $e');
      }
    }
  }

  Future<void> _createNotificationChannel() async {
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      channelId,
      channelName,
      description: channelDescription,
      importance: Importance.high,
      enableVibration: true,
      playSound: true,
    );

    await _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }

  Future<bool> _requestPermissions() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      final status = await Permission.notification.request();
      return status.isGranted;
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      final result = await _notifications
          .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>()
          ?.requestPermissions(
            alert: true,
            badge: true,
            sound: true,
          );
      return result ?? false;
    }
    return true;
  }

  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    NotificationPriority priority = NotificationPriority.high,
  }) async {
    if (!_initialized) {
      await initialize();
    }

    try {
      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        channelId,
        channelName,
        channelDescription: channelDescription,
        importance: Importance.high,
        priority: Priority.high,
        showWhen: true,
        enableVibration: true,
        playSound: true,
        icon: '@mipmap/ic_launcher',
      );

      const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const NotificationDetails platformDetails = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      await _notifications.show(
        id,
        title,
        body,
        platformDetails,
        payload: payload,
      );

      if (kDebugMode) {
        print('Notification shown: $title');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error showing notification: $e');
      }
    }
  }

  Future<void> showScheduledNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledTime,
    String? payload,
  }) async {
    if (!_initialized) {
      await initialize();
    }

    try {
      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        channelId,
        channelName,
        channelDescription: channelDescription,
        importance: Importance.high,
        priority: Priority.high,
        showWhen: true,
        enableVibration: true,
        playSound: true,
        icon: '@mipmap/ic_launcher',
      );

      const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const NotificationDetails platformDetails = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      // For now, let's just show immediate notifications
      // Scheduled notifications require timezone package configuration
      await showNotification(
        id: id,
        title: title,
        body: body,
        payload: payload,
      );

      if (kDebugMode) {
        print('Scheduled notification: $title for ${scheduledTime.toString()}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error scheduling notification: $e');
      }
    }
  }

  Future<void> cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }

  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _notifications.pendingNotificationRequests();
  }

  // Predefined notification types for SmartCity app
  Future<void> showIssueUpdateNotification({
    required String issueTitle,
    required String status,
    required String issueId,
  }) async {
    await showNotification(
      id: issueId.hashCode,
      title: 'Issue Update: $issueTitle',
      body: 'Your reported issue status has been updated to: $status',
      payload: jsonEncode({
        'type': 'issue_update',
        'issueId': issueId,
        'status': status,
      }),
    );
  }

  Future<void> showEmergencyAlert({
    required String message,
    required String location,
  }) async {
    await showNotification(
      id: DateTime.now().millisecondsSinceEpoch,
      title: '🚨 Emergency Alert',
      body: '$message at $location',
      payload: jsonEncode({
        'type': 'emergency',
        'message': message,
        'location': location,
      }),
      priority: NotificationPriority.max,
    );
  }

  Future<void> showCommunityUpdate({
    required String title,
    required String message,
  }) async {
    await showNotification(
      id: DateTime.now().millisecondsSinceEpoch,
      title: '📢 Community Update',
      body: message,
      payload: jsonEncode({
        'type': 'community_update',
        'title': title,
        'message': message,
      }),
    );
  }

  Future<void> showMaintenanceNotification({
    required String area,
    required String workType,
    required DateTime scheduledTime,
  }) async {
    await showNotification(
      id: area.hashCode,
      title: '🔧 Scheduled Maintenance',
      body: '$workType scheduled in $area area',
      payload: jsonEncode({
        'type': 'maintenance',
        'area': area,
        'workType': workType,
        'scheduledTime': scheduledTime.toIso8601String(),
      }),
    );
  }
}

enum NotificationPriority {
  min,
  low,
  default_,
  high,
  max,
}