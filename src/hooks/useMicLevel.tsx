import { useEffect, useRef, useState } from 'react';

// Returns a normalized microphone level (0..1). When `enabled` is true, it
// acquires the mic stream and analyzes amplitude using an AnalyserNode.
// Cleans up all audio resources when disabled/unmounted.
const useMicLevel = (enabled: boolean) => {
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        if (!enabled) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);

        streamRef.current = stream;
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(data);
          // Compute RMS-like level
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128; // -1..1
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length); // 0..~0.5
          const normalized = Math.max(0, Math.min(1, rms * 2));
          if (!cancelled) setLevel(normalized);
          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        console.warn('useMicLevel: microphone unavailable', e);
        if (!cancelled) setLevel(0);
      }
    };

    const cleanup = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      analyserRef.current?.disconnect();
      analyserRef.current = null;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = null;
    };

    if (enabled) {
      setup();
    } else {
      cleanup();
      setLevel(0);
    }

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [enabled]);

  return level;
};

export default useMicLevel;
