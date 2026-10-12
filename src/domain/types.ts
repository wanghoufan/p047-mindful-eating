export type ThemeMode = 'light' | 'dark' | 'system';
export type LanguageMode = 'system' | 'zh-CN' | 'en';
export type FinishReason = 'reached_target' | 'early_end';

export type DurationPreset = 600 | 720 | 900 | 1200;

export type MealSession = {
  id: string;
  startedAt: number;
  endedAt: number | null;
  targetSeconds: number;
  actualSeconds: number | null;
  finishReason: FinishReason | null;
  createdAt: number;
};

export type MealNote = {
  id: string;
  sessionId: string | null;
  rawText: string;
  finalText: string;
  revision: number;
  polishedBy: string | null;
  createdAt: number;
  updatedAt: number;
};

export type LocalSettings = {
  durationPreset: DurationPreset;
  themeMode: ThemeMode;
  languageMode: LanguageMode;
  reminderEnabled: boolean;
  reminderIntervalSeconds: 30 | 60 | 90 | 120;
  reduceMotion: boolean;
};

export const DEFAULT_SETTINGS: LocalSettings = {
  durationPreset: 600,
  themeMode: 'system',
  languageMode: 'system',
  reminderEnabled: true,
  reminderIntervalSeconds: 60,
  reduceMotion: false,
};
