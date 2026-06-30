import BottomSheetCompo from '@/components/BottomSheetCompo';
import PaymentInterface from '@/components/calendar/CardDetails';
import PaymentDetails from '@/components/calendar/OrderDetail';
import LoadingScreen from '@/components/Loading';
import ScreenWrapper from '@/components/ScreenWrapper';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { QueryKeys } from '@/interfaces/queries-key';
import { EDressStatus, IOrder } from '@/interfaces/type';
import { useOrderStore } from '@/stores/order';
import { base, baseURL } from '@/util/axios';
import { formatPhoneNumber, formatXOF, Rs, SIZES } from '@/util/comon';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, InteractionManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AgendaList, Calendar, LocaleConfig } from 'react-native-calendars';
import Animated, { FadeInDown } from 'react-native-reanimated';

import ActiveToklomanCompo from '@/components/ActiveToklomanCompo';
import PaymentResult from '@/components/PaymentResult';
import useToklomantSubscribeStatus from '@/hooks/mutations/useToklomantSubscribeStatus';
import { useUserStore } from '@/stores/user';
import { formatHour } from '@/utils';

// Configure French locale
LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};

LocaleConfig.defaultLocale = 'fr';

type CalendarAgendaItem = {
  name: string;
  time: string;
  data: IOrder;
  originalDate: string;
};

type AgendaOrderItemProps = {
  item: CalendarAgendaItem;
  onPress: (order: IOrder) => void;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
};

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const getOrderStatus = (order: IOrder) => {
  return typeof order.status === 'string' ? order.status : order.status?.status;
};

const normalizeOrderStatus = (status: IOrder['status'] | EDressStatus | string | null | undefined) => {
  if (!status) {
    return EDressStatus.ONGOING;
  }

  if (typeof status === 'string') {
    return status as EDressStatus;
  }

  return status.status;
};

const formatDisplayDate = (dateString: string) => {
  if (!dateString) {
    return '';
  }

  const [day, month, year] = dateString.split('/');
  const monthName = LocaleConfig.locales.fr.monthNames[Number(month) - 1];

  return monthName ? `${Number(day)} ${monthName} ${year}` : dateString;
};

const getOrderTitle = (item: CalendarAgendaItem) => {
  return item.name || 'Commande couture';
};

const getClientName = (order: IOrder) => {
  return `${order.client_name ?? ''} ${order.client_lastname ?? ''}`.trim() || 'Client Toklo';
};

const getOrderAmount = (order: IOrder) => {
  const amount = Number(order.amount);
  const quantity = Number(order.quantite || 1);
  const fallback = Number(order.solde_cal || 0);
  const total = Number.isFinite(amount) && amount > 0 ? amount * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1) : fallback;

  return formatXOF(total);
};

const getStatusLabel = (order: IOrder) => {
  const status = getOrderStatus(order);

  if (status === EDressStatus.DELIVERED) {
    return 'LIVRÉE';
  }

  if (status === EDressStatus.FINISHED) {
    return 'TERMINÉE';
  }

  return 'EN COURS';
};

const getStatusColors = (order: IOrder, theme: AppTheme) => {
  const status = getOrderStatus(order);

  if (status === EDressStatus.DELIVERED) {
    return {
      backgroundColor: `${theme.success}22`,
      textColor: theme.success,
    };
  }

  if (status === EDressStatus.FINISHED) {
    return {
      backgroundColor: `${theme.primary}22`,
      textColor: theme.primary,
    };
  }

  return {
    backgroundColor: `${theme.gold}22`,
    textColor: theme.gold,
  };
};

const getGarmentIcon = (title: string): MaterialIconName => {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('pantalon')) {
    return 'human-male-height';
  }

  if (normalizedTitle.includes('chemise')) {
    return 'tshirt-crew-outline';
  }

  if (normalizedTitle.includes('robe')) {
    return 'hanger';
  }

  if (normalizedTitle.includes('veste')) {
    return 'coat-rack';
  }

  return 'hanger';
};

