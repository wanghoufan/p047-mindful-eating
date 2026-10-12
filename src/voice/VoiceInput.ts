/**
 * VoiceInputAdapter — 系统语音输入统一入口（持续聆听）。
 *
 * 背景（2026-10-12 真机实测）：MIUI 的系统识别服务在单次会话里经常
 * “内部识别了却回传空结果”或“DIALOG_START 超时”，单次识别不可靠。
 * 处理：单次结束后**立即自动续听**并累积已识别内容；用户点“停止”才结束。
 * 仍只用本机系统能力（SpeechRecognizer / RecognizerIntent），不接第三方 ASR；
 * 原生完全不可用时整体回退到键盘语音/手动输入。
 */
import { PermissionsAndroid, Platform } from 'react-native';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'error';

export type VoiceCapability =
  | { available: true; onDevice: boolean }
  | { available: false; reason: 'no_module' | 'no_service' };

type NativeSpeech = {
  isAvailable(): Promise<boolean>;
  isOnDeviceAvailable?(): Promise<boolean>;
  start(locale: string): Promise<void>;
  startIntent?(locale: string): Promise<void>;
  stop(): Promise<void>;
  destroyRecognizer?(): Promise<void>;
  cancel(): Promise<void>;
  addListener(event: string, cb: (payload: any) => void): { remove(): void };
};

function loadNative(): NativeSpeech | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../../modules/my-module');
    const native = mod?.default ?? mod;
    if (native && typeof native.isAvailable === 'function') return native as NativeSpeech;
  } catch (e) {
    console.warn('[voice] loadNative failed:', String(e));
  }
  return null;
}

async function ensurePermission(): Promise<'granted' | 'denied' | 'unavailable'> {
  if (Platform.OS !== 'android') return 'unavailable';
  try {
    const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return res === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export async function getCapability(): Promise<VoiceCapability> {
  const native = loadNative();
  if (!native) return { available: false, reason: 'no_module' };
  try {
    const on = native.isOnDeviceAvailable ? await native.isOnDeviceAvailable() : false;
    const ok = await native.isAvailable();
    if (!ok) return { available: false, reason: 'no_service' };
    return { available: true, onDevice: on };
  } catch {
    return { available: false, reason: 'no_service' };
  }
}

function joinText(prev: string, next: string): string {
  const p = prev.trim();
  const n = next.trim();
  if (!n) return p;
  if (!p) return n;
  if (p.endsWith(n) || p.includes(n)) return p;
  if (n.startsWith(p) || n.includes(p)) return n;
  return `${p}${n}`;
}

export type VoiceSession = {
  stop: () => void;
  cancel: () => void;
};

export async function startListening(opts: {
  locale: string;
  initialText?: string;
  onPartial?: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (code: 'permission' | 'no_result' | 'unavailable') => void;
}): Promise<VoiceSession | null> {
  const native = loadNative();
  if (!native) {
    opts.onError('unavailable');
    return null;
  }
  const perm = await ensurePermission();
  if (perm === 'denied') {
    opts.onError('permission');
    return null;
  }

  let accumulated = (opts.initialText ?? '').trim();
  let lastPartial = '';
  let stopping = false;
  let settled = false;
  let restartTimer: ReturnType<typeof setTimeout> | null = null;

  const subs: { remove(): void }[] = [];
  const cleanup = () => subs.forEach((s) => s.remove());
  const emit = () => opts.onPartial?.(joinText(accumulated, lastPartial));

  const finish = (err?: 'permission' | 'no_result' | 'unavailable') => {
    if (settled) return;
    settled = true;
    try {
      native.cancel();
      native.destroyRecognizer?.();
    } catch {
      // ignore
    }
    cleanup();
    const text = joinText(accumulated, lastPartial).trim();
    if (err) opts.onError(err);
    else if (text) opts.onFinal(text);
    else opts.onError('no_result');
  };

  const begin = async () => {
    if (stopping || settled) return;
    try {
      await native.start(opts.locale);
    } catch (e) {
      console.warn('[voice] start threw:', String(e));
      finish('unavailable');
    }
  };

  const onSessionEnd = () => {
    const t = lastPartial.trim();
    if (t) {
      accumulated = joinText(accumulated, t);
      lastPartial = '';
      emit();
    }
    if (stopping || settled) {
      finish();
      return;
    }
    setTimeout(() => void begin(), 1200);
  };

  subs.push(
    native.addListener('onPartial', (p: any) => {
      const t = String(p?.text ?? '').trim();
      if (t) {
        lastPartial = t;
        emit();
      }
    })
  );
  subs.push(native.addListener('onResult', () => onSessionEnd()));
  subs.push(native.addListener('onEnd', () => onSessionEnd()));
  subs.push(
    native.addListener('onError', (p: any) => {
      const code = String(p?.code ?? '');
      if (code === 'permission') {
        finish('permission');
        return;
      }
      onSessionEnd();
    })
  );

  await begin();

  return {
    stop: () => {
      stopping = true;
      try {
        native.stop();
      } catch {
        // ignore
      }
      setTimeout(() => finish(), 1500);
    },
    cancel: () => {
      stopping = true;
      try {
        native.cancel();
      } catch {
        // ignore
      }
      settled = true;
      cleanup();
    },
  };
}
