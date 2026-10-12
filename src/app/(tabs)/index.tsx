import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Orb } from '@/components/Orb';
import { TipRotator } from '@/components/TipRotator';
import type { DurationPreset } from '@/domain/types';
import { uid, insertSession } from '@/storage/db';
import { formatMMSS, useMealTimer } from '@/state/useMealTimer';
import { useSettings } from '@/settings/SettingsProvider';
import { Radius, Space } from '@/theme/tokens';

const PRESETS: DurationPreset[] = [600, 720, 900, 1200];

export default function MealScreen() {
  const { colors, settings, update } = useSettings();
  const { t } = useTranslation();
  const timer = useMealTimer();
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [reached, setReached] = useState(false);

  const tips = useMemo(() => t('tips', { returnObjects: true }) as string[], [t]);

  // 记忆上次时长选择
  useEffect(() => {
    timer.setTargetSeconds(settings.durationPreset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.durationPreset]);

  // 到时提示（不发声）
  useEffect(() => {
    if (timer.status === 'completed' && !reached) {
      setReached(true);
      void insertSession({
        id: uid(),
        startedAt: Date.now() - timer.targetMs,
        endedAt: Date.now(),
        targetSeconds: Math.round(timer.targetMs / 1000),
        actualSeconds: Math.round(timer.targetMs / 1000),
        finishReason: 'reached_target',
        createdAt: Date.now(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.status]);

  const onPreset = (p: DurationPreset) => {
    update({ durationPreset: p });
  };

  const doEndEarly = () => {
    const actual = timer.actualSeconds;
    void insertSession({
      id: uid(),
      startedAt: Date.now() - actual * 1000,
      endedAt: Date.now(),
      targetSeconds: Math.round(timer.targetMs / 1000),
      actualSeconds: actual,
      finishReason: 'early_end',
      createdAt: Date.now(),
    });
    setConfirmEnd(false);
    setReached(false);
    timer.end();
  };

  const running = timer.status === 'running';
  const paused = timer.status === 'paused';
  const idle = timer.status === 'idle';
  const done = timer.status === 'completed';
  const ended = timer.status === 'ended';
  const active = running || paused;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.topbar}>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { backgroundColor: colors.accent }]} />
          <Text style={[styles.brand, { color: colors.fg }]}>{t('app.name')}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings')} hitSlop={10}>
          <Ionicons name="settings-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{t('meal.subtitle')}</Text>

        <View style={styles.hero}>
          <Orb colors={colors} paused={paused} reduceMotion={settings.reduceMotion} size={142} />
          <Text style={[styles.timer, { color: colors.fg }]}>
            {formatMMSS(timer.remainingSeconds)}
          </Text>
          {done ? (
            <Text style={[styles.status, { color: colors.accent }]}>{t('meal.targetReached')}</Text>
          ) : ended ? (
            <Text style={[styles.status, { color: colors.muted }]}>{t('meal.ended')}</Text>
          ) : (
            <Text style={[styles.status, { color: colors.accent }]}>
              {active ? t('meal.started') : ' '}
            </Text>
          )}
          <TipRotator
            tips={tips}
            intervalSeconds={settings.reminderIntervalSeconds}
            enabled={settings.reminderEnabled}
            paused={paused || !running ? paused : false}
            colors={colors}
          />
        </View>

        <View style={styles.pills}>
          {PRESETS.map((p) => {
            const selected = settings.durationPreset === p;
            return (
              <Pressable
                key={p}
                disabled={active}
                onPress={() => onPreset(p)}
                style={[
                  styles.pill,
                  {
                    borderColor: selected ? colors.accent : colors.stroke,
                    backgroundColor: selected ? colors.panel2 : colors.panel,
                    opacity: active ? 0.45 : 1,
                  },
                ]}>
                <Text style={{ color: selected ? colors.fg : colors.muted, fontWeight: '600' }}>
                  {t('meal.preset', { min: p / 60 })}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          {idle && (
            <Pressable style={[styles.primary, { backgroundColor: colors.accent }]} onPress={timer.start}>
              <Text style={[styles.primaryText, { color: colors.onAccent }]}>{t('meal.start')}</Text>
            </Pressable>
          )}
          {running && (
            <>
              <Pressable style={[styles.primary, { backgroundColor: colors.accent }]} onPress={timer.pause}>
                <Text style={[styles.primaryText, { color: colors.onAccent }]}>{t('meal.pause')}</Text>
              </Pressable>
              <Pressable style={[styles.secondary, { borderColor: colors.stroke }]} onPress={() => setConfirmEnd(true)}>
                <Text style={{ color: colors.fg, fontWeight: '600' }}>{t('meal.end')}</Text>
              </Pressable>
            </>
          )}
          {paused && (
            <>
              <Pressable style={[styles.primary, { backgroundColor: colors.accent }]} onPress={timer.resume}>
                <Text style={[styles.primaryText, { color: colors.onAccent }]}>{t('meal.resume')}</Text>
              </Pressable>
              <Pressable style={[styles.secondary, { borderColor: colors.stroke }]} onPress={() => setConfirmEnd(true)}>
                <Text style={{ color: colors.fg, fontWeight: '600' }}>{t('meal.end')}</Text>
              </Pressable>
            </>
          )}
          {(done || ended) && (
            <>
              <Pressable
                style={[styles.primary, { backgroundColor: colors.accent }]}
                onPress={() => {
                  setReached(false);
                  timer.reset();
                  router.push('/(tabs)/journal');
                }}>
                <Text style={[styles.primaryText, { color: colors.onAccent }]}>{t('meal.recordNote')}</Text>
              </Pressable>
              <Pressable
                style={[styles.secondary, { borderColor: colors.stroke }]}
                onPress={() => {
                  setReached(false);
                  timer.reset();
                }}>
                <Text style={{ color: colors.fg, fontWeight: '600' }}>{t('meal.again')}</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      <Modal transparent visible={confirmEnd} animationType="fade" onRequestClose={() => setConfirmEnd(false)}>
        <View style={styles.overlay}>
          <View style={[styles.dialog, { backgroundColor: colors.panel2, borderColor: colors.stroke }]}>
            <Text style={[styles.dialogTitle, { color: colors.fg }]}>{t('meal.endConfirmTitle')}</Text>
            <Text style={{ color: colors.muted, lineHeight: 24 }}>{t('meal.endConfirmBody')}</Text>
            <View style={styles.dialogActions}>
              <Pressable style={[styles.secondary, { borderColor: colors.stroke, flex: 1 }]} onPress={() => setConfirmEnd(false)}>
                <Text style={{ color: colors.fg, fontWeight: '600' }}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable style={[styles.primary, { backgroundColor: colors.accent, flex: 1 }]} onPress={doEndEarly}>
                <Text style={[styles.primaryText, { color: colors.onAccent }]}>{t('meal.confirmEnd')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 26, height: 26, borderRadius: 7 },
  brand: { fontSize: 17, fontWeight: '700' },
  content: { paddingHorizontal: 22, paddingBottom: 40 },
  subtitle: { fontSize: 13, marginTop: 4 },
  hero: { alignItems: 'center', marginTop: 6 },
  timer: { fontSize: 63, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  status: { fontSize: 13, fontWeight: '600', marginTop: 2, minHeight: 18 },
  pills: { flexDirection: 'row', gap: 8, marginTop: 8 },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  primary: { flex: 1, minHeight: 53, borderRadius: Radius.control, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 16, fontWeight: '700' },
  secondary: { minWidth: 100, minHeight: 53, borderRadius: Radius.control, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(1,7,19,0.66)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', borderRadius: Radius.sheet, borderWidth: 1, padding: 22 },
  dialogTitle: { fontSize: 19, fontWeight: '700', marginBottom: 10 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
});
