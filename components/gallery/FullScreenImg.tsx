import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  Text,
  TouchableOpacity, 
  Modal, 
  StatusBar, 
  Dimensions, 
  TouchableWithoutFeedback,
  SafeAreaView,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { base } from '@/util/axios';
import { TrashIcon } from 'react-native-heroicons/solid';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FullScreenImageView = ({ imageUri, onClose }:{imageUri: string, onClose: () => void}) => {
  // Shared values for animations
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  // Gesture handling for pinch zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Reset scale if it's too small
      if (scale.value < 0.8) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      }
    });
  
  // Gesture handling for panning
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        // Only allow panning when zoomed in
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      } else {
        // Allow vertical swiping to dismiss when not zoomed in
        translateY.value = savedTranslateY.value + event.translationY;
        
        // Change opacity based on how far the user has swiped
        opacity.value = interpolate(
          Math.abs(translateY.value),
          [0, 200],
          [1, 0],
          Extrapolate.CLAMP
        );
      }
    })
    .onEnd((event) => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      
      // Check if the user has swiped enough to dismiss
      if (Math.abs(translateY.value) > 200 && scale.value <= 1) {
        runOnJS(onClose)();
      } else if (scale.value <= 1) {
        // Reset position if not dismissed
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        opacity.value = withTiming(1);
      }
    });
  
  // Double tap to zoom
  const doubleTapRef = useRef(null);
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (scale.value !== 1) {
        // Reset to normal size if already zoomed
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoom in
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });
  
  // Single tap to show/hide controls
  const [showControls, setShowControls] = useState(true);
  const singleTap = Gesture.Tap()
    .onStart(() => {
      runOnJS(setShowControls)(!showControls);
    })
    .requireExternalGestureToFail(doubleTap);
  
  // Combine gestures
  const composedGestures = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTap, singleTap),
    Gesture.Simultaneous(pinchGesture, panGesture)
  );
  
  // Animated styles for the image
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });
  
  // Animated styles for controls
  const animatedControlsStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(showControls ? 1 : 0),
    };
  });

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.modalContainer}>
        <GestureDetector gesture={composedGestures}>
          <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
            <Image
              source={{ uri: base+'uploads/'+imageUri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>

        <Animated.View style={[styles.controlsContainer, animatedControlsStyle]}>
        <TouchableOpacity 
            style={[styles.closeButton, { left: 20 }]} 
            onPress={() => {
              Alert.alert("Voulez-vous supprimer cette image ?", "Cette action est irréversible", [
                {
                  text: "Annuler",
                  style: "cancel",
                },
                { text: "Supprimer", style: "destructive", onPress: () => onClose() },
              ]);
            }}
            activeOpacity={0.7}
          >
            <TrashIcon  size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

// Updated FullScreenImg component with better integration
const FullScreenImg = ({ item, onImagePress }) => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  const handleImagePress = () => {
    setShowFullScreen(true);
    if (onImagePress) {
      onImagePress(item);
    }
  };

  const handleCloseFullScreen = () => {
    setShowFullScreen(false);
  };

  return (
    <View>
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={handleImagePress}
        style={styles.gridItem}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.gridImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.textContainer}>
          <MaterialCommunityIcons 
            name={item.icon || "palette"} 
            size={24} 
            color="#fff" 
            style={styles.categoryIcon} 
          />
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
      </TouchableOpacity>

      {showFullScreen && (
        <FullScreenImageView 
          imageUri={item.image} 
          onClose={handleCloseFullScreen} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  gridItem: {
    width: (screenWidth - 32) / 2,
    aspectRatio: 1.3,
    margin: 4,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  textContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default FullScreenImg;