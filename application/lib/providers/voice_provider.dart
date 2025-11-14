import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';

class VoiceProvider extends ChangeNotifier {
  // Speech to Text
  late stt.SpeechToText _speech;
  bool _isListening = false;
  bool _isAvailable = false;
  String _lastWords = '';
  double _confidence = 1.0;

  // Text to Speech
  late FlutterTts _flutterTts;
  bool _isSpeaking = false;

  // Language settings
  String _currentLanguage = 'en-US';
  List<stt.LocaleName> _availableLanguages = [];

  // Getters
  bool get isListening => _isListening;
  bool get isAvailable => _isAvailable;
  bool get isSpeaking => _isSpeaking;
  String get lastWords => _lastWords;
  double get confidence => _confidence;
  String get currentLanguage => _currentLanguage;
  List<stt.LocaleName> get availableLanguages => _availableLanguages;

  VoiceProvider() {
    _initializeSpeech();
    _initializeTts();
  }

  // Initialize Speech to Text
  Future<void> _initializeSpeech() async {
    _speech = stt.SpeechToText();
    
    try {
      // Request microphone permission
      await _requestMicrophonePermission();
      
      // Initialize speech recognition
      _isAvailable = await _speech.initialize(
        onStatus: (status) {
          print('Speech recognition status: $status');
          if (status == 'done' || status == 'notListening') {
            _isListening = false;
            notifyListeners();
          }
        },
        onError: (error) {
          print('Speech recognition error: $error');
          _isListening = false;
          notifyListeners();
        },
      );

      if (_isAvailable) {
        _availableLanguages = await _speech.locales();
      }
      
      notifyListeners();
    } catch (e) {
      print('Error initializing speech: $e');
      _isAvailable = false;
      notifyListeners();
    }
  }

  // Initialize Text to Speech
  Future<void> _initializeTts() async {
    _flutterTts = FlutterTts();

    // Set up TTS callbacks
    _flutterTts.setStartHandler(() {
      _isSpeaking = true;
      notifyListeners();
    });

    _flutterTts.setCompletionHandler(() {
      _isSpeaking = false;
      notifyListeners();
    });

    _flutterTts.setErrorHandler((message) {
      print('TTS Error: $message');
      _isSpeaking = false;
      notifyListeners();
    });

    // Configure TTS settings
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);
  }

  // Request microphone permission
  Future<bool> _requestMicrophonePermission() async {
    PermissionStatus permission = await Permission.microphone.status;
    
    if (permission != PermissionStatus.granted) {
      permission = await Permission.microphone.request();
    }
    
    return permission == PermissionStatus.granted;
  }

  // Start listening to speech
  Future<void> startListening({
    Function(String)? onResult,
    Duration timeout = const Duration(seconds: 30),
  }) async {
    if (!_isAvailable || _isListening) return;

    // Ensure we have microphone permission
    bool hasPermission = await _requestMicrophonePermission();
    if (!hasPermission) {
      print('Microphone permission denied');
      return;
    }

    try {
      await _speech.listen(
        onResult: (result) {
          _lastWords = result.recognizedWords;
          _confidence = result.confidence;
          onResult?.call(_lastWords);
          notifyListeners();
        },
        listenFor: timeout,
        pauseFor: const Duration(seconds: 5),
        localeId: _currentLanguage,
        partialResults: true,
        cancelOnError: true,
        listenMode: stt.ListenMode.confirmation,
      );

      _isListening = true;
      notifyListeners();
    } catch (e) {
      print('Error starting speech recognition: $e');
      _isListening = false;
      notifyListeners();
    }
  }

  // Stop listening to speech
  Future<void> stopListening() async {
    if (!_isListening) return;

    try {
      await _speech.stop();
      _isListening = false;
      notifyListeners();
    } catch (e) {
      print('Error stopping speech recognition: $e');
    }
  }

  // Speak text
  Future<void> speak(String text) async {
    if (text.isEmpty || _isSpeaking) return;

    try {
      // Set language for TTS
      String ttsLanguage = _getTtsLanguageCode();
      await _flutterTts.setLanguage(ttsLanguage);
      
      await _flutterTts.speak(text);
    } catch (e) {
      print('Error speaking text: $e');
      _isSpeaking = false;
      notifyListeners();
    }
  }

  // Stop speaking
  Future<void> stopSpeaking() async {
    if (!_isSpeaking) return;

    try {
      await _flutterTts.stop();
      _isSpeaking = false;
      notifyListeners();
    } catch (e) {
      print('Error stopping speech: $e');
    }
  }

  // Set language for speech recognition and TTS
  Future<void> setLanguage(String languageCode) async {
    // Convert language code to speech recognition format
    String sttLanguageCode = _getSttLanguageCode(languageCode);
    
    if (_availableLanguages.any((locale) => locale.localeId == sttLanguageCode)) {
      _currentLanguage = sttLanguageCode;
      notifyListeners();
    } else {
      print('Language $sttLanguageCode not available for speech recognition');
    }
  }

  // Convert language code to speech recognition format
  String _getSttLanguageCode(String languageCode) {
    switch (languageCode) {
      case 'en':
        return 'en-US';
      case 'hi':
        return 'hi-IN';
      default:
        return 'en-US';
    }
  }

  // Convert language code to TTS format
  String _getTtsLanguageCode() {
    switch (_currentLanguage) {
      case 'en-US':
        return 'en-US';
      case 'hi-IN':
        return 'hi-IN';
      default:
        return 'en-US';
    }
  }

  // Get available language names for display
  List<Map<String, String>> getDisplayLanguages() {
    return [
      {'code': 'en', 'name': 'English', 'sttCode': 'en-US'},
      {'code': 'hi', 'name': 'हिंदी', 'sttCode': 'hi-IN'},
    ];
  }

  // Check if a specific language is available
  bool isLanguageAvailable(String languageCode) {
    String sttCode = _getSttLanguageCode(languageCode);
    return _availableLanguages.any((locale) => locale.localeId == sttCode);
  }

  // Clear last recognized words
  void clearLastWords() {
    _lastWords = '';
    _confidence = 1.0;
    notifyListeners();
  }

  @override
  void dispose() {
    _speech.cancel();
    _flutterTts.stop();
    super.dispose();
  }
}