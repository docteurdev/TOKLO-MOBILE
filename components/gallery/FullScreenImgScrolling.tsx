import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  Text,
  TouchableOpacity, 
  Modal, 
  StatusBar, 
  Dimensions, 
  FlatList,
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
const THUMBNAIL_WIDTH = screenWidth * 0.28;
const THUMBNAIL_SPACING = 10;

export interface ICatalogue {
  id: number;
  name: string;
  image: string;
  description: string;
  toklo_menid: number;
}

export const FullScreenImageView = ({ 
  images, 
  initialIndex = 0,
  onClose,
  onDelete 
}: { 
  images: ICatalogue[], 
  initialIndex?: number,
  onClose: () => void,
  onDelete?: (id: number) => void 
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  
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

  // Handle image deletion
  const handleDelete = () => {
    if (onDelete && images[activeIndex]) {
      Alert.alert(
        "Voulez-vous supprimer cette image ?", 
        "Cette action est irréversible", 
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          { 
            text: "Supprimer", 
            style: "destructive", 
            onPress: () => {
              onDelete(images[activeIndex].id);
              if (images.length <= 1) {
                onClose();
              } else if (activeIndex === images.length - 1) {
                setActiveIndex(activeIndex - 1);
              }
            }
          },
        ]
      );
    }
  };

  // Horizontal swipe to navigate between images
  const swipeX = useSharedValue(0);
  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow horizontal swiping if not zoomed in
      if (scale.value <= 1) {
        swipeX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (scale.value <= 1) {
        // If swipe is significant, switch images
        if (swipeX.value < -80 && activeIndex < images.length - 1) {
          runOnJS(setActiveIndex)(activeIndex + 1);
        } else if (swipeX.value > 80 && activeIndex > 0) {
          runOnJS(setActiveIndex)(activeIndex - 1);
        }
        
        // Reset swipe value
        swipeX.value = withSpring(0);
      }
    });

  // Combined gestures including swipe
  const allGestures = Gesture.Simultaneous(
    composedGestures,
    swipeGesture
  );

  // Reset animation values when image changes
  useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [activeIndex]);

  // Thumbnail scroll reference
  const thumbnailsRef = useRef(null);
  
  // Auto-scroll thumbnails to keep the active image visible
  useEffect(() => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollToIndex({
        index: activeIndex,
        animated: true,
        viewPosition: 0.5
      });
    }
  }, [activeIndex]);

  // Render thumbnail item
  const renderThumbnail = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.thumbnail,
        activeIndex === index && styles.activeThumbnail
      ]}
      onPress={() => setActiveIndex(index)}
    >
      <Image
        source={{ uri: base + 'uploads/' + item.image }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.modalContainer}>
        <GestureDetector gesture={allGestures}>
          <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
            {images[activeIndex] && (
              <Image
                source={{ uri: base + 'uploads/' + images[activeIndex].image }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </Animated.View>
        </GestureDetector>

        <Animated.View style={[styles.controlsContainer, animatedControlsStyle]}>
          {onDelete && (
            <TouchableOpacity 
              style={[styles.controlButton, { left: 20 }]} 
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <TrashIcon size={24} color="#fff" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.controlButton, { right: 20 }]} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          {/* Image title and description */}
          {images[activeIndex] && (
            <View style={styles.imageInfoContainer}>
              <Text style={styles.imageTitle}>{images[activeIndex].name}</Text>
              {images[activeIndex].description && (
                <Text style={styles.imageDescription}>{images[activeIndex].description}</Text>
              )}
            </View>
          )}
          
          {/* Thumbnails */}
          <View style={styles.thumbnailsContainer}>
            <FlatList
              ref={thumbnailsRef}
              data={images}
              renderItem={renderThumbnail}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsList}
              initialScrollIndex={activeIndex}
              getItemLayout={(data, index) => ({
                length: THUMBNAIL_WIDTH + THUMBNAIL_SPACING,
                offset: (THUMBNAIL_WIDTH + THUMBNAIL_SPACING) * index,
                index,
              })}
              onScrollToIndexFailed={info => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  if (thumbnailsRef.current) {
                    thumbnailsRef.current.scrollToIndex({ 
                      index: info.index, 
                      animated: true 
                    });
                  }
                });
              }}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

// New component that directly shows FullScreenImageView
const FullScreenImgScrolling = ({ 
  items,
  initialIndex = 0,
  visible = true,
  onClose,
  onDelete,
  onSelect
}: { 
  items: ICatalogue[],
  initialIndex?: number,
  visible?: boolean,
  onClose: () => void,
  onDelete?: (id: number) => void,
  onSelect?: (item: ICatalogue) => void
}) => {
  
  // Optional callback when an image is selected or viewed
  const handleImageSelected = (index: number) => {
    if (onSelect && items[index]) {
      onSelect(items[index]);
    }
  };
  
  // Watch for index changes to call onSelect
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  
  useEffect(() => {
    handleImageSelected(activeIndex);
  }, [activeIndex]);

  if (!visible || items.length === 0) {
    return null;
  }

  return (
    <FullScreenImageView 
      images={items} 
      initialIndex={initialIndex}
      onClose={onClose}
      onDelete={onDelete}
    />
  );
};

const styles = StyleSheet.create({
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
    height: screenHeight - 120, // Leave space for thumbnails
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  controlButton: {
    position: 'absolute',
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageInfoContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  imageTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  imageDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    height: 70,
  },
  thumbnailsList: {
    paddingHorizontal: 15,
  },
  thumbnail: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_WIDTH,
    borderRadius: 8,
    marginRight: THUMBNAIL_SPACING,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#fff',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});

export default FullScreenImgScrolling;