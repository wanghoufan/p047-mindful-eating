import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { DayMinutes, MealNote, MealSession } from '@/domain/types';
import { getActiveSessionId, listNotes, listSessions } from '@/storage/db';
import { useSettings } from '@/settings/SettingsProvider';
import { Radius } from '@/theme/tokens';

const DAY = 86_400_000;

function formatMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default function StatsScreen() {
  const { colors } = useSettings();
  const { t, i18n } = useTranslation();

  const [sessions, setSessions] = useState<MealSession[]>([]);
  const [notes, setNotes] = useState<MealNote[]>([]);

  const refresh = useCallback(async () => {
    setSessions(await listSessions());
    setNotes(await listNotes());
  }, []);

  // 每次聚焦（含计时结束切回）都重新聚合
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const zh = i18n.language.startsWith('zh');
  const fmtDT = (ts: number) => {
    const d = new Date(ts);
    const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return zh ? `${d.getMonth() + 1}月${d.getDate()}日 ${hm}` : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
  };
  const dayLabel = (ts: number) => {
    const d = new Date(ts);
    const today = startOfDay(Date.now());
    if (startOfDay(ts) === today) return zh ? '今天' : 'Today';
    if (startOfDay(ts) === today - DAY) return zh ? '昨天' : 'Yesterday';
    return zh ? `${d.getMonth() + 1}.${d.getDate()}` : `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // 聚合（JS 实时计算；本地时区分组，避免 SQLite UTC 天边界错位）
  const finished = sessions.filter((s) => s.endedAt !== null);
  const total = sessions.length;
  const reached = finished.filter((s) => s.finishReason === 'reached_target').length;
  const totalSeconds = finished.reduce((a, s) => a + (s.actualSeconds ?? 0), 0);
  const avgSeconds = finished.length > 0 ? Math.round(totalSeconds / finished.length) : null;
  const rate = total > 0 ? Math.round((reached / total) * 100) : 0;

  const last7: DayMinutes[] = [];
  for (let i = 6; i >= 0; i--) {
    const ds = startOfDay(Date.now() - i * DAY);
    const seconds = sessions
      .filter((s) => s.startedAt >= ds && s.startedAt < ds + DAY)
      .reduce((a, s) => a + (s.actualSeconds ?? 0), 0);
    last7.push({ dayStart: ds, minutes: Math.round(seconds / 60), isToday: i === 0 });
  }
  const maxMin = Math.max(...last7.map((d) => d.minutes), 1);

  const activeId = getActiveSessionId();
  const noteBySession = new Map<string, MealNote>();
  for (const n of notes) if (n.sessionId) noteBySession.set(n.sessionId, n);

  const cards: { v: string; k: string }[] = [
    { v: `${total}`, k: t('stats.c1') },
    { v: `${rate}%`, k: t('stats.c2') },
    { v: `${Math.round(totalSeconds / 60)}`, k: t('stats.c3') },
    { v: avgSeconds !== null ? `${Math.round((avgSeconds / 60) * 10) / 10}` : '—', k: t('stats.c4') },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.topbar}>
        <Text style={[styles.title, { color: colors.fg }]}>{t('stats.title')}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings')} hitSlop={10}>
          <Ionicons name="settings-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {cards.map((c) => (
            <View key={c.k} style={[styles.statCard, { backgroundColor: colors.panel, borderColor: colors.stroke }]}>
              <Text style={[styles.statV, { color: colors.fg }]}>{c.v}</Text>
              <Text style={[styles.statK, { color: colors.muted }]}>{c.k}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.stroke }]}>
          <View style={styles.chartTitleRow}>
            <Text style={[styles.chartTitle, { color: colors.fg }]}>{t('stats.chartTitle')}</Text>
            <Text style={[styles.chartUnit, { color: colors.muted }]}>{t('stats.chartUnit')}</Text>
          </View>
          <View style={styles.bars}>
            {last7.map((d) => (
              <View key={d.dayStart} style={styles.barCol}>
                {d.minutes > 0 ? (
                  <Text style={[styles.barVal, { color: d.isToday ? colors.accent : colors.muted }]}>{d.minutes}</Text>
                ) : null}
                <View
                  style={[
                    styles.bar,
                    {
                      height: d.minutes > 0 ? Math.max(4, Math.round((d.minutes / maxMin) * 82)) : 3,
                      backgroundColor: d.minutes > 0 ? (d.isToday ? colors.accent : colors.accent2) : colors.stroke,
                    },
                  ]}
                />
                <Text style={[styles.barDay, { color: d.isToday ? colors.accent : colors.muted }]}>
                  {dayLabel(d.dayStart)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.section, { color: colors.fg }]}>{t('stats.listTitle')}</Text>
        {sessions.length === 0 ? (
          <Text style={{ color: colors.muted, fontSize: 13 }}>{t('stats.empty')}</Text>
        ) : (
          sessions.map((s) => {
            const note = s.id ? noteBySession.get(s.id) : undefined;
            const tag =
              s.endedAt === null
                ? {
                    text: s.id === activeId ? t('stats.tagActive') : t('stats.tagAbandon'),
                    color: s.id === activeId ? colors.accent : colors.danger,
                    bg: s.id === activeId ? colors.panel2 : 'rgba(192,67,47,0.12)',
                  }
                : s.finishReason === 'reached_target'
                  ? { text: t('stats.tagHit'), color: colors.accent, bg: 'rgba(31,157,132,0.14)' }
                  : { text: t('stats.tagEarly'), color: colors.accent2, bg: colors.panel2 };
            return (
              <View key={s.id} style={[styles.recCard, { backgroundColor: colors.panel, borderColor: colors.stroke }]}>
                <View style={styles.recTop}>
                  <Text style={[styles.recDate, { color: colors.accent }]}>{fmtDT(s.startedAt)}</Text>
                  <View style={[styles.tag, { backgroundColor: tag.bg }]}>
                    <Text style={{ color: tag.color, fontSize: 10.5, fontWeight: '700' }}>{tag.text}</Text>
                  </View>
                </View>
                <Text style={[styles.recMid, { color: colors.fg }]}>
                  {s.actualSeconds !== null ? formatMMSS(s.actualSeconds) : '—'}
                  <Text style={{ color: colors.muted, fontSize: 12.5, fontWeight: '600' }}>
                    {'  ·  '}
                    {t('stats.target', { min: Math.round(s.targetSeconds / 60) })}
                  </Text>
                </Text>
                {s.endedAt === null && s.id !== activeId ? (
                  <Text style={[styles.recNote, { color: colors.muted, borderColor: colors.stroke }]}>
                    {t('stats.autoNote')}
                  </Text>
                ) : note ? (
                  <Text style={[styles.recNote, { color: colors.muted, borderColor: colors.stroke }]} numberOfLines={2}>
                    ❝ {note.finalText || note.rawText}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  content: { paddingHorizontal: 22, paddingBottom: 40, gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  statCard: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: 15,
  },
  statV: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  statK: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  card: { borderRadius: Radius.card, borderWidth: 1, padding: 15, marginTop: 2 },
  chartTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  chartTitle: { fontSize: 13, fontWeight: '700' },
  chartUnit: { fontSize: 11, fontWeight: '600' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 116, gap: 9 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6, height: '100%' },
  barVal: { fontSize: 10, fontWeight: '700' },
  bar: { width: '100%', maxWidth: 30, borderRadius: 6 },
  barDay: { fontSize: 10.5, fontWeight: '600' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  recCard: { borderRadius: Radius.card, borderWidth: 1, padding: 14 },
  recTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  recDate: { fontSize: 12, fontWeight: '700' },
  tag: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  recMid: { fontSize: 14, fontWeight: '700', marginTop: 6, fontVariant: ['tabular-nums'] },
  recNote: { fontSize: 12.5, lineHeight: 19, marginTop: 7, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 7 },
});
