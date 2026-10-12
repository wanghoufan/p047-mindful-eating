import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import type { ColorTokens } from '@/theme/tokens';

type Props = {
  tips: readonly string[];
  intervalSeconds: number;
  enabled: boolean;
  paused: boolean;
  colors: ColorTokens;
};

/** 倒计时下方单句无声文字：按间隔自动换句；暂停冻结；关闭则隐藏。无按钮、无声音。 */
export function TipRotator({ tips, intervalSeconds, enabled, paused, colors }: Props) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  // 已等待的毫秒（暂停时保留剩余间隔）
  const waited = useRef(0);

  useEffect(() => {
    if (!enabled || paused || tips.length <= 1) return;
    const step = 250;
    const id = setInterval(() => {
      waited.current += step;
      if (waited.current >= intervalSeconds * 1000) {
        waited.current = 0;
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
          setIndex((i) => (i + 1) % tips.length);
          Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
        });
      }
    }, step);
    return () => clearInterval(id);
  }, [enabled, paused, intervalSeconds, tips.length, opacity]);

  if (!enabled || tips.length === 0) return null;

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <Animated.Text style={[styles.text, { color: colors.accent, opacity }]} numberOfLines={2}>
        {tips[index]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
  text: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22 },
});