const createCompactCalendarTheme = (theme: AppTheme) => ({
  backgroundColor: theme.background,
  calendarBackground: theme.background,
  textDayFontSize: Rs(12),
  textMonthFontSize: Rs(14),
  textDayHeaderFontSize: Rs(10),
  textDayFontWeight: '500',
  textMonthFontWeight: '700',
  textSectionTitleColor: theme.muted,
  textSectionTitleDisabledColor: theme.border,
  monthTextColor: theme.text,
  dayTextColor: theme.text,
  textDisabledColor: theme.muted,
  arrowColor: theme.primary,
  disabledArrowColor: theme.border,
  todayTextColor: theme.gold,
  selectedDayBackgroundColor: theme.primary,
  selectedDayTextColor: '#FFFFFF',
  dotColor: theme.gold,
  selectedDotColor: '#FFFFFF',
  indicatorColor: theme.primary,
  weekVerticalMargin: 0,
  'stylesheet.calendar.main': {
    container: {
      backgroundColor: theme.background,
    },
    week: {
      marginVertical: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  },
  'stylesheet.calendar.header': {
    header: {
      backgroundColor: theme.background,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: Rs(10),
      paddingRight: Rs(10),
      marginTop: Rs(6),
    },
    monthText: {
      color: theme.text,
      fontSize: Rs(14),
      fontWeight: '700',
    },
    week: {
      marginTop: Rs(4),
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.background,
    },
    dayHeader: {
      color: theme.muted,
      fontSize: Rs(10),
      fontWeight: '700',
    },
  },
  'stylesheet.day.basic': {
    base: {
      width: Rs(26),
      height: Rs(26),
      alignItems: 'center',
      justifyContent: 'center',
    },
    selected: {
      borderRadius: Rs(13),
    },
    today: {
      borderRadius: Rs(13),
    },
    text: {
      color: theme.text,
      marginTop: 0,
      fontSize: Rs(12),
    },
    selectedText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    todayText: {
      color: theme.gold,
      fontWeight: '700',
    },
    disabledText: {
      color: theme.muted,
      opacity: 0.55,
    },
  },
} as const);

const OrderCard = ({ item, onPress, styles, theme }: AgendaOrderItemProps) => {
  const title = getOrderTitle(item);
  const statusColors = getStatusColors(item.data, theme);

  return (
    <AnimatedTouchableOpacity
      entering={FadeInDown.duration(350)}
      activeOpacity={0.88}
      style={styles.orderCard}
      onPress={() => onPress(item.data)}
    >
      <View style={styles.orderPatternTop}>
        <Image style={{width: 100, height: 100}} source={require("@/assets/images/measure/app-bar.png")} />
      </View>
      <View style={styles.orderPatternBottom}>
        <Image style={{width: 100, height: 100}} source={require("@/assets/images/measure/app-bar.png")} />
      </View>

      <View style={styles.orderMain}>
        <View style={styles.garmentIconBox}>
          {item.data.photos ? (
            <Image
              resizeMode="cover"
              source={{ uri: base+"uploads/"+ item.data.tissus }}
              style={styles.garmentImage}
            />
          ) : (
            <MaterialCommunityIcons
              name={getGarmentIcon(title)}
              size={Rs(36)}
              color={theme.primary}
            />
          )}
        </View>

        <View style={styles.orderContent}>
          <Text style={styles.orderTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.orderInfoRow}>
            <Feather name="user" size={Rs(14)} color={theme.muted} />
            <Text style={styles.orderInfoText} numberOfLines={1}>{getClientName(item.data)}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Feather name="phone" size={Rs(14)} color={theme.muted} />
            <Text style={styles.orderInfoText} numberOfLines={1}>{formatPhoneNumber(item.data.client_phone)}</Text>
          </View>
          <View style={styles.orderMetaRow}>
            <View style={styles.orderMetaItem}>
              <Feather name="calendar" size={Rs(13)} color={theme.muted} />
              <Text style={styles.orderDateText} numberOfLines={1}>{formatDisplayDate(item.originalDate)}</Text>
            </View>
            
          </View>
        </View>
      </View>

      <View style={styles.orderSide}>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.backgroundColor }]}>
          <Text style={[styles.statusBadgeText, { color: statusColors.textColor }]}>
            {getStatusLabel(item.data)}
          </Text>
        </View>

        <View style={styles.sideAmount}>
          <Feather name="credit-card" size={Rs(15)} color={theme.primary} />
          <Text style={styles.sideAmountText} numberOfLines={1}>{getOrderAmount(item.data)}</Text>
        </View>

       <View style={styles.orderMetaItem}>
              <Feather name="clock" size={Rs(13)} color={theme.danger} />
              <Text style={styles.orderTimeText}>{formatHour(item.time)}</Text>
        </View>

      </View>
    </AnimatedTouchableOpacity>
  );
};

