import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/app_localizations.dart';
import 'supabase_client.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'screens/history_screen.dart';
import 'providers/language_provider.dart';

void main() async {
  // Ensure Flutter binding is initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase client
  try {
    await SupabaseClientManager.initialize();
    print('Supabase initialized successfully');
  } catch (e) {
    print('Failed to initialize Supabase: $e');
    // You might want to handle this error more gracefully in production
  }

  // Run the app
  runApp(
    ChangeNotifierProvider(
      create: (context) => LanguageProvider(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<LanguageProvider>(
      builder: (context, languageProvider, child) {
        return MaterialApp(
          title: 'Issue Reporter',
          locale: languageProvider.currentLocale,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en'), // English
            Locale('hi'), // Hindi
          ],
          theme: ThemeData(
            primarySwatch: Colors.blue,
            // Add more theme customization if needed
            visualDensity: VisualDensity.adaptivePlatformDensity,
            inputDecorationTheme: InputDecorationTheme(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          // Check auth state before deciding initial route
          initialRoute: SupabaseClientManager.client.auth.currentSession != null
              ? '/home'
              : '/auth',
          routes: {
            '/auth': (context) => const AuthScreen(),
            '/home': (context) => const HomeScreen(),
            '/history': (context) => const HistoryScreen(),
          },
          // Handle unknown routes
          onUnknownRoute: (settings) {
            return MaterialPageRoute(
              builder: (context) => const Scaffold(
                body: Center(
                  child: Text('Page not found'),
                ),
              ),
            );
          },
          // Optional: Add a navigator observer for analytics or logging
          navigatorObservers: [
            // You could add your own observer here for navigation tracking
          ],
        );
      },
    );
  }
}
