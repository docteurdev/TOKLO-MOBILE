import { Colors } from '@/constants/Colors';
import { SIZES } from '@/util/comon';
import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

const FlatButton = ({
  title = 'Button',
  onPress,
  primaryColor = Colors.app.primary,
  secondaryColor = '#a29bfe',
  textColor = 'white',
  icon,
  width = 200,
  disabled = false,
}) => {
  // Animation shared values
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  // Handle press animations
  const onPressIn = () => {
    pressed.value = withTiming(1, { duration: 150 });
    scale.value = withTiming(0.98, { duration: 150 });
  };

  const onPressOut = () => {
    pressed.value = withTiming(0, { duration: 200 });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressed.value,
      [0, 1],
      [primaryColor, secondaryColor]
    );
    
    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(1 - pressed.value * 0.05, { duration: 150 }) }],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1 - pressed.value * 0.5, { duration: 150 }),
    };
  });

  return (
    <View style={styles.buttonContainer}>
      <Animated.View style={[styles.shadow, shadowStyle]} />
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.button,
            animatedButtonStyle,
            { width },
            disabled && styles.disabled,
          ]}
        >
          {icon && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}
          <Animated.Text
            style={[
              styles.text,
              { color: textColor },
              animatedTextStyle,
            ]}
          >
            {title}
          </Animated.Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  shadow: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    bottom: -2,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: '90%',
    height: '90%',
    zIndex: -1,
  },
  iconContainer: {
    marginRight: 10,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default FlatButton;