const DeliveredList = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const compactCalendarTheme = useMemo(() => createCompactCalendarTheme(theme), [theme]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const { setDeliveredOrderLength } = useOrderStore();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const claimeActiveAccountBottomSheet = useRef<BottomSheetModal>(null);
  const activationResultBottomSheetRef = useRef<BottomSheetModal>(null);
  const [shouldShowActivationSheet, setShouldShowActivationSheet] = useState(false);
 
  const {user} = useUserStore()

  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const requestActivationSheet = useCallback(() => {
    setShouldShowActivationSheet(true);
  }, []);

  const { mutate: checkSubscribeStatus } = useToklomantSubscribeStatus(requestActivationSheet);

  useEffect(() => {
    if (user?.id) {
      checkSubscribeStatus();
    }
  }, [checkSubscribeStatus, user?.id]);

  const { data, isLoading, error } = useQuery<IOrder[], Error>({
    queryKey: QueryKeys.orders.calendar,
    queryFn: async (): Promise<IOrder[]> => {
      const requestData = {
        Toklo_menId: user?.id,
        // status: "DELIVERED",
      };
      try {
        const resp = await axios.post(`${baseURL}/orders/by-toklo-calendar`, requestData);
        if (resp.data.length > 0) {
          setDeliveredOrderLength(resp.data.length);
        }

        // console.log("Delivered Orders: ", resp.data);
        return resp.data;
      } catch (error) {
        console.error(error);
        throw new Error("Erreur lors de la récupération de vos commandes à livré");
      }
    },
  });

  function handleOpenSheet(data: IOrder) {

    setSelectedOrder(data)
    bottomSheetModalRef.current?.present();
  }

  const convertDateFormat = (dateString: string) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Transform the data into the required format
  const transformData = (data: IOrder[]) => {
    const result: { [key: string]: CalendarAgendaItem[] } = {};
  
    data.forEach((item) => {
      // Convertir la date au format ISO pour le calendrier
      const originalDate = item.date_remise;
      const isoDate = convertDateFormat(originalDate);
      
      if (!result[isoDate]) {
        result[isoDate] = [];
      }
      
      result[isoDate].push({
        name: item.description,
        time: item?.deliveryHour,
        data: item,
        originalDate: originalDate // Conserver la date originale si nécessaire
      });
    });
  
    return result;
  };


  const transformedData = data ? transformData(data) : {};
  const agendaItems = transformedData[selectedDate] || [];
  const hasAgendaItems = agendaItems.length > 0;

  const markedDates = Object.keys(transformedData).reduce((acc, date) => {
    acc[date] = { selected: true, selectedColor: theme.primary };
    return acc;
  }, {} as { [key: string]: { selected: boolean; selectedColor: string; disableTouchEvent?: boolean } });

  const sections = hasAgendaItems
    ? [
        {
          title: selectedDate,
          data: agendaItems,
        },
      ]
    : [];

  useEffect(() => {
    if (!shouldShowActivationSheet || isLoading) {
      return;
    }

    const interactionTask = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        claimeActiveAccountBottomSheet.current?.present();
        setShouldShowActivationSheet(false);
      });
    });

    return () => interactionTask.cancel();
  }, [isLoading, shouldShowActivationSheet]);

  const activationBottomSheets = (
    <>
      <BottomSheetCompo enablePanDownToClose={false} closeOnBackdropPress={false} bottomSheetModalRef={claimeActiveAccountBottomSheet} snapPoints={['40%']} >
        <ActiveToklomanCompo
          closeBottomSheet={() => claimeActiveAccountBottomSheet?.current?.dismiss()}
          onActivationSuccess={() => {
            claimeActiveAccountBottomSheet?.current?.dismiss();
            activationResultBottomSheetRef.current?.present();
          }}
        />
      </BottomSheetCompo>

      <BottomSheetCompo
        bottomSheetModalRef={activationResultBottomSheetRef}
        snapPoints={['100%']}
      >
        <PaymentResult
          title="Activation"
          subtitle="réussie"
          cardTile="Détail de l'activation"
          amount={0}
          paidAt={new Date().toISOString()}
          paymentMethod="Activation gratuite"
          planName="Mois gratuit Toklo"
          transactionId="Activation gratuite"
          onPrimaryPress={() => {
            activationResultBottomSheetRef.current?.dismiss();
          }}
          onSecondaryPress={() => {
            activationResultBottomSheetRef.current?.dismiss();
          }}
        />
      </BottomSheetCompo>
    </>
  );

  const screenContent = (() => {
    if (isLoading) {
      return (
        <LoadingScreen
          visible={isLoading}
          indicatorColor={theme.gold}
          indicatorSize={48}
          message=""
          animationType="slide"
        />
      );
    }

    if (error) {
      return <Text style={styles.errorText}>Error: {error.message}</Text>;
    }

    return (
      <View style={styles.agendaContainer}>
        <AgendaList
          sections={sections}
          ListHeaderComponent={
            <Calendar
              key={`calendar-${theme.background}`}
              style={styles.calendar}
              theme={compactCalendarTheme}
              hideExtraDays
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
              }}
              markedDates={{
                ...markedDates,
                [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: theme.primary }
              }}
            />
          }
          renderItem={({ item }) => (
            <OrderCard item={item} onPress={handleOpenSheet} styles={styles} theme={theme} />
          )}

          ListEmptyComponent={
            <Animated.View
            entering={FadeInDown.duration(350)}
            style={styles.emptyContainer}>
              <Image
                resizeMode='cover'
                source={require('@/assets/images/empty-order.png')}
                style={styles.emptyOrderImage}
              />
              <Text style={styles.emptyText}>Pas d&apos;évènements pour cette date.</Text>
            </Animated.View>
          }
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.agendaListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  })();

  return (
    <ScreenWrapper>
      {screenContent}

      <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(750)]}>
        
        <View style={styles.sheetContent}>

         <PaymentDetails
          totalPrice={Number(selectedOrder?.solde_cal)}
          status={normalizeOrderStatus(selectedOrder?.status)}
          date_remise={selectedOrder?.date_remise ?? ''}
          date_depot={selectedOrder?.date_depote ?? ''}
          solde_cal={selectedOrder?.solde_cal ?? '0'}
          paiement={selectedOrder?.paiement ?? '0'}
            />
         <PaymentInterface
          clientfullname={`${selectedOrder?.client_name ?? ''} ${selectedOrder?.client_lastname ?? ''}`.trim()}
          clientphone={selectedOrder?.client_phone ?? ''}
          dresstype={selectedOrder?.description ?? ''}
          tissu={selectedOrder?.tissus ?? ''}
          fabric={selectedOrder?.photos ?? ''}
          mesure={selectedOrder?.measure ?? {}}

          quantity={selectedOrder?.quantite ?? ''}
          solde={selectedOrder?.solde_cal ?? '0'}
          price={selectedOrder?.amount ?? '0'}
          paid={selectedOrder?.paiement ?? '0'}

          date_remise={selectedOrder?.date_remise ?? ''}
          date_depot={selectedOrder?.date_depote ?? ''}
          deliveryHour={selectedOrder?.deliveryHour ?? ''}
         />
        </View>
      </BottomSheetCompo>

       {/* Activation account */}
      {activationBottomSheets}

 
    </ScreenWrapper>
  );
};

