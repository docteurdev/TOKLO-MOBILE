import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { TNotif } from '@/interfaces/type';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.25;


interface NotificationItemProps {
  notification: TNotif;
  onDelete: (id: number) => void;
  onPress?: (notification: TNotif) => void;
}

const NotifItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  onPress,
}) => {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(120);
  const opacity = useSharedValue(1);

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la notification',
      'Êtes-vous sûr de vouloir supprimer cette notification ?',
      [
        {
          text: 'Annuler',
          onPress: () => {
            translateX.value = withSpring(0);
          },
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: () => {
            // Animate out and then delete
            opacity.value = withTiming(0, { duration: 200 });
            itemHeight.value = withTiming(0, { duration: 300 }, () => {
              runOnJS(onDelete)(notification.id);
            });
          },
          style: 'destructive',
        },
      ],
    );
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = Math.min(0, context.startX + event.translationX);
    },
    onEnd: (event) => {
      const shouldDelete = translateX.value < SWIPE_THRESHOLD;
      
      if (shouldDelete) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        runOnJS(handleDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedItemStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      height: itemHeight.value,
      opacity: opacity.value,
    };
  });

  const animatedDeleteStyle = useAnimatedStyle(() => {
    const deleteOpacity = interpolate(
      translateX.value,
      [SWIPE_THRESHOLD, 0],
      [1, 0],
    );
    
    const backgroundColor = interpolateColor(
      translateX.value,
      [SWIPE_THRESHOLD, 0],
      ['#ff4444', '#ff6666'],
    );

    return {
      opacity: deleteOpacity,
      backgroundColor,
    };
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // Extract HH:MM from HH:MM:SS
  };

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <View style={styles.itemContainer}>
        <Animated.View style={[styles.deleteBackground, animatedDeleteStyle]}>
          <MaterialIcons name="delete" size={24} color="white" />
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
        
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.notification, animatedItemStyle]}>
            <Pressable
              style={styles.notificationContent}
              onPress={() => onPress?.(notification)}
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            >
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <Feather name="bell" size={20} color={Colors.app.primary} />
                </View>
              </View>
              
              <View style={styles.contentContainer}>
                <View style={styles.header}>
                  <Text style={styles.orderText}>Order #{notification.orderId}</Text>
                  <View style={styles.timeContainer}>
                    <MaterialIcons name="schedule" size={14} color="#6b7280" />
                    <Text style={styles.timeText}>
                      {formatTime(notification.remind_time)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.fullName}>{notification.fullName}</Text>
                
                <View style={styles.footer}>
                  <View style={styles.phoneContainer}>
                    <Feather name="phone" size={14} color="#6b7280" />
                    <Text style={styles.phoneText}>{notification.phone}</Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(notification.remind_date)}</Text>
                </View>
              </View>
              
              <View style={styles.chevron}>
                <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
              </View>
            </Pressable>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    marginHorizontal: 16,
  },
  gestureContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  itemContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  notification: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#edc4788d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.app.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default NotifItem;