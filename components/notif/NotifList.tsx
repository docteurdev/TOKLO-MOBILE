import { Colors } from '@/constants/Colors';
import { TNotif } from '@/interfaces/type';
import { colors } from '@/util/comon';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.25;
const NOTIFICATION_HEIGHT = 96;

const parseReminderDate = (dateStr?: string | null) => {
  if (!dateStr) return null;

  const trimmedDate = dateStr.trim();
  const dateOnly = trimmedDate.split(/[T\s]/)[0];
  const slashParts = dateOnly.split('/');
  const dashParts = dateOnly.split('-');

  if (slashParts.length === 3) {
    const [day, month, year] = slashParts.map(Number);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  if (dashParts.length === 3) {
    const [first, second, third] = dashParts.map(Number);
    const isIsoLike = dashParts[0].length === 4;
    const year = isIsoLike ? first : third;
    const month = second;
    const day = isIsoLike ? third : first;
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  const parsedDate = new Date(trimmedDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatDate = (dateStr: string) => {
  const date = parseReminderDate(dateStr);

  if (!date) {
    return dateStr || "";
  }

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};


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
  const itemHeight = useSharedValue(NOTIFICATION_HEIGHT);
  const opacity = useSharedValue(1);
  const startX = useSharedValue(0);

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

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = Math.min(0, startX.value + event.translationX);
    })
    .onEnd(() => {
      const shouldDelete = translateX.value < SWIPE_THRESHOLD;
      
      if (shouldDelete) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        runOnJS(handleDelete)();
      } else {
        translateX.value = withSpring(0);
      }
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
        
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.notification, animatedItemStyle]}>
            <Image
              resizeMode="stretch"
              source={require("@/assets/images/measure/tradition.png")}
              style={styles.traditionPattern}
            />
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
        </GestureDetector>
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
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
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
    position: 'relative',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: NOTIFICATION_HEIGHT,
    paddingLeft: 50,
    paddingRight: 14,
    paddingVertical: 10,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightOrange,
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
    marginBottom: 6,
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
  traditionPattern: {
    position: 'absolute',
    left: -44,
    top: 0,
    bottom: 0,
    width: 100,
    height: '100%',
  },
});

export default NotifItem;
