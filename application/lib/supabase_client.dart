import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';

class SupabaseClientManager {
  static final SupabaseClient client = Supabase.instance.client;
  static GoogleSignIn? _googleSignIn;

  static Future<void> initialize() async {
    try {
      await dotenv.load(fileName: ".env");

      await Supabase.initialize(
        url: dotenv.get('SUPABASE_URL'),
        anonKey: dotenv.get('SUPABASE_ANON_KEY'),
        debug: true,
      );

      // Initialize Google Sign-In with your Web Client ID
      _googleSignIn = GoogleSignIn(
        serverClientId: dotenv.get('WEB_CLIENT_ID'),
        scopes: ['email', 'profile'],
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
      // Fetch existing profile to preserve username/full_name if they exist
      // and are not provided by the OAuth provider (e.g., Google)
      final existingProfile = await getUserProfile(user.id);

      final userData = {
        'user_id': user.id,
        'email': user.email,
        // Prioritize existing username/full_name, then OAuth metadata, then fallback
        'username': existingProfile?['username'] ?? 
                   user.userMetadata?['username'] ?? 
                   user.userMetadata?['preferred_username'] ??
                   user.email?.split('@').first,
        'full_name': existingProfile?['full_name'] ?? 
                    user.userMetadata?['full_name'] ?? 
                    user.userMetadata?['name'] ??
                    'No Name',
        'avatar_url': user.userMetadata?['avatar_url'] ?? 
                     user.userMetadata?['picture'],
      };

      await client.from('profiles').upsert(
        userData,
        onConflict: 'user_id',
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
        // Profile creation/update is handled by the onAuthStateChange listener
        // for consistency across all sign-in methods.
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
      // Profile creation/update is handled by the onAuthStateChange listener
      return response;
    } catch (e) {
      print('❌ Signin error: $e');
      rethrow;
    }
  }

  // Native Google Sign-In implementation
  static Future<AuthResponse?> signInWithGoogle() async {
    try {
      if (_googleSignIn == null) {
        throw Exception('Google Sign-In not initialized');
      }

      // Sign out any existing Google account first to ensure fresh sign-in
      await _googleSignIn!.signOut();

      // Start Google Sign-In flow
      final GoogleSignInAccount? googleUser = await _googleSignIn!.signIn();
      if (googleUser == null) {
        // User cancelled the sign-in
        print('Google sign-in cancelled by user');
        return null;
      }

      // Get authentication details
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      final String? accessToken = googleAuth.accessToken;
      final String? idToken = googleAuth.idToken;
      
      if (accessToken == null || idToken == null) {
        throw Exception('Failed to get Google auth tokens');
      }

      print('✅ Got Google tokens, signing in to Supabase...');

      // Sign in to Supabase with Google tokens
      final AuthResponse response = await client.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );

      if (response.user != null) {
        print('✅ Google Sign-in successful for user: ${response.user!.email}');
      }

      return response;
    } catch (e) {
      print('❌ Google Sign-in error: $e');
      // Clean up Google sign-in state on error
      try {
        await _googleSignIn?.signOut();
      } catch (signOutError) {
        print('Error signing out of Google: $signOutError');
      }
      rethrow;
    }
  }

  static Future<void> signOut() async {
    try {
      // Sign out from Google first
      if (_googleSignIn != null) {
        await _googleSignIn!.signOut();
        await _googleSignIn!.disconnect();
      }
      // Then sign out from Supabase
      await client.auth.signOut();
      print('✅ Successfully signed out');
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
      // It's common for a profile not to exist initially, so we don't rethrow here.
      // print('❌ Error in getUserProfile: $e'); // Uncomment for debugging
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

  // Helper method to get current user
  static User? get currentUser => client.auth.currentUser;

  // Helper method to check if user is signed in
  static bool get isSignedIn => client.auth.currentUser != null;
}