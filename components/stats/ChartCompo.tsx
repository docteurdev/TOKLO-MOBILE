import { Colors } from '@/constants/Colors';
import { Rs, SCREEN_W } from '@/util/comon';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';

// Create an animated wrapper for the BarChart
const AnimatedBarChart = ({ data, onDataLoad }) => {
  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50); // Start 50 units below final position
  const scale = useSharedValue(0.9);

  useEffect(() => {
    // Sequence the animations
    const delay = 300; // Add some delay before chart appears
    
    // Start the animations when component mounts or data changes
    translateY.value = withDelay(
      delay,
      withTiming(0, { 
        duration: 600, 
        easing: Easing.out(Easing.cubic) 
      })
    );
    
    opacity.value = withDelay(
      delay,
      withTiming(1, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      })
    );
    
    scale.value = withDelay(
      delay,
      withTiming(1, { 
        duration: 600, 
        easing: Easing.out(Easing.back()) 
      })
    );

    // Optional: Notify parent when animation starts
    if (onDataLoad) {
      onDataLoad();
    }
  }, [data]); // Re-animate when data changes

  // Create the animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });

  return (
    <Animated.View 
      style={[
        {
          alignItems: "center",
          backgroundColor: "white",
          marginTop: Rs(20)
        }, 
        animatedStyle
      ]}
    >
      <BarChart
        width={SCREEN_W}
        data={data}
        barWidth={Rs(20)}
        isAnimated={true}
        animationDuration={3000}
        initialSpacing={Rs(20)}
        spacing={Rs(20)}
        barBorderRadius={4}
        minHeight={Rs(3)}
        showGradient
        yAxisThickness={0}
        xAxisType={"dashed"}
        xAxisColor={"lightgray"}
        yAxisTextStyle={{ color: Colors.app.primary }}
        stepValue={1000}
        maxValue={6000}
        noOfSections={6}
        yAxisLabelTexts={["0", "1k", "2k", "3k", "4k", "5k", "6k"]}
        labelWidth={40}
        xAxisLabelTextStyle={{
          color: Colors.app.primary,
          textAlign: "center",
        }}
        showLine
        lineConfig={{
          color: "#F29C6E",
          thickness: 3,
          curved: true,
          hideDataPoints: true,
          shiftY: 20,
          initialSpacing: -30,
        }}
      />
    </Animated.View>
  );
};

export default AnimatedBarChart;