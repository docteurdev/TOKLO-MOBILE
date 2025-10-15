import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';

const EmptyAppoint = () => {
  // Shared value for vertical movement
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Move up (-15) then down (+15) smoothly and repeat forever
    translateY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1500 }),
        withTiming(15, { duration: 1500 })
      ),
      -1, // infinite repeat
      true // reverse on each cycle
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Animated Image */}
      <Animated.View style={animatedStyle}>
        <Image
          source={require('@/assets/images/empty-appointement.png')}
          resizeMode="center"
          style={{ width: 300, height: 250 }}
        />
      </Animated.View>

      <Text style={{ textAlign: 'center', fontSize: SIZES.md, color: Colors.app.black }}>
        Pas de rendez-vous pour cette date
      </Text>
      <Text style={{ textAlign: 'center', fontSize: 14, color: '#6c757d' }}></Text>
    </View>
  );
};

export default EmptyAppoint;

const styles = StyleSheet.create({});
