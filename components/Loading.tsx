import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * Props for the LoadingScreen component
 */
interface LoadingScreenProps {
  /**
   * Controls whether the loading modal is visible
   * @default true
   */
  visible?: boolean;
  
  /**
   * Background color of the modal container
   * @default "rgba(0, 0, 0, 0.7)"
   */
  backgroundColor?: string;
  
  /**
   * Color of the loading indicator
   * @default "#FFFFFF"
   */
  indicatorColor?: string;
  
  /**
   * Size of the loading indicator
   * @default 48
   */
  indicatorSize?: number;
  
  /**
   * Optional message to display under the spinner
   */
  message?: string;
  
  /**
   * Color of the message text
   * @default "#FFFFFF"
   */
  textColor?: string;
  
  /**
   * Animation type for the modal
   * @default "slide"
   */
  animationType?: "none" | "slide" | "fade";
  
  /**
   * Whether the modal background is transparent
   * @default true
   */
  transparent?: boolean;
}

/**
 * A simple loading overlay component using Modal and Swing animation
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  visible = true,
  backgroundColor,
  message,
  textColor,
}) => {
  const theme = useAppTheme();
  const resolvedBackgroundColor = backgroundColor ?? theme.background;
  const resolvedTextColor = textColor ?? theme.text;
  const pulseProgress = useSharedValue(0);

  useEffect(() => {
    pulseProgress.value = 0;
    pulseProgress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );

    return () => cancelAnimation(pulseProgress);
  }, [pulseProgress]);

  const loaderAnimatedStyle = useAnimatedStyle(() => {
    const pulse = Math.sin(pulseProgress.value * Math.PI);

    return {
      opacity: 0.9 + pulse * 0.1,
      transform: [{ scale: 1 + pulse * 0.06 }],
    };
  });

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: resolvedBackgroundColor }]}>
        {/* <Swing 
          size={indicatorSize} 
          color={Colors.app.primary}
        /> */}
        <Animated.View style={[styles.imageContainer, loaderAnimatedStyle]}>
          <Image
            resizeMode="contain"
            source={require('@/assets/images/buton.png')}
            style={styles.image}
          />
          {/* <Image
            resizeMode="contain"
            source={require('@/assets/images/measure/cauri.png')}
            style={[styles.image, styles.perpendicularImage]}
          /> */}
        </Animated.View>
        
        {message && (
          <Text style={[styles.message, { color: resolvedTextColor }]}>
            {message}
          </Text>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 100,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  image: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
  imageContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  perpendicularImage: {
    transform: [{ rotate: '90deg' }],
  },
});

export default LoadingScreen;
