import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withSpring,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Colors } from "@/constants/Colors";
import { ITokloUser } from '@/interfaces/user';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheetCompo from '../BottomSheetCompo';
import useUpload from '@/hooks/useUpload';
import { base } from '@/util/axios';
import { Rs } from '@/util/comon';
import { useUserStore } from '@/stores/user';

const { width } = Dimensions.get('window');

const ToklomanUser = ({ user, onPress, onDelete }: { user: ITokloUser, onPress?: () => void, onDelete?: () => void }) => {
  // Si l'utilisateur n'est pas fourni, utilisez des données par défaut
  const defaultUser = {
    fullName: "John Doe",
    phone: "06 12 34 56 78",
    photo: null // URL de la photo
  };

  const {tokloUser} = useUserStore();

  const userData = user || defaultUser;
  
  // Reanimated shared values
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);


    const {pickImage, singleImage} = useUpload(true);
  

  // Set up animations on mount
  useEffect(() => {
    // Animation d'entrée
    scale.value = withSpring(1, { 
      damping: 15, 
      stiffness: 100 
    });
    opacity.value = withTiming(1, { 
      duration: 600, 
      easing: Easing.out(Easing.cubic) 
    });
    translateY.value = withTiming(0, { 
      duration: 500, 
      easing: Easing.out(Easing.quad) 
    });
  }, []);

  // Gestion de l'appui sur la carte
  const handlePress = () => {
    // Animation de pression
    scale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
    
    // Call the onPress handler if provided
    if (onPress) {
      onPress();
    }
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ]
    };
  });

  // Génère des initiales à partir du nom complet pour l'avatar par défaut
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
   <>
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <LinearGradient
          colors={[Colors.app.primary, '#5a55ca']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <View style={styles.photoContainer}>
              {userData.photo || singleImage?.uri ? (
                <Image 
                  source={{ uri: userData.photo? base+'/uploads/'+ userData.photo : singleImage?.uri }} 
                  style={styles.profilePhoto}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.initialsContainer}>
                  <Text style={styles.initialsText}>
                    {getInitials(userData.fullName)}
                  </Text>
                </View>
              )}
              <View style={styles.statusIndicator} />
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.nameText}>{userData.fullName}</Text>
              <View style={styles.phoneContainer}>
                <FontAwesome5 name="phone-alt" size={14} color="#fff" style={styles.phoneIcon} />
                <Text style={styles.phoneText}>{userData.phone}</Text>
              </View>
            </View>
          </View>
          
         {!tokloUser && <View style={styles.actionContainer}>
            <TouchableOpacity onPress={() => onPress?.()} style={styles.actionButton}>
              <FontAwesome5 name="user-edit" size={16} color="#fff" />
              <Text style={styles.actionText}>Modifier</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity onPress={() => onDelete?.()} style={styles.actionButton}>
              <FontAwesome5 name="trash-alt" size={16} color="#fff" />
              <Text style={styles.actionText}>Supprimer</Text>
            </TouchableOpacity>
          </View>}
        </View>
        
        {/* Élément décoratif */}
        <View style={styles.decorativeCircle} />
        <View style={styles.decorativeSmallCircle} />
      </Animated.View>
    </TouchableOpacity>

   </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    borderRadius: 24,
    marginHorizontal: Rs(16),
    marginBottom: Rs(10),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.app.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    padding: 24,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profilePhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  initialsContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  initialsText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CD964',
    bottom: 0,
    right: 0,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIcon: {
    marginRight: 6,
  },
  phoneText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    top: -50,
    right: -50,
  },
  decorativeSmallCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -20,
    left: 20,
  }
});

export default ToklomanUser;