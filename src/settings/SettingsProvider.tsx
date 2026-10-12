import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import type { LocalSettings } from '@/domain/types';
import { DEFAULT_SETTINGS } from '@/domain/types';
import { setLanguage } from '@/i18n';
import { loadSettings, saveSettings } from '@/storage/db';
import type { ColorTokens, Scheme } from '@/theme/tokens';
import { tokensFor } from '@/theme/tokens';

type Ctx = {
  settings: LocalSettings;
  ready: boolean;
  scheme: Scheme;
  colors: ColorTokens;
  update: (patch: Partial<LocalSettings>) => void;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [settings, setSettings] = useState<LocalSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await loadSettings();
      if (!mounted) return;
      setSettings(loaded);
      setLanguage(loaded.languageMode);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const update = useCallback((patch: Partial<LocalSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (patch.languageMode) setLanguage(next.languageMode);
      void saveSettings(next);
      return next;
    });
  }, []);

  // 系统外观/语言变化时，跟随模式自动更新（SYSTEM / FOLLOW_SYSTEM）。
  useEffect(() => {
    if (settings.themeMode === 'system' && system) {
      // useColorScheme 变化会触发本 effect 重算 scheme
    }
  }, [system, settings.themeMode]);

  useEffect(() => {
    setLanguage(settings.languageMode);
    // 系统语言变化时同步（i18next 无系统监听，重进设置或前台切换时刷新）
  }, [settings.languageMode]);

  const scheme: Scheme = settings.themeMode === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.themeMode;
  const colors = useMemo(() => tokensFor(scheme), [scheme]);

  const value = useMemo<Ctx>(() => ({ settings, ready, scheme, colors, update }), [settings, ready, scheme, colors, update]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
