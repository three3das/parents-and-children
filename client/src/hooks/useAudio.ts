import { useCallback, useRef, useEffect } from 'react';
import { AUDIO_CONFIG } from '@/lib/constants';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Cleanup function
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Stop all active audio sources
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source may already be stopped
      }
    });
    activeSourcesRef.current.clear();

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const playCustomAudio = useCallback(async (audioFile: string) => {
    try {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(audioFile);
      audio.volume = AUDIO_CONFIG.defaultVolume;
      audio.preload = 'auto';

      audioRef.current = audio;

      await audio.play();
    } catch (error) {
      console.warn('Failed to play custom audio:', error);
    }
  }, []);

  const playLetterSound = useCallback((letter: string) => {
    // Use Russian audio folder for Cyrillic letters
    const customAudioPath = `/audio/letters/рос/${letter.toUpperCase()}.mp3`;

    const audio = new Audio(customAudioPath);

    audio.addEventListener('error', () => {
      console.log(`Russian audio not found for letter: ${letter}, using Web Speech API`);
      // Fallback to Web Speech API
      try {
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.7;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn('Speech synthesis not available:', error);
      }
    });

    audio.addEventListener('canplaythrough', () => {
      console.log(`Playing Russian audio for letter: ${letter}`);
    });

    audio.play().catch(() => {
      console.log(`Failed to play audio for letter: ${letter}, using Web Speech API`);
      // Fallback to Web Speech API
      try {
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.7;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn('Speech synthesis not available:', error);
      }
    });
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not available:', error);
        return null;
      }
    }
    return audioContextRef.current;
  }, []);

  const playApplause = useCallback(() => {
    try {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      const audioPath = '/audio/pobeda.mp3';
      const audio = new Audio(audioPath);
      audio.volume = AUDIO_CONFIG.defaultVolume;
      audio.preload = 'auto';

      audioRef.current = audio;

      // Play for 1.5 seconds max
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Only set timeout if play was successful
            setTimeout(() => {
              if (audioRef.current === audio) {
                audio.pause();
                audio.currentTime = 0;
                audioRef.current = null;
              }
            }, 1500);
          })
          .catch((error) => {
            console.warn('Failed to play applause sound:', error);
            if (audioRef.current === audio) {
              audioRef.current = null;
            }
          });
      }
    } catch (error) {
      console.warn('Failed to play applause sound:', error);
    }
  }, []);

  const playTryAgain = useCallback(() => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    try {
      // Create a gentle "try again" sound - descending notes
      const duration = 0.6;
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate a gentle descending sound
      for (let i = 0; i < data.length; i++) {
        const time = i / sampleRate;
        let sample = 0;

        // Two descending tones: G4 to E4 (gentle disappointment)
        if (time < 0.3) {
          sample += Math.sin(2 * Math.PI * 392 * time) * Math.exp(-time * 4) * 0.2; // G4
        }
        if (time >= 0.2 && time < 0.6) {
          sample += Math.sin(2 * Math.PI * 329.63 * (time - 0.2)) * Math.exp(-(time - 0.2) * 4) * 0.2; // E4
        }

        data[i] = sample;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;

      // Track active sources for cleanup
      activeSourcesRef.current.add(source);
      source.addEventListener('ended', () => {
        activeSourcesRef.current.delete(source);
      });

      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Failed to play try again sound:', error);
    }
  }, [getAudioContext]);

  return {
    playLetterSound,
    playApplause,
    playTryAgain,
    playCustomAudio,
    cleanup
  };
}
