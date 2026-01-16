"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const TRACKS = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  name: `Focus ${i + 1}`,
  src: `/audio/focus-${i + 1}.mp3`,
}));

const VOLUME_STORAGE_KEY = "hayai-audio-volume";
const TRACK_STORAGE_KEY = "hayai-audio-track";

interface UseAudioReturn {
  isPlaying: boolean;
  currentTrack: typeof TRACKS[0];
  volume: number;
  isMuted: boolean;
  tracks: typeof TRACKS;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  selectTrack: (trackId: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

export function useAudio(): UseAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState(1);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const currentTrack = TRACKS.find((t) => t.id === currentTrackId) || TRACKS[0];

  // Initialize audio element and restore settings
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create audio element
    const audio = new Audio();
    audio.loop = false;
    audioRef.current = audio;

    // Restore saved settings
    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    const savedTrack = localStorage.getItem(TRACK_STORAGE_KEY);

    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      if (!isNaN(vol) && vol >= 0 && vol <= 1) {
        setVolumeState(vol);
        audio.volume = vol;
      }
    }

    if (savedTrack) {
      const trackId = parseInt(savedTrack, 10);
      if (!isNaN(trackId) && trackId >= 1 && trackId <= TRACKS.length) {
        setCurrentTrackId(trackId);
      }
    }

    setIsInitialized(true);

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Update audio src when track changes
  useEffect(() => {
    if (!audioRef.current || !isInitialized) return;
    audioRef.current.src = currentTrack.src;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrack.src, isInitialized]);

  // Handle track end - advance to next track
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      const nextId = currentTrackId >= TRACKS.length ? 1 : currentTrackId + 1;
      setCurrentTrackId(nextId);
      localStorage.setItem(TRACK_STORAGE_KEY, String(nextId));
    };

    const audio = audioRef.current;
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackId]);

  // Update volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const play = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const selectTrack = useCallback((trackId: number) => {
    if (trackId >= 1 && trackId <= TRACKS.length) {
      setCurrentTrackId(trackId);
      localStorage.setItem(TRACK_STORAGE_KEY, String(trackId));
    }
  }, []);

  const nextTrack = useCallback(() => {
    const nextId = currentTrackId >= TRACKS.length ? 1 : currentTrackId + 1;
    selectTrack(nextId);
  }, [currentTrackId, selectTrack]);

  const prevTrack = useCallback(() => {
    const prevId = currentTrackId <= 1 ? TRACKS.length : currentTrackId - 1;
    selectTrack(prevId);
  }, [currentTrackId, selectTrack]);

  return {
    isPlaying,
    currentTrack,
    volume,
    isMuted,
    tracks: TRACKS,
    play,
    pause,
    toggle,
    setVolume,
    toggleMute,
    selectTrack,
    nextTrack,
    prevTrack,
  };
}
