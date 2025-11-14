import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_hi.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('hi'),
  ];

  /// Title of the application
  ///
  /// In en, this message translates to:
  /// **'Issue Reporter'**
  String get appTitle;

  /// Home menu item
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// Report Issue menu item
  ///
  /// In en, this message translates to:
  /// **'Report Issue'**
  String get reportIssue;

  /// History menu item
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get history;

  /// Settings menu item
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// Help and Support menu item
  ///
  /// In en, this message translates to:
  /// **'Help & Support'**
  String get helpSupport;

  /// Logout menu item
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// Language selection
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// English language option
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// Hindi language option
  ///
  /// In en, this message translates to:
  /// **'हिंदी'**
  String get hindi;

  /// Issues title
  ///
  /// In en, this message translates to:
  /// **'Issues'**
  String get issues;

  /// Search issues placeholder
  ///
  /// In en, this message translates to:
  /// **'Search issues'**
  String get searchIssues;

  /// Newest filter option
  ///
  /// In en, this message translates to:
  /// **'Newest'**
  String get newest;

  /// Nearest filter option
  ///
  /// In en, this message translates to:
  /// **'Nearest'**
  String get nearest;

  /// Category label
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get category;

  /// Select category placeholder
  ///
  /// In en, this message translates to:
  /// **'Select Category'**
  String get selectCategory;

  /// Description label
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get description;

  /// Describe issue placeholder
  ///
  /// In en, this message translates to:
  /// **'Describe the issue'**
  String get describeIssue;

  /// Location label
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get location;

  /// Example issue title
  ///
  /// In en, this message translates to:
  /// **'Pothole on main road'**
  String get potholeMainRoad;

  /// Example issue title
  ///
  /// In en, this message translates to:
  /// **'Broken streetlight'**
  String get brokenStreetlight;

  /// Open status
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get open;

  /// In progress status
  ///
  /// In en, this message translates to:
  /// **'In Progress'**
  String get inProgress;

  /// Resolved status
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get resolved;

  /// Track report title
  ///
  /// In en, this message translates to:
  /// **'Track Report'**
  String get trackReport;

  /// Report submitted status
  ///
  /// In en, this message translates to:
  /// **'Report Submitted'**
  String get reportSubmitted;

  /// View resolution proof button
  ///
  /// In en, this message translates to:
  /// **'View Resolution Proof'**
  String get viewResolutionProof;

  /// Welcome back title for login
  ///
  /// In en, this message translates to:
  /// **'Welcome Back!'**
  String get welcomeBack;

  /// Create account title for signup
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get createAccount;

  /// Login subtitle
  ///
  /// In en, this message translates to:
  /// **'Sign in to continue to your account'**
  String get signInToContinue;

  /// Signup subtitle
  ///
  /// In en, this message translates to:
  /// **'Join us and start your journey'**
  String get joinUsStartJourney;

  /// Username field label
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get username;

  /// Full name field label
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get fullName;

  /// Email field label
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// Password field label
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// Remember me checkbox
  ///
  /// In en, this message translates to:
  /// **'Remember me'**
  String get rememberMe;

  /// Forgot password link
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// Terms agreement text prefix
  ///
  /// In en, this message translates to:
  /// **'I agree to the '**
  String get agreeToTerms;

  /// Terms of service link
  ///
  /// In en, this message translates to:
  /// **'Terms of Service'**
  String get termsOfService;

  /// And conjunction
  ///
  /// In en, this message translates to:
  /// **' and '**
  String get and;

  /// Privacy policy link
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get privacyPolicy;

  /// Sign in button
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signIn;

  /// Don't have account text
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account? Sign up'**
  String get dontHaveAccount;

  /// Already have account text
  ///
  /// In en, this message translates to:
  /// **'Already have an account? Sign in'**
  String get alreadyHaveAccount;

  /// Social login separator
  ///
  /// In en, this message translates to:
  /// **'or continue with'**
  String get orContinueWith;

  /// Google sign in
  ///
  /// In en, this message translates to:
  /// **'Google'**
  String get google;

  /// App name
  ///
  /// In en, this message translates to:
  /// **'SmartCity360'**
  String get smartCity360;

  /// Good morning greeting
  ///
  /// In en, this message translates to:
  /// **'Good Morning! 👋'**
  String get goodMorning;

  /// Welcome back with user name
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get welcomeBackUser;

  /// Default citizen name
  ///
  /// In en, this message translates to:
  /// **'Citizen'**
  String get citizen;

  /// App description
  ///
  /// In en, this message translates to:
  /// **'Help make your city better by reporting issues and tracking improvements in your community.'**
  String get helpMakeCityBetter;

  /// Quick actions section title
  ///
  /// In en, this message translates to:
  /// **'Quick Actions'**
  String get quickActions;

  /// Report issue subtitle
  ///
  /// In en, this message translates to:
  /// **'Report a new problem'**
  String get reportNewProblem;

  /// View history action
  ///
  /// In en, this message translates to:
  /// **'View History'**
  String get viewHistory;

  /// Check reports subtitle
  ///
  /// In en, this message translates to:
  /// **'Check your reports'**
  String get checkYourReports;

  /// Emergency action
  ///
  /// In en, this message translates to:
  /// **'Emergency'**
  String get emergency;

  /// Emergency subtitle
  ///
  /// In en, this message translates to:
  /// **'Report urgent issues'**
  String get reportUrgentIssues;

  /// Help center action
  ///
  /// In en, this message translates to:
  /// **'Help Center'**
  String get helpCenter;

  /// Get support subtitle
  ///
  /// In en, this message translates to:
  /// **'Get support'**
  String get getSupport;

  /// Uploading status
  ///
  /// In en, this message translates to:
  /// **'Uploading...'**
  String get uploading;

  /// Quick report button
  ///
  /// In en, this message translates to:
  /// **'Quick Report'**
  String get quickReport;

  /// Take photo option
  ///
  /// In en, this message translates to:
  /// **'Take Photo'**
  String get takePhoto;

  /// Issue history title
  ///
  /// In en, this message translates to:
  /// **'Issue History'**
  String get issueHistory;

  /// Notifications title
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// Pothole fixed notification
  ///
  /// In en, this message translates to:
  /// **'Pothole on Main St has been fixed! 🎉'**
  String get potholeFixed;

  /// 5 minutes ago
  ///
  /// In en, this message translates to:
  /// **'5 min ago'**
  String get fiveMinAgo;

  /// Community update notification
  ///
  /// In en, this message translates to:
  /// **'New community update available'**
  String get newCommunityUpdate;

  /// 1 hour ago
  ///
  /// In en, this message translates to:
  /// **'1 hour ago'**
  String get oneHourAgo;

  /// Report under review notification
  ///
  /// In en, this message translates to:
  /// **'Your report #1234 is under review'**
  String get reportUnderReview;

  /// 2 hours ago
  ///
  /// In en, this message translates to:
  /// **'2 hours ago'**
  String get twoHoursAgo;

  /// Close button
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// Emergency report title
  ///
  /// In en, this message translates to:
  /// **'Emergency Report'**
  String get emergencyReport;

  /// Emergency warning text
  ///
  /// In en, this message translates to:
  /// **'For life-threatening emergencies, please call 911 immediately.\\n\\nUse this feature only for urgent city infrastructure issues that pose immediate safety risks.'**
  String get emergencyWarning;

  /// Cancel button
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// Report emergency button
  ///
  /// In en, this message translates to:
  /// **'Report Emergency'**
  String get reportEmergency;

  /// Help support center title
  ///
  /// In en, this message translates to:
  /// **'Help & Support Center'**
  String get helpSupportCenter;

  /// Help center subtitle
  ///
  /// In en, this message translates to:
  /// **'We\'re here to help you 24/7'**
  String get hereToHelp247;

  /// Live chat support
  ///
  /// In en, this message translates to:
  /// **'Live Chat Support'**
  String get liveChatSupport;

  /// Chat support subtitle
  ///
  /// In en, this message translates to:
  /// **'Chat with our support team'**
  String get chatWithSupportTeam;

  /// Call support
  ///
  /// In en, this message translates to:
  /// **'Call Support'**
  String get callSupport;

  /// Call support subtitle
  ///
  /// In en, this message translates to:
  /// **'Speak with a representative'**
  String get speakWithRepresentative;

  /// Email support
  ///
  /// In en, this message translates to:
  /// **'Email Support'**
  String get emailSupport;

  /// Email support subtitle
  ///
  /// In en, this message translates to:
  /// **'Send us your questions'**
  String get sendUsQuestions;

  /// Resources section
  ///
  /// In en, this message translates to:
  /// **'Resources'**
  String get resources;

  /// User guide
  ///
  /// In en, this message translates to:
  /// **'User Guide'**
  String get userGuide;

  /// User guide subtitle
  ///
  /// In en, this message translates to:
  /// **'Learn how to use SmartCity360'**
  String get learnHowToUse;

  /// Video tutorials
  ///
  /// In en, this message translates to:
  /// **'Video Tutorials'**
  String get videoTutorials;

  /// Video tutorials subtitle
  ///
  /// In en, this message translates to:
  /// **'Watch step-by-step guides'**
  String get watchStepByStep;

  /// FAQs
  ///
  /// In en, this message translates to:
  /// **'FAQs'**
  String get faqs;

  /// FAQs subtitle
  ///
  /// In en, this message translates to:
  /// **'Find answers to common questions'**
  String get findAnswersCommon;

  /// Emergency information
  ///
  /// In en, this message translates to:
  /// **'Emergency Information'**
  String get emergencyInformation;

  /// Police
  ///
  /// In en, this message translates to:
  /// **'Police'**
  String get police;

  /// Fire department
  ///
  /// In en, this message translates to:
  /// **'Fire Dept'**
  String get fireDept;

  /// Coming soon
  ///
  /// In en, this message translates to:
  /// **'Coming Soon'**
  String get comingSoon;

  /// Feature coming soon message
  ///
  /// In en, this message translates to:
  /// **'{feature} feature is coming soon! Stay tuned for updates.'**
  String featureComingSoon(String feature);

  /// OK button
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get ok;

  /// General category
  ///
  /// In en, this message translates to:
  /// **'General'**
  String get general;

  /// Infrastructure category
  ///
  /// In en, this message translates to:
  /// **'Infrastructure'**
  String get infrastructure;

  /// Safety category
  ///
  /// In en, this message translates to:
  /// **'Safety'**
  String get safety;

  /// Environment category
  ///
  /// In en, this message translates to:
  /// **'Environment'**
  String get environment;

  /// Other category
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get other;

  /// Pin your location dialog title
  ///
  /// In en, this message translates to:
  /// **'Pin Your Location'**
  String get pinYourLocation;

  /// Use location button
  ///
  /// In en, this message translates to:
  /// **'Use Location'**
  String get useLocation;

  /// Reset password title
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get resetPassword;

  /// Reset password instructions
  ///
  /// In en, this message translates to:
  /// **'Enter your email address and we\'ll send you a link to reset your password.'**
  String get resetPasswordInstructions;

  /// Send reset link button
  ///
  /// In en, this message translates to:
  /// **'Send Reset Link'**
  String get sendResetLink;

  /// Password too short
  ///
  /// In en, this message translates to:
  /// **'Too short'**
  String get tooShort;

  /// Weak password
  ///
  /// In en, this message translates to:
  /// **'Weak'**
  String get weak;

  /// Good password
  ///
  /// In en, this message translates to:
  /// **'Good'**
  String get good;

  /// Strong password
  ///
  /// In en, this message translates to:
  /// **'Strong'**
  String get strong;

  /// Username validation
  ///
  /// In en, this message translates to:
  /// **'Please enter a username'**
  String get pleaseEnterUsername;

  /// Username minimum length
  ///
  /// In en, this message translates to:
  /// **'Username must be at least 3 characters'**
  String get usernameMinLength;

  /// Username invalid characters
  ///
  /// In en, this message translates to:
  /// **'Username can only contain letters, numbers, and underscores'**
  String get usernameInvalidChars;

  /// Full name validation
  ///
  /// In en, this message translates to:
  /// **'Please enter your full name'**
  String get pleaseEnterFullName;

  /// Valid full name validation
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid full name'**
  String get pleaseEnterValidName;

  /// Email validation
  ///
  /// In en, this message translates to:
  /// **'Please enter your email'**
  String get pleaseEnterEmail;

  /// Valid email validation
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email address'**
  String get pleaseEnterValidEmail;

  /// Password validation
  ///
  /// In en, this message translates to:
  /// **'Please enter your password'**
  String get pleaseEnterPassword;

  /// Password minimum length
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 6 characters'**
  String get passwordMinLength;

  /// Password recommended length
  ///
  /// In en, this message translates to:
  /// **'Password should be at least 8 characters for better security'**
  String get passwordRecommendedLength;

  /// Terms agreement validation
  ///
  /// In en, this message translates to:
  /// **'Please agree to the Terms of Service and Privacy Policy'**
  String get pleaseAgreeTerms;

  /// Login failed message
  ///
  /// In en, this message translates to:
  /// **'Login failed. Please check your credentials.'**
  String get loginFailed;

  /// Welcome back success message
  ///
  /// In en, this message translates to:
  /// **'Welcome back!'**
  String get welcomeBackMessage;

  /// Account created message
  ///
  /// In en, this message translates to:
  /// **'Account created! Please check your email to confirm your account.'**
  String get accountCreated;

  /// Unexpected error message
  ///
  /// In en, this message translates to:
  /// **'An unexpected error occurred. Please try again.'**
  String get unexpectedError;

  /// Google sign in success
  ///
  /// In en, this message translates to:
  /// **'Successfully signed in with Google!'**
  String get googleSignInSuccess;

  /// Google sign in cancelled
  ///
  /// In en, this message translates to:
  /// **'Google sign-in was cancelled'**
  String get googleSignInCancelled;

  /// Google sign in failed
  ///
  /// In en, this message translates to:
  /// **'Google sign-in failed. Please try again.'**
  String get googleSignInFailed;

  /// Password reset sent message
  ///
  /// In en, this message translates to:
  /// **'Password reset link sent to your email!'**
  String get passwordResetSent;

  /// Reset email failed message
  ///
  /// In en, this message translates to:
  /// **'Failed to send reset email. Please try again.'**
  String get resetEmailFailed;

  /// Invalid credentials error
  ///
  /// In en, this message translates to:
  /// **'Invalid email or password. Please try again.'**
  String get invalidCredentials;

  /// Email already exists error
  ///
  /// In en, this message translates to:
  /// **'An account with this email already exists.'**
  String get emailAlreadyExists;

  /// Weak password error
  ///
  /// In en, this message translates to:
  /// **'Password is too weak. Please choose a stronger password.'**
  String get weakPasswordError;

  /// Invalid email error
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email address.'**
  String get invalidEmailError;

  /// Signup disabled error
  ///
  /// In en, this message translates to:
  /// **'New account creation is currently disabled.'**
  String get signupDisabled;

  /// Location permission denied message
  ///
  /// In en, this message translates to:
  /// **'Location permission denied.'**
  String get locationPermissionDenied;

  /// Location permission permanently denied message
  ///
  /// In en, this message translates to:
  /// **'Location permission permanently denied.'**
  String get locationPermissionPermanentlyDenied;

  /// Enable location services message
  ///
  /// In en, this message translates to:
  /// **'Please enable location services.'**
  String get enableLocationServices;

  /// Image uploaded successfully
  ///
  /// In en, this message translates to:
  /// **'📸 Image uploaded successfully!'**
  String get imageUploadedSuccessfully;

  /// Error uploading image
  ///
  /// In en, this message translates to:
  /// **'Error uploading image: {error}'**
  String errorUploadingImage(String error);

  /// Logout error
  ///
  /// In en, this message translates to:
  /// **'Logout error: {error}'**
  String logoutError(String error);

  /// Unexpected logout error
  ///
  /// In en, this message translates to:
  /// **'An unexpected error occurred during logout'**
  String get unexpectedLogoutError;

  /// Not logged in status
  ///
  /// In en, this message translates to:
  /// **'Not logged in'**
  String get notLoggedIn;

  /// Error picking image
  ///
  /// In en, this message translates to:
  /// **'Error picking image: {error}'**
  String errorPickingImage(String error);

  /// Error getting address
  ///
  /// In en, this message translates to:
  /// **'Error getting address: {error}'**
  String errorGettingAddress(String error);

  /// Choose from gallery option
  ///
  /// In en, this message translates to:
  /// **'Choose from Gallery'**
  String get chooseFromGallery;

  /// User not authenticated error
  ///
  /// In en, this message translates to:
  /// **'User not authenticated'**
  String get userNotAuthenticated;

  /// Issue reported successfully message
  ///
  /// In en, this message translates to:
  /// **'Issue reported successfully!'**
  String get issueReportedSuccessfully;

  /// Error submitting issue
  ///
  /// In en, this message translates to:
  /// **'Error submitting issue: {error}'**
  String errorSubmittingIssue(String error);

  /// Issue title field label
  ///
  /// In en, this message translates to:
  /// **'Issue Title'**
  String get issueTitle;

  /// Please enter title validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a title'**
  String get pleaseEnterTitle;

  /// Please enter description validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a description'**
  String get pleaseEnterDescription;

  /// Address or landmark field label
  ///
  /// In en, this message translates to:
  /// **'Address or Landmark'**
  String get addressOrLandmark;

  /// Please enter address validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter an address'**
  String get pleaseEnterAddress;

  /// Pin button label
  ///
  /// In en, this message translates to:
  /// **'Pin'**
  String get pin;

  /// Add photo button label
  ///
  /// In en, this message translates to:
  /// **'Add Photo'**
  String get addPhoto;

  /// Basic information section title
  ///
  /// In en, this message translates to:
  /// **'Basic Information'**
  String get basicInformation;

  /// Images section title
  ///
  /// In en, this message translates to:
  /// **'Images'**
  String get images;

  /// Submit report button
  ///
  /// In en, this message translates to:
  /// **'Submit Report'**
  String get submitReport;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'hi'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'hi':
      return AppLocalizationsHi();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