export default DeliveredList;

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  agendaContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  agendaListContent: {
    flexGrow: 1,
    paddingBottom: Rs(24),
    backgroundColor: theme.background,
  },
  calendar: {
    backgroundColor: theme.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
    paddingBottom: Rs(4),
  },
  orderCard: {
    width: '100%',
    height: Rs(120),
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Rs(1),
    marginBottom: Rs(12),
    padding: Rs(14),
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: theme.background === '#FFFDF8'
      ? '0px 5px 16px rgba(33, 26, 19, 0.05)'
      : '0px 5px 18px rgba(0, 0, 0, 0.28)',
  },
  orderMain: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: Rs(10),
    zIndex: 1,
  },
  garmentIconBox: {
    width: Rs(50),
    height: Rs(50),
    borderRadius: Rs(18),
    backgroundColor: theme.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Rs(12),
    overflow: 'hidden',
  },
  garmentImage: {
    width: '100%',
    height: '100%',
  },
  orderContent: {
    flex: 1,
    paddingTop: Rs(2),
  },
  orderTitle: {
    color: theme.text,
    fontSize: SIZES.md,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: Rs(11),
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(7),
    marginBottom: Rs(6),
  },
  orderInfoText: {
    flex: 1,
    color: theme.muted,
    fontSize: SIZES.xs,
    fontWeight: '500',
  },
  orderMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Rs(8),
    marginTop: Rs(8),
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(5),
  },
  orderDateText: {
    color: theme.gold,
    fontSize: Rs(12),
    fontWeight: '600',
  },
  orderTimeText: {
    color: theme.danger,
    fontSize: Rs(12),
    fontWeight: '700',
  },
  orderSide: {
    width: Rs(116),
    borderLeftWidth: 1,
    borderLeftColor: theme.border,
    paddingLeft: Rs(12),
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
    marginLeft: 15
  },
  statusBadge: {
    borderRadius: Rs(999),
    paddingHorizontal: Rs(12),
    paddingVertical: Rs(6),
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: Rs(9),
    fontWeight: '800',
    letterSpacing: 0,
  },
  sideMetric: {
    alignItems: 'flex-start',
  },
  sideMetricValue: {
    color: theme.text,
    fontSize: Rs(22),
    fontWeight: '800',
    marginTop: Rs(2),
  },
  sideMetricLabel: {
    color: theme.muted,
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  sideAmount: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(5),
  },
  sideAmountText: {
    flex: 1,
    color: theme.text,
    fontSize: 10,
    fontWeight: '800',
  },
  detailsLink: {
    color: theme.primary,
    fontSize: Rs(11),
    fontWeight: '700',
  },
  orderPatternTop: {
    position: 'absolute',
    right: Rs(-8),
    top: Rs(-44),
    width: Rs(40),
    height: Rs(42),
    transform: [{ rotate: '45deg' }],
    opacity: theme.background === '#FFFDF8' ? 1 : 0.35,
  },
  orderPatternBottom: {
    position: 'absolute',
    left: Rs(-12),
    bottom: Rs(25),
    width: Rs(40),
    height: Rs(42),
    transform: [{ rotate: '45deg' }],
    opacity: theme.background === '#FFFDF8' ? 1 : 0.35,
  },
  orderPatternDiamond: {
    position: 'absolute',
    top: Rs(6),
    right: Rs(8),
    width: Rs(12),
    height: Rs(12),
    borderWidth: 1,
    borderColor: theme.primary,
    transform: [{ rotate: '45deg' }],
  },
  orderPatternDiamondSmall: {
    top: Rs(22),
    right: Rs(22),
    width: Rs(8),
    height: Rs(8),
  },
  orderPatternLine: {
    position: 'absolute',
    right: Rs(4),
    bottom: Rs(5),
    width: Rs(30),
    height: 1,
    backgroundColor: theme.primary,
  },
  emptyContainer: {
    flex: 1,
    minHeight: Rs(320),
    justifyContent: 'center',
    alignItems: 'center',
    padding: Rs(16),
  },
  emptyOrderImage: {
    width: Rs(200),
    height: Rs(200),
    marginBottom: Rs(12),
  },
  emptyText: {
    fontSize: Rs(14),
    color: theme.muted,
  },
  errorText: {
    color: theme.danger,
    textAlign: 'center',
    marginTop: Rs(20),
  },
  sheetContent: {
    backgroundColor: theme.card,
    gap: Rs(20),
    padding: Rs(20),
  },
});