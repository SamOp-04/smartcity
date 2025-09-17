import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../l10n/app_localizations.dart';
import '../supabase_client.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _usernameController = TextEditingController();
  final _fullNameController = TextEditingController();

  bool _isLoading = false;
  bool _isLogin = true;
  bool _isGoogleLoading = false;
  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _agreedToTerms = false;

  // Password strength indicator
  double _passwordStrength = 0.0;
  String _passwordStrengthText = '';
  Color _passwordStrengthColor = Colors.red;

  @override
  void initState() {
    super.initState();
    // Add password strength listener
    _passwordController.addListener(_updatePasswordStrength);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _usernameController.dispose();
    _fullNameController.dispose();
    super.dispose();
  }

  void _updatePasswordStrength() {
    final password = _passwordController.text;
    double strength = 0.0;
    String strengthText = '';
    Color strengthColor = Colors.red;

    if (password.isEmpty) {
      strength = 0.0;
      strengthText = '';
    } else if (password.length < 6) {
      strength = 0.2;
      strengthText = AppLocalizations.of(context)!.tooShort;
      strengthColor = Colors.red;
    } else if (password.length < 8) {
      strength = 0.4;
      strengthText = AppLocalizations.of(context)!.weak;
      strengthColor = Colors.orange;
    } else {
      strength = 0.6;
      strengthText = AppLocalizations.of(context)!.good;
      strengthColor = Colors.amber;

      // Check for additional criteria
      if (RegExp(r'[A-Z]').hasMatch(password)) strength += 0.1;
      if (RegExp(r'[a-z]').hasMatch(password)) strength += 0.1;
      if (RegExp(r'[0-9]').hasMatch(password)) strength += 0.1;
      if (RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(password)) strength += 0.1;

      if (strength >= 0.8) {
        strengthText = AppLocalizations.of(context)!.strong;
        strengthColor = Colors.green;
      }
    }

    setState(() {
      _passwordStrength = strength;
      _passwordStrengthText = strengthText;
      _passwordStrengthColor = strengthColor;
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_isLogin && !_agreedToTerms) {
      _showErrorMessage(AppLocalizations.of(context)!.pleaseAgreeTerms);
      return;
    }

    // Haptic feedback
    HapticFeedback.lightImpact();

    setState(() => _isLoading = true);

    try {
      if (_isLogin) {
        // Handle login
        final AuthResponse response = await SupabaseClientManager.signInWithEmail(
          _emailController.text.trim(),
          _passwordController.text.trim(),
        );

        if (response.user == null) {
          if (mounted) {
            _showErrorMessage(AppLocalizations.of(context)!.loginFailed);
          }
          return;
        }

        if (mounted) {
          _showSuccessMessage(AppLocalizations.of(context)!.welcomeBackMessage);
          await Future.delayed(const Duration(milliseconds: 1500));
          Navigator.pushReplacementNamed(context, '/home');
        }
      } else {
        // Handle sign up
        await SupabaseClientManager.signUpWithEmail(
          _emailController.text.trim(),
          _passwordController.text.trim(),
          username: _usernameController.text.trim(),
          fullName: _fullNameController.text.trim(),
        );

        if (mounted) {
          _showSuccessMessage('Account created! Please check your email to confirm your account.');
          // Switch to login mode after successful signup
          await Future.delayed(const Duration(milliseconds: 2000));
          _toggleAuthMode();
        }
      }
    } on AuthException catch (e) {
      if (mounted) {
        _showErrorMessage(_getAuthErrorMessage(e));
      }
    } catch (e) {
      if (mounted) {
        _showErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _signInWithGoogle() async {
    HapticFeedback.lightImpact();
    setState(() => _isGoogleLoading = true);

    try {
      final response = await SupabaseClientManager.signInWithGoogle();

      if (response?.user != null) {
        if (mounted) {
          _showSuccessMessage('Successfully signed in with Google!');
          await Future.delayed(const Duration(milliseconds: 1500));
          Navigator.pushReplacementNamed(context, '/home');
        }
      } else {
        if (mounted) {
          _showErrorMessage('Google sign-in was cancelled');
        }
      }
    } on AuthException catch (e) {
      if (mounted) {
        _showErrorMessage('Google sign-in failed: ${_getAuthErrorMessage(e)}');
      }
    } catch (e) {
      if (mounted) {
        _showErrorMessage('Google sign-in failed. Please try again.');
        print('Google sign-in error: $e');
      }
    } finally {
      if (mounted) {
        setState(() => _isGoogleLoading = false);
      }
    }
  }

  void _showErrorMessage(String message) {
    HapticFeedback.mediumImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.red.shade600,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  void _showSuccessMessage(String message) {
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.green.shade600,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  String _getAuthErrorMessage(AuthException e) {
    switch (e.message.toLowerCase()) {
      case 'invalid_credentials':
      case 'invalid login credentials':
        return 'Invalid email or password. Please try again.';
      case 'email_already_exists':
      case 'user_already_exists':
        return 'An account with this email already exists.';
      case 'weak_password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'invalid_email':
        return 'Please enter a valid email address.';
      case 'signup_disabled':
        return 'New account creation is currently disabled.';
      default:
        return e.message;
    }
  }

  void _clearForm() {
    _emailController.clear();
    _passwordController.clear();
    _usernameController.clear();
    _fullNameController.clear();
    setState(() {
      _rememberMe = false;
      _agreedToTerms = false;
    });
  }

  void _toggleAuthMode() {
    setState(() {
      _isLogin = !_isLogin;
      _clearForm();
    });
  }

  // Forgot password functionality
  Future<void> _showForgotPasswordDialog() async {
    final emailController = TextEditingController();

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Reset Password'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Enter your email address and we\'ll send you a link to reset your password.'),
            const SizedBox(height: 16),
            TextField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'Email',
                prefixIcon: const Icon(Icons.email_outlined),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (emailController.text.isNotEmpty) {
                try {
                  // Add password reset logic here
                  Navigator.pop(context);
                  _showSuccessMessage('Password reset link sent to your email!');
                } catch (e) {
                  _showErrorMessage('Failed to send reset email. Please try again.');
                }
              }
            },
            child: const Text('Send Reset Link'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              colorScheme.surface,
              colorScheme.primary.withOpacity(0.05),
              colorScheme.surface,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 20),

                    // App Logo/Icon
                    Container(
                      height: 100,
                      width: 100,
                      margin: const EdgeInsets.only(bottom: 32),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF2196F3), Color(0xFF1976D2)], // Blue gradient
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF2196F3).withOpacity(0.4),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.verified_user,
                        size: 50,
                        color: Colors.white,
                      ),
                    ),

                    // Welcome text
                    Text(
                      _isLogin ? AppLocalizations.of(context)!.welcomeBack : AppLocalizations.of(context)!.createAccount,
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onSurface,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isLogin
                          ? AppLocalizations.of(context)!.signInToContinue
                          : AppLocalizations.of(context)!.joinUsStartJourney,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: colorScheme.onSurface.withOpacity(0.7),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 48),

                    // Sign up fields
                    if (!_isLogin) ...[
                      _buildTextField(
                        controller: _usernameController,
                        labelText: AppLocalizations.of(context)!.username,
                        prefixIcon: Icons.person,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a username';
                          }
                          if (value.length < 3) {
                            return 'Username must be at least 3 characters';
                          }
                          if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(value)) {
                            return 'Username can only contain letters, numbers, and underscores';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: _fullNameController,
                        labelText: AppLocalizations.of(context)!.fullName,
                        prefixIcon: Icons.person_outline,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your full name';
                          }
                          if (value.trim().length < 2) {
                            return 'Please enter a valid full name';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Email field
                    _buildTextField(
                      controller: _emailController,
                      labelText: AppLocalizations.of(context)!.email,
                      prefixIcon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your email';
                        }
                        if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                          return 'Please enter a valid email address';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Password field with strength indicator
                    _buildTextField(
                      controller: _passwordController,
                      labelText: AppLocalizations.of(context)!.password,
                      prefixIcon: Icons.lock_outline,
                      obscureText: _obscurePassword,
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          setState(() => _obscurePassword = !_obscurePassword);
                        },
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        if (value.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        if (!_isLogin && value.length < 8) {
                          return 'Password should be at least 8 characters for better security';
                        }
                        return null;
                      },
                    ),

                    // Password strength indicator (only for signup)
                    if (!_isLogin && _passwordController.text.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          LinearProgressIndicator(
                            value: _passwordStrength,
                            backgroundColor: Colors.grey.shade300,
                            valueColor: AlwaysStoppedAnimation<Color>(_passwordStrengthColor),
                            minHeight: 4,
                          ),
                          const SizedBox(height: 4),
                          if (_passwordStrengthText.isNotEmpty)
                            Text(
                              _passwordStrengthText,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: _passwordStrengthColor,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 16),

                    // Remember me / Forgot password row
                    if (_isLogin) ...[
                      Row(
                        children: [
                          Checkbox(
                            value: _rememberMe,
                            onChanged: (value) {
                              HapticFeedback.selectionClick();
                              setState(() => _rememberMe = value ?? false);
                            },
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                          ),
                          Text(AppLocalizations.of(context)!.rememberMe),
                          const Spacer(),
                          TextButton(
                            onPressed: _showForgotPasswordDialog,
                            child: Text(
                              AppLocalizations.of(context)!.forgotPassword,
                              style: TextStyle(color: colorScheme.primary),
                            ),
                          ),
                        ],
                      ),
                    ] else ...[
                      // Terms and conditions checkbox
                      Row(
                        children: [
                          Checkbox(
                            value: _agreedToTerms,
                            onChanged: (value) {
                              HapticFeedback.selectionClick();
                              setState(() => _agreedToTerms = value ?? false);
                            },
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                          ),
                          Expanded(
                            child: Wrap(
                              children: [
                                const Text('I agree to the '),
                                GestureDetector(
                                  onTap: () {
                                    // Navigate to terms
                                  },
                                  child: Text(
                                    'Terms of Service',
                                    style: TextStyle(
                                      color: colorScheme.primary,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ),
                                const Text(' and '),
                                GestureDetector(
                                  onTap: () {
                                    // Navigate to privacy policy
                                  },
                                  child: Text(
                                    'Privacy Policy',
                                    style: TextStyle(
                                      color: colorScheme.primary,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 32),

                    // Main auth button with gradient
                    Container(
                      height: 56,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: const LinearGradient(
                          colors: [Color(0xFF2196F3), Color(0xFF1565C0)],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF2196F3).withOpacity(0.4),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: _isLoading
                          ? const Center(
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        ),
                      )
                          : Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: _submit,
                          borderRadius: BorderRadius.circular(12),
                          child: Center(
                            child: Text(
                              _isLogin ? AppLocalizations.of(context)!.signIn : AppLocalizations.of(context)!.createAccount,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Toggle auth mode
                    Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3F2FD),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF2196F3).withOpacity(0.3)),
                        ),
                        child: TextButton.icon(
                          onPressed: _toggleAuthMode,
                          icon: Icon(
                            _isLogin ? Icons.person_add : Icons.login,
                            color: const Color(0xFF1976D2),
                          ),
                          label: Text(
                            _isLogin
                                ? AppLocalizations.of(context)!.dontHaveAccount
                                : AppLocalizations.of(context)!.alreadyHaveAccount,
                            style: const TextStyle(color: Color(0xFF1976D2)),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Divider with modern styling
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 1,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.transparent,
                                  const Color(0xFF2196F3).withOpacity(0.3),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE3F2FD),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF2196F3).withOpacity(0.3)),
                            ),
                            child: Text(
                              AppLocalizations.of(context)!.orContinueWith,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: const Color(0xFF1976D2),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            height: 1,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.transparent,
                                  const Color(0xFF2196F3).withOpacity(0.3),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Social login buttons
                    if (!kIsWeb) ...[
                      // Google Sign-In Button with enhanced styling
                      Container(
                        height: 56,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: colorScheme.outline.withOpacity(0.3)),
                          color: colorScheme.surface,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: _isGoogleLoading
                            ? const Center(
                          child: SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                            : Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: _signInWithGoogle,
                            borderRadius: BorderRadius.circular(12),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(2),
                                  child: Image.asset(
                                    'assets/images/google_logo.png',
                                    height: 24,
                                    width: 24,
                                    errorBuilder: (context, error, stackTrace) =>
                                    const Icon(Icons.g_mobiledata, size: 24),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                const Text(
                                  'Google',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String labelText,
    required IconData prefixIcon,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      validator: validator,
      onTap: () => HapticFeedback.selectionClick(),
      decoration: InputDecoration(
        labelText: labelText,
        prefixIcon: Icon(prefixIcon),
        suffixIcon: suffixIcon,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Theme.of(context).colorScheme.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Theme.of(context).colorScheme.outline.withOpacity(0.5)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF2196F3), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Theme.of(context).colorScheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Theme.of(context).colorScheme.error, width: 2),
        ),
        filled: true,
        fillColor: Colors.white.withOpacity(0.8),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }

  Widget _buildSocialButton(IconData icon, String label, VoidCallback onPressed) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      height: 48,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colorScheme.outline.withOpacity(0.3)),
        color: colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            onPressed();
          },
          borderRadius: BorderRadius.circular(12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 20),
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}