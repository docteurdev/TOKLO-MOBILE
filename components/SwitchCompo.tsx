
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { useCallback } from 'react';
import { Colors } from '@/constants/Colors';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  disabled?: boolean;
  style?: any;
  label: string;
}

export const SwitchCompo = ({
  value,
  onValueChange,
  activeColor = Colors.app.available.av_txt ,//'#34C759',
  inactiveColor = '#E9E9EA',
  thumbColor = '#FFFFFF',
  disabled = false,
  style = {},
  label,
}: SwitchProps) => {
  const progress = useDerivedValue(() => {
    return withSpring(value ? 1 : 0, {
      mass: 1,
      damping: 15,
      stiffness: 150,
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
    });
  }, [value]);

  const backgroundColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
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
      <Text>{label}</Text>
      <Animated.View style={[styles.track, backgroundColorStyle]}>
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: thumbColor },
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
