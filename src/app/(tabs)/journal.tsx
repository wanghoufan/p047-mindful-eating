import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getProvider, polishErrorMessageKey } from '@/ai';
import type { MealNote, MealSession } from '@/domain/types';
import {
  clearDraft,
  deleteNote,
  insertNote,
  listNotes,
  listSessions,
  loadDraft,
  saveDraft,
  uid,
  updateNote,
} from '@/storage/db';
import { useSettings } from '@/settings/SettingsProvider';
import { Radius } from '@/theme/tokens';
import { getCapability, startListening, type VoiceSession } from '@/voice/VoiceInput';

type Phase = 'idle' | 'listening' | 'polishing';

function formatMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function JournalScreen() {
  const { colors } = useSettings();
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ sessionId?: string }>();

  const [rawText, setRawText] = useState('');
  const [polished, setPolished] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [notes, setNotes] = useState<MealNote[]>([]);
  const [sessions, setSessions] = useState<MealSession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const session = useRef<VoiceSession | null>(null);
  const rawRef = useRef('');
  rawRef.current = rawText;

  const refresh = useCallback(async () => {
    setNotes(await listNotes());
    setSessions(await listSessions());
  }, []);

  useEffect(() => {
    (async () => {
      const d = await loadDraft();
      if (d) {
        setRawText(d.rawText);
        setPolished(d.finalText && d.finalText !== d.rawText ? d.finalText : '');
        setEditingId(d.noteId);
      }
      await refresh();
    })();
  }, [refresh]);

  // 从计时页「记录一点心得」跳转过来：把本次用餐与笔记关联
  useEffect(() => {
    if (params.sessionId) setPendingSessionId(params.sessionId);
  }, [params.sessionId]);

  const pendingSession = pendingSessionId
    ? sessions.find((s) => s.id === pendingSessionId) ?? null
    : null;

  // 草稿自动保存（防丢）
  const persistDraft = useCallback(
    (raw: string, finalText: string) => {
      if (!raw.trim() && !finalText.trim()) return;
      void saveDraft({ rawText: raw, finalText, noteId: editingId });
    },
    [editingId]
  );

  const onChangeRaw = (v: string) => {
    setRawText(v);
    persistDraft(v, polished);
  };

  const onVoice = async () => {
    setError(null);
    if (phase === 'listening') {
      session.current?.stop();
      return;
    }
    // 取消任何残留会话，避免后台仍在聆听
    session.current?.cancel();
    session.current = null;
    const cap = await getCapability();
    if (!cap.available) {
      setError(t('journal.manualHint'));
      return;
    }
    setPhase('listening');
    const s = await startListening({
      locale: i18n.language || 'zh-CN',
      initialText: rawRef.current,
      onPartial: (text) => setRawText(text),
      onFinal: (text) => {
        setPhase('idle');
        const merged = text.trim() || rawRef.current;
        setRawText(merged);
        persistDraft(merged, polished);
      },
      onError: (code) => {
        setPhase('idle');
        setError(
          code === 'permission' ? t('journal.voicePermission') : code === 'no_result' ? t('journal.voiceNoResult') : t('journal.voiceUnavailable')
        );
      },
    });
    session.current = s;
  };

  const onPolish = async () => {
    if (!rawText.trim()) return;
    setError(null);
    setPhase('polishing');
    try {
      const provider = getProvider();
      const res = await provider.polish({ originalText: rawText.trim(), locale: (i18n.language as 'zh-CN' | 'en') ?? 'zh-CN' });
      setPolished(res.polishedText);
      setPhase('idle');
    } catch (e) {
      setPhase('idle');
      setError(t(polishErrorMessageKey(e)));
    }
  };

  const onSave = async () => {
    const finalText = (polished || rawText).trim();
    if (!finalText && !rawText.trim()) return;
    try {
      const now = Date.now();
      if (editingId) {
        const existing = notes.find((n) => n.id === editingId);
        if (existing) {
          await updateNote({
            ...existing,
            rawText,
            finalText: finalText || rawText,
            revision: existing.revision + 1,
            polishedBy: polished ? 'deepseek' : existing.polishedBy,
            updatedAt: now,
          });
        } else {
          await insertNote({
            id: editingId,
            sessionId: pendingSessionId,
            rawText,
            finalText: finalText || rawText,
            revision: 1,
            polishedBy: polished ? 'deepseek' : null,
            createdAt: now,
            updatedAt: now,
          });
        }
      } else {
        await insertNote({
          id: uid(),
          sessionId: pendingSessionId,
          rawText,
          finalText: finalText || rawText,
          revision: 1,
          polishedBy: polished ? 'deepseek' : null,
          createdAt: now,
          updatedAt: now,
        });
      }
      await clearDraft();
      setRawText('');
      setPolished('');
      setEditingId(null);
      setPendingSessionId(null);
      await refresh();
    } catch {
      setError(t('journal.saveFailed'));
    }
  };

  const onEdit = (n: MealNote) => {
    setEditingId(n.id);
    setRawText(n.rawText);
    setPolished(n.finalText && n.finalText !== n.rawText ? n.finalText : '');
    setError(null);
  };

  const onDelete = (n: MealNote) => {
    Alert.alert(t('journal.deleteTitle'), t('journal.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteNote(n.id);
          if (editingId === n.id) {
            setEditingId(null);
            setRawText('');
            setPolished('');
          }
          await refresh();
        },
      },
    ]);
  };

  const listening = phase === 'listening';
  const busy = phase === 'polishing';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.topbar}>
        <Text style={[styles.title, { color: colors.fg }]}>{t('journal.title')}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings')} hitSlop={10}>
          <Ionicons name="settings-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={onVoice}
            style={[styles.voice, { backgroundColor: listening ? colors.accent2 : colors.accent }]}>
            <Ionicons name={listening ? 'stop-circle' : 'mic'} size={22} color={colors.onAccent} />
            <Text style={[styles.voiceText, { color: colors.onAccent }]}>
              {listening ? t('journal.stop') : t('journal.voiceRecord')}
            </Text>
          </Pressable>

          {listening ? (
            <Text style={[styles.listening, { color: colors.accent }]}>● {t('journal.listening')}</Text>
          ) : null}

          {pendingSession ? (
            <View style={[styles.linkBadge, { backgroundColor: colors.panel2 }]}>
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>
                {t('journal.pendingLink', { t: formatMMSS(pendingSession.actualSeconds ?? 0) })}
              </Text>
            </View>
          ) : null}

          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          <Text style={[styles.label, { color: colors.muted }]}>{t('journal.rawLabel')}</Text>
          <TextInput
            value={rawText}
            onChangeText={onChangeRaw}
            onBlur={() => persistDraft(rawText, polished)}
            placeholder={t('journal.rawPlaceholder')}
            placeholderTextColor={colors.muted}
            multiline
            style={[styles.input, { color: colors.fg, backgroundColor: colors.panel, borderColor: colors.stroke }]}
          />

          <View style={styles.rowBtns}>
            <Pressable
              disabled={busy || !rawText.trim()}
              onPress={onPolish}
              style={[styles.primary, { backgroundColor: colors.accent, opacity: busy || !rawText.trim() ? 0.5 : 1 }]}>
              <Text style={[styles.primaryText, { color: colors.onAccent }]}>
                {busy ? t('journal.polishing') : t('journal.polish')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              style={[styles.secondary, { borderColor: colors.stroke }]}>
              <Text style={{ color: colors.fg, fontWeight: '600' }}>{t('journal.directSave')}</Text>
            </Pressable>
          </View>

          {polished ? (
            <>
              <Text style={[styles.label, { color: colors.muted }]}>{t('journal.polishLabel')}</Text>
              <TextInput
                value={polished}
                onChangeText={(v) => {
                  setPolished(v);
                  persistDraft(rawText, v);
                }}
                multiline
                style={[styles.input, { color: colors.fg, backgroundColor: colors.panel, borderColor: colors.stroke }]}
              />
            </>
          ) : null}

          <Text style={[styles.section, { color: colors.fg }]}>{t('journal.history')}</Text>
          {notes.length === 0 ? (
            <Text style={{ color: colors.muted }}>{t('journal.empty')}</Text>
          ) : (
            notes.map((n) => {
              const linked = n.sessionId ? sessions.find((s) => s.id === n.sessionId) : null;
              return (
                <View key={n.id} style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.stroke }]}>
                  <Text style={[styles.cardDate, { color: colors.accent }]}>
                    {new Date(n.updatedAt).toLocaleString(i18n.language)}
                  </Text>
                  <Text style={[styles.cardText, { color: colors.fg }]}>{n.finalText || n.rawText}</Text>
                  {linked ? (
                    <Text style={[styles.linkedText, { color: colors.accent }]}>
                      {t('journal.linkedMeal', { t: formatMMSS(linked.actualSeconds ?? 0) })}
                    </Text>
                  ) : null}
                  <View style={styles.cardActions}>
                    <Pressable onPress={() => onEdit(n)} hitSlop={8}>
                      <Text style={{ color: colors.muted }}>{t('common.edit')}</Text>
                    </Pressable>
                    <Pressable onPress={() => onDelete(n)} hitSlop={8}>
                      <Text style={{ color: colors.danger }}>{t('common.delete')}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 10, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  content: { paddingHorizontal: 22, paddingBottom: 40, gap: 12 },
  voice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 56, borderRadius: Radius.control },
  voiceText: { fontSize: 16, fontWeight: '700' },
  listening: { fontSize: 13, fontWeight: '600', marginTop: -4 },
  linkBadge: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  error: { fontSize: 13 },
  label: { fontSize: 12, marginTop: 4 },
  input: { minHeight: 130, borderRadius: Radius.control, borderWidth: 1, padding: 14, fontSize: 14, lineHeight: 22, textAlignVertical: 'top' },
  rowBtns: { flexDirection: 'row', gap: 10 },
  primary: { flex: 1, minHeight: 50, borderRadius: Radius.control, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 15, fontWeight: '700' },
  secondary: { minWidth: 110, minHeight: 50, borderRadius: Radius.control, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 16 },
  card: { borderRadius: Radius.card, borderWidth: 1, padding: 15 },
  cardDate: { fontSize: 11, fontWeight: '600' },
  cardText: { fontSize: 14, lineHeight: 21, marginTop: 4 },
  linkedText: { fontSize: 11, fontWeight: '700', marginTop: 6 },
  cardActions: { flexDirection: 'row', gap: 16, marginTop: 10 },
});
