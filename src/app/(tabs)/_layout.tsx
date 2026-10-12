import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/settings/SettingsProvider';

function TabBar({ state, navigation }: any) {
  const { colors } = useSettings();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const items = [
    { key: 'index', label: t('tabs.meal'), icon: 'restaurant' as const },
    { key: 'journal', label: t('tabs.journal'), icon: 'document-text' as const },
  ];

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.panel,
          borderTopColor: colors.stroke,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}>
      {items.map((item) => {
        const active = state.routes[state.index].name === item.key;
        const color = active ? colors.accent : colors.muted;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: state.routes.find((r: any) => r.name === item.key)?.key });
              if (!e.defaultPrevented) navigation.navigate(item.key);
            }}
            style={styles.item}>
            <Ionicons name={active ? item.icon : (`${item.icon}-outline` as any)} size={23} color={color} />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="journal" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 30,
    gap: 18,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 2 },
  label: { fontSize: 11, fontWeight: '600' },
});
