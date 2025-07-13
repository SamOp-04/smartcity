import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseClientManager {
  static final SupabaseClient client = Supabase.instance.client;

  static Future<void> initialize() async {
    try {
      await dotenv.load(fileName: ".env");

      await Supabase.initialize(
        url: dotenv.get('SUPABASE_URL'),
        anonKey: dotenv.get('SUPABASE_ANON_KEY'),
        debug: true,
      );

      // Listen to auth state changes
      client.auth.onAuthStateChange.listen((AuthState authState) {
        if (authState.event == AuthChangeEvent.signedIn) {
          _createOrUpdateUserProfile(authState.session?.user);
        }
      });

      print('✅ Supabase initialized');
    } catch (e) {
      print('❌ Error initializing Supabase: $e');
      rethrow;
    }
  }

  static Future<void> _createOrUpdateUserProfile(User? user) async {
    if (user == null) return;

    try {
      final userData = {
        'user_id': user.id,
        'email': user.email,
        'username': user.userMetadata?['username'] ?? user.email?.split('@').first,
        'full_name': user.userMetadata?['full_name'] ?? 'No Name',
      };

      await client.from('profiles').upsert(
        userData,
        onConflict: 'user_id', // ✅ Correct Dart syntax
      );

      print('✅ Profile upserted for user ${user.id}');
    } catch (e) {
      print('❌ Error in _createOrUpdateUserProfile: $e');
      rethrow;
    }
  }

  static Future<AuthResponse> signUpWithEmail(
      String email,
      String password, {
        String? username,
        String? fullName,
      }) async {
    try {
      final metadata = <String, dynamic>{
        if (username != null) 'username': username,
        if (fullName != null) 'full_name': fullName,
      };

      final response = await client.auth.signUp(
        email: email,
        password: password,
        data: metadata,
      );

      if (response.user != null) {
        await _createOrUpdateUserProfile(response.user);
      }

      return response;
    } catch (e) {
      print('❌ Signup error: $e');
      rethrow;
    }
  }

  static Future<AuthResponse> signInWithEmail(String email, String password) async {
    try {
      final response = await client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      return response;
    } catch (e) {
      print('❌ Signin error: $e');
      rethrow;
    }
  }

  static Future<void> signOut() async {
    try {
      await client.auth.signOut();
    } catch (e) {
      print('❌ Signout error: $e');
      rethrow;
    }
  }

  static Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    try {
      final response = await client
          .from('profiles')
          .select()
          .eq('user_id', userId)
          .single();

      return response;
    } catch (e) {
      print('❌ Error in getUserProfile: $e');
      return null;
    }
  }

  static Future<void> updateUserProfile(
      String userId,
      Map<String, dynamic> updates,
      ) async {
    try {
      await client.from('profiles').update(updates).eq('user_id', userId);
    } catch (e) {
      print('❌ Error in updateUserProfile: $e');
      rethrow;
    }
  }

  static Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;
}
