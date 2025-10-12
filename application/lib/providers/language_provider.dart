import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'voice_provider.dart';

class LanguageProvider extends ChangeNotifier {
  Locale _currentLocale = const Locale('en');
  
  Locale get currentLocale => _currentLocale;
  
  LanguageProvider() {
    _loadSavedLanguage();
  }
  
  void _loadSavedLanguage() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? languageCode = prefs.getString('language_code');
    if (languageCode != null) {
      _currentLocale = Locale(languageCode);
      notifyListeners();
    }
  }
  
  void changeLanguage(Locale locale, [BuildContext? context]) async {
    if (_currentLocale == locale) return;
    
    _currentLocale = locale;
    notifyListeners();
    
    // Save language preference
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('language_code', locale.languageCode);
    
    // Update voice provider language if context is available
    if (context != null) {
      try {
        final voiceProvider = Provider.of<VoiceProvider>(context, listen: false);
        await voiceProvider.setLanguage(locale.languageCode);
      } catch (e) {
        print('Error updating voice provider language: $e');
      }
    }
  }
  
  // Method to get available languages for both UI and voice
  List<Map<String, String>> getAvailableLanguages() {
    return [
      {
        'code': 'en',
        'name': 'English',
        'nativeName': 'English',
        'flag': '🇺🇸',
      },
      {
        'code': 'hi', 
        'name': 'Hindi',
        'nativeName': 'हिंदी',
        'flag': '🇮🇳',
      },
    ];
  }
  
  bool get isHindi => _currentLocale.languageCode == 'hi';
  bool get isEnglish => _currentLocale.languageCode == 'en';
  
  String get currentLanguageName {
    final languages = getAvailableLanguages();
    final current = languages.firstWhere(
      (lang) => lang['code'] == _currentLocale.languageCode,
      orElse: () => languages.first,
    );
    return current['name'] ?? 'English';
  }
  
  String get currentLanguageNativeName {
    final languages = getAvailableLanguages();
    final current = languages.firstWhere(
      (lang) => lang['code'] == _currentLocale.languageCode,
      orElse: () => languages.first,
    );
    return current['nativeName'] ?? 'English';
  }
}