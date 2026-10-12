import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { ColorTokens } from '@/theme/tokens';

type Props = {
  colors: ColorTokens;
  paused?: boolean;
  reduceMotion?: boolean;
  size?: number;
};

/** C 方向几何光球：缓慢呼吸。减少动画时静止。 */
export function Orb({ colors, paused = false, reduceMotion = false, size = 150 }: Props) {
  const scale = useSharedValue(0.94);
  const ripple = useSharedValue(0.9);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(scale);
      cancelAnimation(ripple);
      scale.value = 1;
      ripple.value = 1;
      return;
    }
    scale.value = withRepeat(
      withTiming(1.06, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    ripple.value = withRepeat(
      withTiming(1.16, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [reduceMotion, scale, ripple]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: paused ? 0.97 : scale.value }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: paused ? 1 : ripple.value }],
    opacity: paused ? 0.35 : 0.8,
  }));

  const ring: ViewStyle = {
    width: size * 1.28,
    height: size * 1.28,
    borderRadius: (size * 1.28) / 2,
    borderWidth: 1,
    borderColor: colors.stroke,
  };

  return (
    <View style={[styles.stage, { width: size * 1.5, height: size * 1.5 }]}>
      <Animated.View style={[styles.abs, ring, rippleStyle]} />
      <Animated.View
        style={[
          styles.abs,
          {
            width: size * 1.12,
            height: size * 1.12,
            borderRadius: (size * 1.12) / 2,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: colors.accent2,
          },
          rippleStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.abs,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
            shadowOpacity: 0.55,
            shadowRadius: 34,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          },
          orbStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  abs: { position: 'absolute' },
});
