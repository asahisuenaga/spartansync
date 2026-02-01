import { useState, useCallback, useEffect } from 'react';
import { speakText as speakWithElevenLabs } from '../lib/elevenlabs';
import { useAccessibility } from '../context/AccessibilityContext';

type TTSState = {
    isSpeaking: boolean;
    isLoading: boolean;
    error: string | null;
};

export const useTTS = () => {
    const [state, setState] = useState<TTSState>({
        isSpeaking: false,
        isLoading: false,
        error: null,
    });

    // Get preferred voice from global context
    const { voiceId } = useAccessibility();

    // Keep track of the current audio object to stop it if needed
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

    const stop = useCallback(() => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        window.speechSynthesis.cancel();
        setState(prev => ({ ...prev, isSpeaking: false, isLoading: false }));
    }, [currentAudio]);

    const speak = useCallback(async (text: string) => {
        stop(); // Stop any current speech
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // 1. Try ElevenLabs first if Key exists
        if (import.meta.env.VITE_ELEVENLABS_API_KEY) {
            try {
                // Pass the preferred voiceId
                const audio = await speakWithElevenLabs(text, voiceId);
                setCurrentAudio(audio);

                audio.onended = () => {
                    setState(prev => ({ ...prev, isSpeaking: false }));
                };

                audio.onplay = () => {
                    setState(prev => ({ ...prev, isLoading: false, isSpeaking: true }));
                }

                // This promise resolves when playback starts, not finishes
                await audio.play();
                return;

            } catch (err) {
                console.warn("ElevenLabs failed, falling back to Web Speech API:", err);
                // Continue to fallback...
            }
        }

        // 2. Fallback to Web Speech API
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => {
                setState(prev => ({ ...prev, isLoading: false, isSpeaking: true }));
            };

            utterance.onend = () => {
                setState(prev => ({ ...prev, isSpeaking: false }));
            };

            utterance.onerror = (e) => {
                console.error("Web Speech API Error:", e);
                setState(prev => ({ ...prev, isSpeaking: false, error: "Speech failed" }));
            }

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error("All TTS methods failed", err);
            setState(prev => ({ ...prev, isLoading: false, error: "TTS Failed" }));
        }

    }, [stop, voiceId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        }
    }, [stop]);

    return {
        speak,
        stop,
        ...state
    };
};
