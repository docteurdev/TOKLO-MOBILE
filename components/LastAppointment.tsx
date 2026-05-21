import { Colors } from '@/constants/Colors';
import { QueryKeys } from '@/interfaces/queries-key';
import { IOrder } from '@/interfaces/type';
import { useUserStore } from '@/stores/user';
import { baseURL } from '@/util/axios';
import { colors, Rs, SIZES } from '@/util/comon';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDaysIcon } from 'react-native-heroicons/solid';
import Animated, { FadeInUp } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type LastAppointmentStatus = IOrder['status'] | string | null | undefined;

type LastAppointmentData = Partial<Omit<IOrder, 'status' | 'measure' | 'updatedat'>> & {
  status?: LastAppointmentStatus;
  measure?: unknown;
  updatedat?: Date | string;
  [key: string]: unknown;
};

type LastAppointmentProps = {
  appointment?: LastAppointmentData;
  onPress?: () => void;
};

const LastAppointment = ({ appointment, onPress }: LastAppointmentProps) => {
  const { user } = useUserStore();
  const userId = user?.id;

  const { data } = useQuery<LastAppointmentData, Error>({
    queryKey: [...QueryKeys.orders.lastOrder, userId],
    enabled: Boolean(userId) && !appointment,
    queryFn: async (): Promise<LastAppointmentData> => {
      try {
        const resp = await axios.get(`${baseURL}/orders/last-appointment/${userId}`);
        return resp.data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch last appointment");
      }
    },
  });

  const order = appointment ?? data;

  if (!order) {
    return null;
  }

  return (
    <AnimatedTouchableOpacity
      entering={FadeInUp.delay(300)}
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Prochain rendez-vous</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <CalendarDaysIcon size={27} color={Colors.app.dashitem.t_1} />
            <Text style={styles.infoText}>{order.date_remise}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={27} color={Colors.app.dashitem.t_1} />
            <Text style={styles.infoText}>{order.deliveryHour}</Text>
          </View>
        </View>
           <Image style={{position: "absolute", bottom: 0, left: -12}} height={100} width={40} source={require("@/assets/images/measure/tradition.png")} />      
           <Image style={{position: "absolute", bottom: 0, right: -16}} height={100} width={40} source={require("@/assets/images/measure/tradition.png")} />      
      </View>
    </AnimatedTouchableOpacity>
  );
};

const normalizeStatus = (status: LastAppointmentStatus) => {
  if (!status) {
    return '';
  }

  if (typeof status === 'string') {
    return status;
  }

  return status.status;
};

const statusColors: Record<string, string> = {
  ONGOING: '#ff9800',
  IN_PROGRESS: '#2196f3',
  FINISHED: '#2196f3',
  COMPLETED: '#4caf50',
  DELIVERED: '#4caf50',
  CANCELLED: '#f44336',
};

const statusLabels: Record<string, string> = {
  ONGOING: 'En attente',
  IN_PROGRESS: 'En cours',
  FINISHED: 'Terminée',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  DELIVERED: 'Livré',
};

const getStatusColor = (status: LastAppointmentStatus) => {
  return statusColors[normalizeStatus(status)] || '#9e9e9e';
};

const getStatusLabel = (status: LastAppointmentStatus) => {
  const normalizedStatus = normalizeStatus(status);

  return statusLabels[normalizedStatus] || normalizedStatus;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: Rs(16),
    zIndex: 100,
    backgroundColor: colors.lightOrange,
  },
  card: {
    position:"relative",
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    width: "100%",
    justifyContent: "center",
    gap: Rs(8),
    // overflow: 'hidden'
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
