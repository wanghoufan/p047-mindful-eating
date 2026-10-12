import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'ended';

function nowWall() {
  return Date.now();
}
function nowMono() {
  return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
}

/**
 * 可重入用餐计时状态机。
 * elapsed 用「每步增量累加」：默认按挂钟增量（含休眠/后台），
 * 一旦挂钟与单调时钟单步偏差 > 5s（疑似系统改时）则改用单调增量；负增量归零。
 */
export function useMealTimer() {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [targetMs, setTargetMs] = useState(600_000);
  const [elapsedMs, setElapsedMs] = useState(0);

  const elapsed = useRef(0);
  const lastWall = useRef(0);
  const lastMono = useRef(0);
  const target = useRef(600_000);

  const tick = useCallback(() => {
    const w = nowWall();
    const m = nowMono();
    let d = w - lastWall.current;
    const dm = m - lastMono.current;
    if (Math.abs(d - dm) > 5000) d = dm;
    if (d < 0) d = 0;
    lastWall.current = w;
    lastMono.current = m;
    elapsed.current += d;
    if (elapsed.current >= target.current) {
      elapsed.current = target.current;
      setElapsedMs(elapsed.current);
      setStatus((s) => (s === 'running' ? 'completed' : s));
      return;
    }
    setElapsedMs(elapsed.current);
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(tick, 500);
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') tick();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [status, tick]);

  const setTargetSeconds = useCallback((seconds: number) => {
    target.current = seconds * 1000;
    setTargetMs(target.current);
    setElapsedMs(elapsed.current);
  }, []);

  const start = useCallback(() => {
    elapsed.current = 0;
    lastWall.current = nowWall();
    lastMono.current = nowMono();
    setElapsedMs(0);
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    tick();
    setStatus('paused');
  }, [status, tick]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    lastWall.current = nowWall();
    lastMono.current = nowMono();
    setStatus('running');
  }, [status]);

  const end = useCallback(() => {
    setStatus('ended');
  }, []);

  const reset = useCallback(() => {
    elapsed.current = 0;
    setElapsedMs(0);
    setStatus('idle');
  }, []);

  const remainingMs = Math.max(0, targetMs - elapsedMs);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const actualSeconds = Math.round(Math.min(elapsed.current, target.current) / 1000);

  return {
    status,
    targetMs,
    elapsedMs,
    remainingSeconds,
    actualSeconds,
    setTargetSeconds,
    start,
    pause,
    resume,
    end,
    reset,
  };
}

export function formatMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
