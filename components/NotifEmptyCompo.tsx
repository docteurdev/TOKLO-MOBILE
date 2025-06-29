import { Colors } from '@/constants/Colors';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence, 
  withRepeat, 
  Easing 
} from 'react-native-reanimated';

const NotifEmptyCompo = ({ 
  title = "No Notifications",
  message = "You're all caught up! We'll notify you when something new arrives.",
  iconColor = "#9CA3AF",
  primaryColor = Colors.app.primary 
}) => {
  // Reanimated shared values
  const opacity = useSharedValue(0);
  const bellRotation = useSharedValue(0);
  
  React.useEffect(() => {
    // Fade in animation
    opacity.value = withTiming(1, { 
      duration: 800, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
    
    // Bell swing animation - repeating sequence
    bellRotation.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(-0.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withDelay(1500, withTiming(0, { duration: 0 })),
      ),
      -1, // -1 for infinite repeats
      false // don't reverse the animation
    );
  }, []);
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  
  const bellAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${bellRotation.value * 10}deg` }
      ],
    };
  });
  
  // Simple bell icon built with Views
  const renderBellIcon = () => {
    return (
      <View style={{ width: 60, height: 60, alignItems: 'center' }}>
        {/* Bell body */}
        <View style={{
          width: 36,
          height: 40,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          borderWidth: 2,
          borderColor: iconColor,
          position: 'relative',
        }} />
        
        {/* Bell handle */}
        <View style={{
          width: 16,
          height: 8,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: iconColor,
          marginTop: -2,
        }} />
        
        {/* Bell clapper */}
        <View style={{
          width: 2,
          height: 10,
          backgroundColor: iconColor,
          marginTop: 2,
        }} />
      </View>
    );
  };
  
  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={styles.iconContainer}>
        <Animated.View style={bellAnimatedStyle}>
          {renderBellIcon()}
        </Animated.View>
        
        {/* Decorative circles */}
        <View style={[styles.circle, { backgroundColor: primaryColor + '20' }]} />
        <View 
          style={[
            styles.smallCircle, 
            { backgroundColor: primaryColor + '40', left: 20, top: -15 }
          ]} 
        />
        <View 
          style={[
            styles.smallCircle, 
            { backgroundColor: primaryColor + '30', right: 25, top: 10 }
          ]} 
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.line} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 20,
    
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    zIndex: -1,
  },
  smallCircle: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    zIndex: -1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  line: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
  },
});

export default NotifEmptyCompo;