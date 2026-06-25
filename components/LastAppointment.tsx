import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { QueryKeys } from '@/interfaces/queries-key';
import { IOrder } from '@/interfaces/type';
import { useUserStore } from '@/stores/user';
import { baseURL } from '@/util/axios';
import { Rs, SIZES } from '@/util/comon';
import { formatHour } from '@/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CalendarDaysIcon } from 'react-native-heroicons/solid';
import Animated, { FadeInUp } from 'react-native-reanimated';

type LastAppointmentStatus = IOrder['status'] | string | null | undefined;

type LastAppointmentData = {
  date_remise?: string | null;
  deliveryHour?: string | null;
  status?: LastAppointmentStatus;
};

const LastAppointment = () => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { user } = useUserStore();
  const userId = user?.id;

  const { data } = useQuery<LastAppointmentData, Error>({
    queryKey: [...QueryKeys.orders.lastOrder, userId],
    enabled: Boolean(userId),
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

  const order = data;

  if (!order) {
    return null;
  }

  const statusColor = getStatusColor(order.status, theme);

  return (
    <Animated.View
      entering={FadeInUp.delay(300)}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Prochain rendez-vous</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <CalendarDaysIcon size={27} color={theme.gold} />
            <Text style={styles.infoText}>{order.date_remise ?? ""}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={27} color={theme.gold} />
            <Text style={styles.infoText}>{formatHour(order.deliveryHour) ?? ""}</Text>
          </View>
        </View>
           <Image style={styles.leftPattern} height={100} width={40} source={require("@/assets/images/measure/tradition.png")} />      
           <Image style={styles.rightPattern} height={100} width={40} source={require("@/assets/images/measure/tradition.png")} />      
      </View>
    </Animated.View>
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

const getStatusColor = (status: LastAppointmentStatus, theme: AppTheme) => {
  return statusColors[normalizeStatus(status)] || theme.muted;
};

const getStatusLabel = (status: LastAppointmentStatus) => {
  const normalizedStatus = normalizeStatus(status);

  return statusLabels[normalizedStatus] || normalizedStatus;
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    position: 'relative',
    padding: Rs(16),
    zIndex: 100,
    backgroundColor: theme.background,
  },
  card: {
    position:"relative",
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    boxShadow: theme.background === '#FFFDF8'
      ? '0px 2px 8px rgba(0, 0, 0, 0.08)'
      : '0px 5px 18px rgba(0, 0, 0, 0.28)',
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
    color: theme.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
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
    color: theme.text,
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
    color: theme.gold,
    fontWeight: '500',
  },
  leftPattern: {
    bottom: 0,
    left: -12,
    opacity: theme.background === '#FFFDF8' ? 1 : 0.35,
    position: 'absolute',
  },
  rightPattern: {
    bottom: 0,
    opacity: theme.background === '#FFFDF8' ? 1 : 0.35,
    position: 'absolute',
    right: -16,
  },
});

export default LastAppointment;
