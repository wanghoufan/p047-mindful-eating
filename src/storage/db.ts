import * as SQLite from 'expo-sqlite';

import type { MealNote, MealSession, LocalSettings } from '@/domain/types';
import { DEFAULT_SETTINGS } from '@/domain/types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('bitetempo.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS meal_session (
          id TEXT PRIMARY KEY NOT NULL,
          startedAt INTEGER NOT NULL,
          endedAt INTEGER,
          targetSeconds INTEGER NOT NULL,
          actualSeconds INTEGER,
          finishReason TEXT,
          createdAt INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS meal_note (
          id TEXT PRIMARY KEY NOT NULL,
          sessionId TEXT,
          rawText TEXT NOT NULL,
          finalText TEXT NOT NULL,
          revision INTEGER NOT NULL DEFAULT 1,
          polishedBy TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS settings_kv (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      return db;
    });
  }
  return dbPromise;
}

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// ---- settings (single row stored as JSON) ----
export async function loadSettings(): Promise<LocalSettings> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings_kv WHERE key = ?',
    'settings'
  );
  if (!row?.value) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(row.value) as Partial<LocalSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(s: LocalSettings): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO settings_kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    'settings',
    JSON.stringify(s)
  );
}

// ---- sessions ----
export async function insertSession(s: MealSession): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO meal_session (id, startedAt, endedAt, targetSeconds, actualSeconds, finishReason, createdAt) VALUES (?,?,?,?,?,?,?)',
    s.id,
    s.startedAt,
    s.endedAt,
    s.targetSeconds,
    s.actualSeconds,
    s.finishReason,
    s.createdAt
  );
}

export async function listSessions(): Promise<MealSession[]> {
  const db = await getDb();
  return db.getAllAsync<MealSession>('SELECT * FROM meal_session ORDER BY createdAt DESC');
}

// 结束一次会话（补上结束时间/实际时长/结束原因）；endedAt 为 NULL 的记录视为「未完成」
export async function finishSession(
  id: string,
  patch: { endedAt: number; actualSeconds: number; finishReason: MealSession['finishReason'] }
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE meal_session SET endedAt = ?, actualSeconds = ?, finishReason = ? WHERE id = ?',
    patch.endedAt,
    patch.actualSeconds,
    patch.finishReason,
    id
  );
}

// 当前进行中的会话（进程内存单例：杀进程后自然丢失，重启后 endedAt 为 NULL 的记录即「未完成」）
let activeSessionId: string | null = null;
export function setActiveSession(id: string | null): void {
  activeSessionId = id;
}
export function getActiveSessionId(): string | null {
  return activeSessionId;
}

// ---- notes ----
export async function listNotes(): Promise<MealNote[]> {
  const db = await getDb();
  return db.getAllAsync<MealNote>('SELECT * FROM meal_note ORDER BY updatedAt DESC');
}

export async function insertNote(n: MealNote): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO meal_note (id, sessionId, rawText, finalText, revision, polishedBy, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?)',
    n.id,
    n.sessionId,
    n.rawText,
    n.finalText,
    n.revision,
    n.polishedBy,
    n.createdAt,
    n.updatedAt
  );
}

export async function updateNote(n: MealNote): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE meal_note SET rawText = ?, finalText = ?, revision = ?, polishedBy = ?, updatedAt = ? WHERE id = ?',
    n.rawText,
    n.finalText,
    n.revision,
    n.polishedBy,
    n.updatedAt,
    n.id
  );
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM meal_note WHERE id = ?', id);
}

// ---- draft (single, auto-saved) ----
export type JournalDraft = { rawText: string; finalText: string; noteId: string | null };

export async function loadDraft(): Promise<JournalDraft | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings_kv WHERE key = ?',
    'journal_draft'
  );
  if (!row?.value) return null;
  try {
    return JSON.parse(row.value) as JournalDraft;
  } catch {
    return null;
  }
}

export async function saveDraft(d: JournalDraft): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO settings_kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    'journal_draft',
    JSON.stringify(d)
  );
}

export async function clearDraft(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM settings_kv WHERE key = ?', 'journal_draft');
}
