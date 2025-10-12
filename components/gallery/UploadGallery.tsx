import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import useUpload from "@/hooks/useUpload";
import { SIZES } from "@/util/comon";
import BlowingBtn from "../form/BlowingBtn";
import useGalery from "@/hooks/mutations/useGalery";
import { useUserStore } from "@/stores/user";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;
const ANIMATION_DURATION = 300;

const UploadGallery = ({closeBottomSheet}: {closeBottomSheet: () => void}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { singleImage, pickImage, resetsingleImage } = useUpload(true);

  const {mutate, isPending, isSuccess} = useGalery(() => closeBottomSheet());

  const {user} = useUserStore()

  // Reanimated shared values
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(1);
  const imageEnter = useSharedValue(0);

  // Initialize animations
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });

    // Smoother continuous breathing animation
    pulse.value = withRepeat(
      withTiming(1.05, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin), // Sine easing for smoother transition
      }),
      -1, // Infinite repeat
      true // Reverse animation instead of sequencing
    );

    // Trigger image animation when an image is selected
    if (singleImage) {
      imageEnter.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [singleImage]);

  const pickImg = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    pickImage();

    // Reset animation for new image
    if (imageEnter.value === 1) {
      imageEnter.value = 0;
      imageEnter.value = withDelay(
        100,
        withTiming(1, {
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
  };

  // Start upload simulation
  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    progress.value = 0;

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.floor(Math.random() * 15) + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          progress.value = withTiming(100, { duration: 300 });

          // Complete upload
          setTimeout(() => {
            setUploading(false);
          }, 500);

          return 100;
        }

        progress.value = withTiming(newProgress, { duration: 300 });
        return newProgress;
      });
    }, 500);
  };

   function handleUploadGalery(){

    const formatData = new FormData();
     if(singleImage?.uri){

      formatData.append("image", {
        uri: singleImage.uri,
        name: "image.png", // Ensure the name is unique
        type: "image/png", // Ensure the type matches the file
      });
     }
      formatData.append("name", '' ),
      formatData.append("toklo_menid", user?.id?.toString() || '' ),
      formatData.append("description", '' ),
     mutate(formatData);
     if(isSuccess){
      simulateUpload()
     }
  }

  // Handle image removal
  const removeImage = () => {
    
    imageEnter.value = withTiming(0, {
      duration: 300,
      easing: Easing.in(Easing.cubic),
    });
    resetsingleImage()
  };

  // Animated styles
  const uploadContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: pulse.value }],
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  const imageContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: imageEnter.value,
      transform: [
        { scale: imageEnter.value },
        {
          translateY: interpolate(
            imageEnter.value,
            [0, 1],
            [50, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const renderUploadArea = () => (
    <Animated.View style={[styles.uploadContainer, uploadContainerStyle]}>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickImg}
        disabled={uploading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#4776E6", "#8E54E9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <View style={styles.uploadingIconContainer}>
                <Ionicons name="cloud-upload-outline" size={32} color="#fff" />
                <Text style={styles.uploadingPercentage}>
                  {uploadProgress}%
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, progressBarStyle]} />
              </View>
              <Text style={styles.uploadingText}>
                En cours de téléchargement...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="cloud-upload-outline"
                  size={40}
                  color="#ffffff"
                />
              </View>
              <Text style={styles.uploadText}>Télécharger le modèle</Text>
              <Text style={[styles.uploadSubtext, { fontSize: SIZES.xs }]}>
                Appuyez pour sélectionner depuis votre galerie.
              </Text>

              {/* <View style={styles.uploadTipContainer}>
                <BlurView intensity={10} tint="light" style={styles.blurContainer}>
                  <Ionicons name="bulb-outline" size={16} color="#fff" />
                  <Text style={styles.uploadTip}>High-resolution images recommended</Text>
                </BlurView>
              </View> */}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderImage = () => {
    if (!singleImage) return null;

    return (
      <Animated.View style={[styles.imageWrapper, imageContainerStyle]}>
        <Image source={{ uri: singleImage.uri }} style={styles.image} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.imageGradient}
        />

        <TouchableOpacity
          style={styles.removeButton}
          onPress={removeImage}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BlurView intensity={80} tint="dark" style={styles.removeButtonBlur}>
            <Ionicons name="close" size={16} color="#fff" />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.imageInfo}>
          <Text style={styles.imageDate}>
            {new Date().toLocaleDateString()}
          </Text>
          <TouchableOpacity
            style={styles.imageActionButton}
            // onPress={simulateUpload}
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="image-outline" size={70} color="#d1d1d1" />
      <Text style={styles.emptyStateText}>Pas d'image sélectionnée</Text>
      <Text style={styles.emptyStateSubtext}>
        Votre image téléchargée apparaîtra ici.
      </Text>
    </View>
  );

  const renderImageArea = () => (
    <View style={styles.imagesContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.galleryTitle}></Text>
      </View>

      {singleImage ? renderImage() : renderEmptyState()}

    {singleImage &&
      <BlowingBtn
        isPending={isPending}
        label="Uploader une nouvelle image"
        handlePress={() => handleUploadGalery()}
      />}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderUploadArea()}
      {renderImageArea()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  uploadContainer: {
    marginBottom: 24,
    shadowColor: "#4776E6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  uploadButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientBackground: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  uploadSubtext: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
  },
  uploadTipContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    overflow: "hidden",
    borderRadius: 12,
  },
  blurContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  uploadTip: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  uploadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 8,
  },
  uploadingIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  uploadingPercentage: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  uploadingText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginTop: 12,
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  imagesContainer: {
    flex: 1,
  },
  imageWrapper: {
    width: "100%",
    height: width * 0.8,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  removeButtonBlur: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  imageInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  imageDate: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  imageActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
});

export default UploadGallery;
