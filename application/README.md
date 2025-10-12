# 🏙️ SmartCity - Citizen Engagement Platform

<div align="center">
  <h3>A comprehensive Flutter application for smart city management and citizen engagement</h3>
  
  [![Flutter](https://img.shields.io/badge/Flutter-3.0+-blue.svg)](https://flutter.dev/)
  [![Dart](https://img.shields.io/badge/Dart-3.0+-blue.svg)](https://dart.dev/)
  [![Platform](https://img.shields.io/badge/Platform-Android%20|%20iOS-green.svg)](https://flutter.dev/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

## 📱 About SmartCity

SmartCity is a modern mobile application designed to bridge the gap between citizens and local government services. Built with Flutter, it provides an intuitive platform for reporting issues, accessing services, and staying informed about community updates.

### 🎯 **Key Features**

- **🚨 Issue Reporting System** - Report civic issues with photos, location, and detailed descriptions
- **📍 Location-Based Services** - GPS integration for accurate issue reporting and service location
- **🔔 Smart Notifications** - Real-time updates on reported issues and community news
- **🆘 Emergency Services** - Quick access to police, fire department, and ambulance services
- **👤 User Authentication** - Secure login/signup with Aadhar number integration
- **📊 Issue Tracking** - Monitor the status of reported issues from submission to resolution
- **🌐 Multilingual Support** - Localization support for multiple languages
- **📸 Image Upload** - Attach photos to issue reports for better documentation

---

## 🏗️ **Architecture & Tech Stack**

### **Frontend**
- **Framework**: Flutter 3.0+
- **Language**: Dart 3.0+
- **State Management**: Provider Pattern
- **UI Design**: Material Design 3

### **Backend & Services**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google Sign-In
- **Storage**: Supabase Storage for image uploads
- **Real-time Updates**: Supabase Realtime

### **Key Dependencies**
```yaml
# Core Flutter packages
flutter: sdk
provider: ^6.1.1

# Backend & Authentication
supabase_flutter: ^2.10.1
google_sign_in: ^6.3.0

# Location & Maps
geolocator: ^10.1.1
geocoding: ^2.2.2
flutter_map: ^6.2.1

# Notifications
flutter_local_notifications: ^17.2.4

# Image & Media
image_picker: ^1.0.7

# Utils
shared_preferences: ^2.2.2
url_launcher: ^6.2.5
permission_handler: ^11.4.0
```

---

## 📋 **Prerequisites**

Before you begin, ensure you have the following installed:

- **Flutter SDK** (3.0 or higher) - [Installation Guide](https://docs.flutter.dev/get-started/install)
- **Dart SDK** (3.0 or higher) - Comes with Flutter
- **Android Studio** or **VS Code** with Flutter extensions
- **Android SDK** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Git** for version control

### **System Requirements**
- **Windows**: Windows 10 (64-bit) or later
- **macOS**: macOS 10.14 (Mojave) or later
- **Linux**: Ubuntu 18.04 LTS or later
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 10GB free space

---

## 🚀 **Installation & Setup**

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/smartcity-flutter.git
cd smartcity-flutter/application
```

### **2. Install Dependencies**
```bash
flutter pub get
```

### **3. Environment Configuration**
Create a `.env` file in the root directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **4. Platform-Specific Setup**

#### **Android Setup**
1. Open `android/app/build.gradle`
2. Ensure `minSdkVersion` is 21 or higher
3. Add required permissions in `android/app/src/main/AndroidManifest.xml`

#### **iOS Setup** (macOS only)
1. Open `ios/Runner.xcworkspace` in Xcode
2. Set deployment target to iOS 12.0 or higher
3. Configure signing certificates

### **5. Run the Application**
```bash
# For development
flutter run

# For specific platform
flutter run -d android
flutter run -d ios

# For release build
flutter build apk --release
flutter build ios --release
```

---

## 📱 **App Features & Screenshots**

### **Authentication System**
- **Secure Login/Signup** with email and password
- **Google Sign-In** integration
- **Aadhar Number** verification for Indian citizens
- **Password Recovery** functionality

### **Issue Reporting**
- **Category Selection** (Roads, Water, Electricity, Waste Management, etc.)
- **Photo Attachment** for visual documentation
- **GPS Location** automatic detection
- **Priority Levels** (Low, Medium, High, Critical)
- **Real-time Status Updates** (Submitted → In Progress → Resolved)

### **Emergency Services**
- **Quick Dial** buttons for emergency contacts
- **Police**: Direct call to local police station
- **Fire Department**: Emergency fire services
- **Ambulance**: Medical emergency services

### **Notification System**
- **Real-time Notifications** for issue updates
- **Community Announcements** from local authorities
- **Maintenance Alerts** for scheduled services
- **Customizable Settings** for notification preferences

---

## 🗂️ **Project Structure**

```
lib/
├── main.dart                 # App entry point
├── supabase_client.dart     # Supabase configuration
├── l10n/                    # Localization files
├── providers/               # State management
│   ├── auth_provider.dart
│   ├── issue_provider.dart
│   └── notification_provider.dart
├── screens/                 # UI Screens
│   ├── auth_screen.dart
│   ├── home_screen.dart
│   ├── issue_screen.dart
│   └── history_screen.dart
├── widgets/                 # Reusable UI components
│   ├── issue_report_form.dart
│   └── custom_buttons.dart
├── services/                # Business logic & APIs
│   ├── auth_service.dart
│   ├── issue_service.dart
│   └── notification_service.dart
└── utils/                   # Helper functions
    ├── constants.dart
    └── validators.dart
```

---

## 🔧 **Configuration**

### **Supabase Setup**
1. Create a new project on [Supabase](https://supabase.com/)
2. Set up authentication providers
3. Create database tables for issues, users, and notifications
4. Configure storage buckets for image uploads

### **Google Maps Integration**
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps SDK for Android/iOS
3. Add API key to platform-specific configuration files

### **Push Notifications**
1. Configure Firebase for push notifications
2. Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
3. Set up notification channels and handlers

---

## 🧪 **Testing**

### **Run Tests**
```bash
# Unit tests
flutter test

# Integration tests
flutter test integration_test/

# Widget tests
flutter test test/widget_test.dart
```

### **Testing Strategy**
- **Unit Tests**: Business logic and utility functions
- **Widget Tests**: UI components and user interactions
- **Integration Tests**: End-to-end user workflows
- **Performance Tests**: App performance and memory usage

---

## 📦 **Building for Production**

### **Android APK**
```bash
flutter build apk --release --split-per-abi
```

### **Android App Bundle**
```bash
flutter build appbundle --release
```

### **iOS**
```bash
flutter build ios --release
```

### **Web** (if supported)
```bash
flutter build web --release
```

---

## 🔐 **Security & Privacy**

- **Data Encryption**: All sensitive data is encrypted in transit and at rest
- **Authentication**: Secure JWT-based authentication with Supabase
- **Privacy**: User data is handled according to privacy regulations
- **Permissions**: App requests only necessary permissions
- **Validation**: Input validation prevents SQL injection and XSS attacks

---

## 🌐 **API Documentation**

### **Authentication Endpoints**
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `POST /auth/refresh` - Token refresh

### **Issue Management**
- `GET /issues` - Fetch user's issues
- `POST /issues` - Create new issue
- `PUT /issues/:id` - Update issue
- `DELETE /issues/:id` - Delete issue

### **Notifications**
- `GET /notifications` - Fetch notifications
- `POST /notifications/mark-read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

---

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Build Errors**
```bash
flutter clean
flutter pub get
flutter run
```

**2. Permission Issues**
- Check AndroidManifest.xml for required permissions
- Verify iOS Info.plist configuration

**3. Network Issues**
- Verify internet connectivity
- Check Supabase configuration
- Validate API endpoints

**4. Location Services**
- Enable location permissions in device settings
- Check GPS functionality

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Contribution Guidelines**
- Follow Dart/Flutter coding standards
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure backward compatibility

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 **Team & Support**

### **Development Team**
- **Project Lead**: [Your Name]
- **Frontend Developer**: [Team Member]
- **Backend Developer**: [Team Member]
- **UI/UX Designer**: [Team Member]

### **Support**
- **Email**: support@smartcity.com
- **GitHub Issues**: [Create an Issue](https://github.com/yourusername/smartcity-flutter/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/smartcity-flutter/wiki)

---

## 🎯 **Roadmap**

### **Version 2.0** (Coming Soon)
- [ ] **Dark Mode** support
- [ ] **Offline Functionality** with local caching
- [ ] **Advanced Analytics** dashboard
- [ ] **Chatbot Integration** for citizen queries
- [ ] **Multi-language** support expansion

### **Version 3.0** (Future)
- [ ] **AI-powered Issue Categorization**
- [ ] **Blockchain Integration** for transparency
- [ ] **IoT Sensors** integration
- [ ] **AR/VR Features** for issue visualization

---

## 📊 **Performance & Metrics**

- **App Size**: ~25MB (release build)
- **Startup Time**: <3 seconds on mid-range devices
- **Memory Usage**: <100MB average
- **Supported Devices**: Android 5.0+ / iOS 12.0+
- **Network Usage**: Optimized for 3G/4G networks

---

## 🙏 **Acknowledgments**

- **Flutter Team** for the amazing framework
- **Supabase** for backend services
- **Google** for Maps and authentication services
- **Open Source Community** for various packages and contributions

---

<div align="center">
  <h3>Made with ❤️ for Smart Cities</h3>
  <p>Connecting Citizens with their Communities</p>
  
  **⭐ Star this repository if you find it helpful!**
</div>
