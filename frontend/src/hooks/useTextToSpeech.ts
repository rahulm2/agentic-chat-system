import { useState, useRef, useCallback } from 'react';
import { synthesizeSpeech } from '../api/tts';

const VOICE_ENABLED_KEY = 'voice_enabled';

function getInitialVoiceEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(VOICE_ENABLED_KEY) === 'true';
}

export function useTextToSpeech() {
  const [voiceEnabled, setVoiceEnabled] = useState(getInitialVoiceEnabled);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(VOICE_ENABLED_KEY, String(next));
      if (!next) {
        // Stop playing when voice is disabled
        audioRef.current?.pause();
        setIsPlaying(false);
        setPlayingMessageId(null);
      }
      return next;
    });
  }, []);

  const play = useCallback(async (text: string, messageId: string) => {
    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    let blobUrl = audioCacheRef.current.get(messageId);

    if (!blobUrl) {
      const buffer = await synthesizeSpeech(text, messageId);
      const blob = new Blob([buffer], { type: 'audio/mpeg' });
      blobUrl = URL.createObjectURL(blob);
      audioCacheRef.current.set(messageId, blobUrl);
    }

    const audio = new Audio(blobUrl);
    audioRef.current = audio;
    setIsPlaying(true);
    setPlayingMessageId(messageId);

    audio.onended = () => {
      setIsPlaying(false);
      setPlayingMessageId(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setPlayingMessageId(null);
      audioRef.current = null;
    };

    await audio.play();
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setPlayingMessageId(null);
  }, []);

  return {
    voiceEnabled,
    isPlaying,
    playingMessageId,
    toggleVoice,
    play,
    stopPlayback,
  };
}
