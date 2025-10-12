import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/voice_provider.dart';

class VoiceInputWidget extends StatefulWidget {
  final Function(String)? onResult;
  final Function(String)? onPartialResult;
  final String? hintText;
  final bool showResultText;
  final Duration? listeningTimeout;
  final VoidCallback? onListeningStart;
  final VoidCallback? onListeningStop;

  const VoiceInputWidget({
    super.key,
    this.onResult,
    this.onPartialResult,
    this.hintText,
    this.showResultText = true,
    this.listeningTimeout,
    this.onListeningStart,
    this.onListeningStop,
  });

  @override
  State<VoiceInputWidget> createState() => _VoiceInputWidgetState();
}

class _VoiceInputWidgetState extends State<VoiceInputWidget>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.3,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _opacityAnimation = Tween<double>(
      begin: 0.3,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _startListening(VoiceProvider voiceProvider) async {
    widget.onListeningStart?.call();
    _animationController.repeat(reverse: true);

    await voiceProvider.startListening(
      onResult: (result) {
        if (result.isNotEmpty) {
          widget.onPartialResult?.call(result);
          if (!voiceProvider.isListening) {
            widget.onResult?.call(result);
            _stopAnimation();
            widget.onListeningStop?.call();
          }
        }
      },
      timeout: widget.listeningTimeout ?? const Duration(seconds: 30),
    );
  }

  void _stopListening(VoiceProvider voiceProvider) async {
    await voiceProvider.stopListening();
    _stopAnimation();
    widget.onListeningStop?.call();
  }

  void _stopAnimation() {
    _animationController.stop();
    _animationController.reset();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<VoiceProvider>(
      builder: (context, voiceProvider, child) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Microphone Button
            GestureDetector(
              onTap: () {
                if (!voiceProvider.isAvailable) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Speech recognition not available'),
                      backgroundColor: Colors.red,
                    ),
                  );
                  return;
                }

                if (voiceProvider.isListening) {
                  _stopListening(voiceProvider);
                } else {
                  _startListening(voiceProvider);
                }
              },
              child: AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return Transform.scale(
                    scale: voiceProvider.isListening ? _scaleAnimation.value : 1.0,
                    child: Container(
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: voiceProvider.isListening
                              ? [
                                  Colors.red.withOpacity(_opacityAnimation.value),
                                  Colors.redAccent.withOpacity(_opacityAnimation.value),
                                ]
                              : voiceProvider.isAvailable
                                  ? [
                                      Theme.of(context).primaryColor,
                                      Theme.of(context).primaryColor.withOpacity(0.8),
                                    ]
                                  : [
                                      Colors.grey,
                                      Colors.grey.withOpacity(0.8),
                                    ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: voiceProvider.isListening
                                ? Colors.red.withOpacity(0.3)
                                : Theme.of(context).primaryColor.withOpacity(0.3),
                            blurRadius: 15,
                            spreadRadius: voiceProvider.isListening ? 5 : 2,
                          ),
                        ],
                      ),
                      child: Icon(
                        voiceProvider.isListening
                            ? Icons.mic
                            : voiceProvider.isAvailable
                                ? Icons.mic_none
                                : Icons.mic_off,
                        color: Colors.white,
                        size: 30,
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 12),

            // Status Text
            Text(
              voiceProvider.isListening
                  ? 'Listening... Tap to stop'
                  : voiceProvider.isAvailable
                      ? widget.hintText ?? 'Tap to speak'
                      : 'Speech recognition unavailable',
              style: TextStyle(
                color: voiceProvider.isListening
                    ? Colors.red
                    : Theme.of(context).textTheme.bodyMedium?.color,
                fontSize: 14,
                fontWeight: voiceProvider.isListening ? FontWeight.w600 : FontWeight.normal,
              ),
              textAlign: TextAlign.center,
            ),

            // Result Display
            if (widget.showResultText && voiceProvider.lastWords.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  border: Border.all(
                    color: Theme.of(context).colorScheme.outline.withOpacity(0.3),
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.record_voice_over,
                          size: 16,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Recognized Text:',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Theme.of(context).colorScheme.primary,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      voiceProvider.lastWords,
                      style: const TextStyle(fontSize: 16),
                    ),
                    if (voiceProvider.confidence < 1.0) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Confidence: ${(voiceProvider.confidence * 100).toStringAsFixed(0)}%',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],

            // Clear Button
            if (voiceProvider.lastWords.isNotEmpty && widget.showResultText) ...[
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: () {
                  voiceProvider.clearLastWords();
                },
                icon: const Icon(Icons.clear, size: 16),
                label: const Text('Clear'),
                style: TextButton.styleFrom(
                  foregroundColor: Theme.of(context).colorScheme.error,
                ),
              ),
            ],
          ],
        );
      },
    );
  }
}

// Simple Voice Button Widget (for inline use)
class VoiceButton extends StatelessWidget {
  final Function(String)? onResult;
  final double size;
  final Color? color;
  final String? tooltip;

  const VoiceButton({
    super.key,
    this.onResult,
    this.size = 24,
    this.color,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<VoiceProvider>(
      builder: (context, voiceProvider, child) {
        return IconButton(
          onPressed: voiceProvider.isAvailable
              ? () async {
                  if (voiceProvider.isListening) {
                    await voiceProvider.stopListening();
                  } else {
                    await voiceProvider.startListening(
                      onResult: (result) {
                        if (result.isNotEmpty && onResult != null) {
                          onResult!(result);
                        }
                      },
                    );
                  }
                }
              : null,
          icon: Icon(
            voiceProvider.isListening
                ? Icons.mic
                : voiceProvider.isAvailable
                    ? Icons.mic_none
                    : Icons.mic_off,
            size: size,
            color: voiceProvider.isListening
                ? Colors.red
                : color ?? Theme.of(context).colorScheme.primary,
          ),
          tooltip: tooltip ?? 
              (voiceProvider.isListening
                  ? 'Stop listening'
                  : voiceProvider.isAvailable
                      ? 'Start voice input'
                      : 'Voice input unavailable'),
        );
      },
    );
  }
}

// Text-to-Speech Button Widget
class SpeakButton extends StatelessWidget {
  final String text;
  final double size;
  final Color? color;
  final String? tooltip;

  const SpeakButton({
    super.key,
    required this.text,
    this.size = 24,
    this.color,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    if (text.trim().isEmpty) return const SizedBox.shrink();

    return Consumer<VoiceProvider>(
      builder: (context, voiceProvider, child) {
        return IconButton(
          onPressed: () async {
            if (voiceProvider.isSpeaking) {
              await voiceProvider.stopSpeaking();
            } else {
              await voiceProvider.speak(text);
            }
          },
          icon: Icon(
            voiceProvider.isSpeaking ? Icons.stop : Icons.volume_up,
            size: size,
            color: voiceProvider.isSpeaking
                ? Colors.orange
                : color ?? Theme.of(context).colorScheme.primary,
          ),
          tooltip: tooltip ?? 
              (voiceProvider.isSpeaking ? 'Stop speaking' : 'Read aloud'),
        );
      },
    );
  }
}