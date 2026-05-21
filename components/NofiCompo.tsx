import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  visible: boolean;
  type?: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  onDismiss?: () => void;
}

const getColorByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return '#4CAF50';
    case 'error':
      return '#F44336';
    case 'warning':
      return '#FF9800';
    case 'info':
    default:
      return '#2196F3';
  }
};

const getIconByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'check-circle';
    case 'error':
      return 'alert-circle';
    case 'warning':
      return 'alert-triangle';
    case 'info':
    default:
      return 'info';
  }
};

export const Notification: React.FC<NotificationProps> = ({
  visible,
  type = 'info',
  message,
  title,
  duration = 3000,
  onDismiss,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  useEffect(() => {
    if (visible) {
      // Animate in
      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
      });
      opacity.value = withTiming(1, { duration: 400 });
      
      // Auto dismiss after duration
      const timeoutId = setTimeout(() => {
        dismissNotification();
      }, duration);
      
      return () => clearTimeout(timeoutId);
    } else {
      dismissNotification();
    }
  }, [visible]);
  
  const dismissNotification = () => {
    translateY.value = withTiming(-100, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    opacity.value = withTiming(0, { 
      duration: 200 
    }, (finished) => {
      if (finished) {
        runOnJS(handleDismiss)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const backgroundColor = getColorByType(type);
  const iconName = getIconByType(type);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.contentContainer, { backgroundColor }]}>
        <View style={styles.iconContainer}>
          <Feather name={iconName} size={24} color="white" />
        </View>
        
        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
        </View>
        
        <TouchableOpacity onPress={dismissNotification} style={styles.closeButton}>
          <Feather name="x" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    maxWidth: 500,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  message: {
    color: 'white',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
});

export default Notification;