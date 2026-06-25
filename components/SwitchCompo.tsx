import { useAppTheme } from '@/hooks/useAppTheme';
import { useCallback } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  label: string;
}

export const SwitchCompo = ({
  value,
  onValueChange,
  activeColor,
  inactiveColor,
  thumbColor,
  disabled = false,
  style = {},
  label,
}: SwitchProps) => {
  const theme = useAppTheme();
  const resolvedActiveColor = activeColor ?? theme.success;
  const resolvedInactiveColor = inactiveColor ?? theme.border;
  const resolvedThumbColor = thumbColor ?? theme.card;

  const progress = useDerivedValue(() => {
    return withSpring(value ? 1 : 0, {
      mass: 1,
      damping: 15,
      stiffness: 150,
      overshootClamping: false,
      energyThreshold: 0.001,
    });
  }, [value]);

  const backgroundColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [resolvedInactiveColor, resolvedActiveColor]
    );

    return {
      backgroundColor,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(progress.value * 20, {
            mass: 1,
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const handlePress = useCallback(() => {
    if (!disabled) {
      onValueChange(!value);
    }
  }, [value, disabled, onValueChange]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pressable,
        { opacity: (pressed && !disabled) ? 0.8 : 1 },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <Animated.View style={[styles.track, backgroundColorStyle]}>
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: resolvedThumbColor },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 16,
  },
  label: {
    flex: 1,
    fontWeight: '600',
    paddingRight: 12,
  },
  disabled: {
    opacity: 0.4,
  },
  track: {
    width: 51,
    height: 31,
    borderRadius: 31,
    padding: 2,
  },
  thumb: {
    width: 27,
    height: 27,
    borderRadius: 27,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
});
