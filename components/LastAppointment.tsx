import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Rs, SCREEN_W, SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';
import Animated, { BounceIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { CalendarDaysIcon } from 'react-native-heroicons/solid';
import { useQuery } from '@tanstack/react-query';
import { IOrder } from '@/interfaces/type';
import axios from 'axios';
import { baseURL } from '@/util/axios';
import { QueryKeys } from '@/interfaces/queries-key';
import { useUserStore } from '@/stores/user';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const LastAppointment = ({ appointment, onPress }) => {
  // Format date if it's in YYYY-MM-DD format

  const { user} = useUserStore()

  const { data, isLoading, error, refetch } = useQuery<IOrder, Error>({
    queryKey: QueryKeys.orders.lastOrder,
    queryFn: async (): Promise<IOrder> => {  // Explicit return type
      try {
        const resp = await axios.get(baseURL+"/orders/last-appointment/"+user?.id);
        return resp.data; // Ensure `resp.data` is returned
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
      }
    },
  });
  
  
 

  // If no appointment data
  if (!data) {
    return null
    
  }

  return (
    <AnimatedTouchableOpacity
      entering={FadeInUp.delay(300)}
      style={styles.container} 
      onPress={() => onPress && onPress(appointment)}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Prochain rendez-vous</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(data?.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(data?.status) }]}>{getStatusLabel(data?.status)}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <CalendarDaysIcon size={27} color={Colors.app.dashitem.t_1} />
            <Text style={styles.infoText}>{data?.date_remise}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={27} color={Colors.app.dashitem.t_1} />
            <Text style={styles.infoText}>{data?.deliveryHour}</Text>
          </View>
        </View>
                
      </View>
    </AnimatedTouchableOpacity>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  const statusColors = {
    ONGOING: '#ff9800',   // Orange
    IN_PROGRESS: '#2196f3', // Blue
    COMPLETED: '#4caf50',  // Green
    CANCELLED: '#f44336',  // Red
    // Add more statuses as needed
  };
  
  return statusColors[status] || '#9e9e9e'; // Default gray
};

// Helper function to get status label in French
const getStatusLabel = (status) => {
  const statusLabels = {
    ONGOING: 'En attente',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé',
    // Add more statuses as needed
  };
  
  return statusLabels[status] || status;
};

const styles = StyleSheet.create({
  container: {
    padding: Rs(16),
    // width: SCREEN_W,
      // position: "absolute",
    zIndex: 100,
    backgroundColor: Colors.app.disabled,
    // height: 100,
    // display: "none"
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    boxShadow: Colors.shadow.card,
    width: "100%",
    justifyContent: "center",
    gap: Rs(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: Rs(12),
  },
  title: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: '#212121',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: '#424242',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 6,
    fontSize: SIZES.sm -3,
    color: Colors.app.dashitem.t_1,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  detailsContainer: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
    width: 70,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6200ea',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
  },
});

export default LastAppointment;
