import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { clearApiKey, hasApiKey, setApiKey } from '@/ai';
import type { LanguageMode, ThemeMode } from '@/domain/types';
import { useSettings } from '@/settings/SettingsProvider';
import { Radius } from '@/theme/tokens';

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  colors,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  colors: { panel: string; panel2: string; fg: string; muted: string; stroke: string; accent: string };
}) {
  return (
    <View style={styles.segWrap}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[
              styles.seg,
              {
                backgroundColor: active ? colors.panel2 : colors.panel,
                borderColor: active ? colors.accent : colors.stroke,
              },
            ]}>
            <Text style={{ color: active ? colors.fg : colors.muted, fontSize: 13, fontWeight: '600' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, settings, update } = useSettings();
  const { t } = useTranslation();
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    void hasApiKey().then(setHasKey);
  }, []);

  const saveKey = async () => {
    await setApiKey(key);
    setKey('');
    setHasKey(await hasApiKey());
  };
  const removeKey = async () => {
    await clearApiKey();
    setHasKey(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={colors.fg} />
        </Pressable>
        <Text style={[styles.title, { color: colors.fg }]}>{t('settings.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.group, { color: colors.muted }]}>{t('settings.theme')}</Text>
        <Segmented<ThemeMode>
          colors={colors}
          value={settings.themeMode}
          onChange={(v) => update({ themeMode: v })}
          options={[
            { value: 'light', label: t('settings.themeLight') },
            { value: 'dark', label: t('settings.themeDark') },
            { value: 'system', label: t('settings.themeSystem') },
          ]}
        />

        <Text style={[styles.group, { color: colors.muted }]}>{t('settings.language')}</Text>
        <Segmented<LanguageMode>
          colors={colors}
          value={settings.languageMode}
          onChange={(v) => update({ languageMode: v })}
          options={[
            { value: 'system', label: t('settings.langSystem') },
            { value: 'zh-CN', label: t('settings.langZh') },
            { value: 'en', label: t('settings.langEn') },
          ]}
        />

        <Text style={[styles.group, { color: colors.muted }]}>{t('settings.reminder')}</Text>
        <View style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.stroke }]}>
          <View style={styles.row}>
            <Text style={{ color: colors.fg }}>{t('settings.reminderInterval')}</Text>
          </View>
          <Segmented<30 | 60 | 90 | 120>
            colors={colors}
            value={settings.reminderIntervalSeconds}
            onChange={(v) => update({ reminderIntervalSeconds: v, reminderEnabled: true })}
            options={[
              { value: 30, label: t('settings.interval30') },
              { value: 60, label: t('settings.interval60') },
              { value: 90, label: t('settings.interval90') },
              { value: 120, label: t('settings.interval120') },
            ]}
          />
          <View style={[styles.row, { marginTop: 12 }]}>
            <Text style={{ color: colors.fg }}>{t('settings.off')}</Text>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={(v) => update({ reminderEnabled: v })}
              trackColor={{ true: colors.accent, false: colors.stroke }}
            />
          </View>
          <View style={[styles.row, { marginTop: 12 }]}>
            <Text style={{ color: colors.fg }}>{t('settings.reduceMotion')}</Text>
            <Switch
              value={settings.reduceMotion}
              onValueChange={(v) => update({ reduceMotion: v })}
              trackColor={{ true: colors.accent, false: colors.stroke }}
            />
          </View>
        </View>

        <Text style={[styles.group, { color: colors.muted }]}>{t('settings.ai')}</Text>
        <View style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.stroke }]}>
          <Text style={{ color: colors.fg, fontWeight: '600' }}>{t('settings.aiProvider')}: DeepSeek</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>{t('settings.apiKey')}</Text>
          <TextInput
            value={key}
            onChangeText={setKey}
            placeholder={t('settings.apiKeyPlaceholder')}
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={[styles.input, { color: colors.fg, backgroundColor: colors.panel2, borderColor: colors.stroke }]}
          />
          <View style={styles.rowBtns}>
            <Pressable style={[styles.primary, { backgroundColor: colors.accent }]} onPress={saveKey}>
              <Text style={{ color: colors.onAccent, fontWeight: '700' }}>{t('common.save')}</Text>
            </Pressable>
            {hasKey ? (
              <Pressable style={[styles.secondary, { borderColor: colors.stroke }]} onPress={removeKey}>
                <Text style={{ color: colors.danger, fontWeight: '600' }}>{t('common.clear')}</Text>
              </Pressable>
            ) : null}
          </View>
          {hasKey ? <Text style={{ color: colors.accent, fontSize: 12, marginTop: 10 }}>{t('settings.apiKeySaved')}</Text> : null}
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 10, lineHeight: 18 }}>{t('settings.apiKeyHint')}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6, lineHeight: 18 }}>{t('settings.privacyNote')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  content: { paddingHorizontal: 22, paddingBottom: 40 },
  group: { fontSize: 12, marginTop: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  segWrap: { flexDirection: 'row', gap: 8 },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: Radius.control, borderWidth: 1 },
  card: { borderRadius: Radius.card, borderWidth: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { borderRadius: Radius.control, borderWidth: 1, padding: 12, marginTop: 8 },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primary: { flex: 1, minHeight: 46, borderRadius: Radius.control, alignItems: 'center', justifyContent: 'center' },
  secondary: { minWidth: 90, minHeight: 46, borderRadius: Radius.control, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
