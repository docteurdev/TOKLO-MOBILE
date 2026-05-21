import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring
} from 'react-native-reanimated';
import { useState, useCallback } from 'react';
import { Colors } from '@/constants/Colors';
import { Rs, SIZES } from '@/util/comon';
import { useOrderStore } from '@/stores/order';

const { width } = Dimensions.get('window');

interface Segment {
  label: string;
  value?: number | null;
  key?: string | null;
}

interface SegmentButtonsProps {
  segments: Segment[];
  onSegmentPress?: (segment: Segment) => void;
  handleChangeSegment?: (value: string) => void;
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
  style?: any;
}

export const SegmentButtons = ({ 
  segments = [], 
  onSegmentPress,
  handleChangeSegment,
  activeColor = Colors.app.primary,
  backgroundColor = Colors.app.secondary,
  style = {}
}: SegmentButtonsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [componentWidth, setComponentWidth] = useState(0);

  const { orderLength } = useOrderStore();

  const segmentWidth = segments.length > 0 ? componentWidth / segments.length : 0;

  const animatedSliderStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(activeIndex * segmentWidth, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const handlePress = useCallback((index: number) => {
    setActiveIndex(index);
    onSegmentPress?.(segments[index]);
    handleChangeSegment?.(segments[index]?.key || "");
  }, [segments, onSegmentPress]);

  const renderSegments = () => {
    if (!segments || segments.length === 0) {
      return null; // Return null if segments is empty or invalid
    }

    return segments.map((segment, index) => {
      const isActive = index === activeIndex;

      return (
        <Pressable
          key={segment.label}
          onPress={() => handlePress(index)}
          style={[styles.segmentButton, { width: segmentWidth }]}
        >
          {/* SEGMENT VALUE */}
          {/* Uncomment this if you want to display the value */}
          {/* <Animated.Text 
            style={[
              styles.segmentText,
              {
                color: isActive ? 'white' : activeColor,
                fontWeight: isActive ? '600' : '400',
              },
            ]}
          >
            {segment.value}
          </Animated.Text> */}

          {/* SEGMENT LABEL */}
          {segment.label && (
            <Animated.Text
              style={[
                styles.segmentText,
                {
                  color: isActive ? 'white' : activeColor,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {segment.label}
            </Animated.Text>
          )}
        </Pressable>
      );
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor }, style]}
      onLayout={(e) => setComponentWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.slider,
          {
            width: segmentWidth,
            backgroundColor: Colors.app.primary,
          },
          animatedSliderStyle,
        ]}
      />
      <View style={styles.segmentsContainer}>
        {renderSegments()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Rs(40),
    borderRadius: 8,
    padding: 2,
    position: 'relative',
  },
  segmentsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  segmentButton: {
    flexDirection: 'row',
    gap: Rs(10),
    justifyContent: 'center',
    alignItems: 'center',
    height: Rs(40),
    zIndex: 1,
  },
  segmentText: {
    fontSize: SIZES.xs + 1,
  },
  slider: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    borderRadius: 6,
    boxShadow: Colors.shadow.card,
  },
});