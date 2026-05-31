import BottomSheetCompo from '@/components/BottomSheetCompo';
import PaymentInterface from '@/components/calendar/CardDetails';
import PaymentDetails from '@/components/calendar/OrderDetail';
import LoadingScreen from '@/components/Loading';
import ScreenWrapper from '@/components/ScreenWrapper';
import EmptyAppoint from '@/components/svgCompo/EmptyAppoint';
import { Colors } from '@/constants/Colors';
import { QueryKeys } from '@/interfaces/queries-key';
import { EDressStatus, IOrder } from '@/interfaces/type';
import { useOrderStore } from '@/stores/order';
import { baseURL } from '@/util/axios';
import { colors, Rs, SIZES } from '@/util/comon';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AgendaList, Calendar, LocaleConfig } from 'react-native-calendars';
import { ClockIcon, PhoneIcon, SparklesIcon, UserIcon } from 'react-native-heroicons/solid';

import { useUserStore } from '@/stores/user';

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
};

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

const AgendaOrderItem = ({ item, onPress }: AgendaOrderItemProps) => {
  const backgroundColor =
    getOrderStatus(item.data) === "ONGOING"
      ? colors.lightOrange
      : Colors.app.available.av_bg;

  return (
    <TouchableOpacity
      style={[styles.agendaItem, { backgroundColor }]}
      onPress={() => onPress(item.data)}
    >
      <Image
        resizeMode="cover"
        style={styles.traditionStyle}
        source={require("@/assets/images/measure/tradition.png")}
      />
      <View style={styles.agendaItemContent}>
        <View style={styles.agendaItemRow}>
          <ClockIcon fill={Colors.app.primary} size={Rs(18)} />
          <Text style={styles.agendaItemTime}>{item.time}</Text>
        </View>
        <View style={styles.agendaItemRow}>
          <SparklesIcon fill={Colors.app.primary} size={Rs(18)} />
          <Text style={styles.agendaItemName}>{item.name}</Text>
        </View>
        <View style={styles.agendaItemRow}>
          <UserIcon fill={Colors.app.primary} size={Rs(18)} />
          <Text style={styles.agendaItemDetail}>Client: {item.data.client_name}</Text>
        </View>
        <View style={styles.agendaItemRow}>
          <PhoneIcon fill={Colors.app.primary} size={Rs(18)} />
          <Text style={styles.agendaItemDetail}>Téléphone: {item.data.client_phone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DeliveredList = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const { setDeliveredOrderLength } = useOrderStore();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const {user} = useUserStore()

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

  const markedDates = Object.keys(transformedData).reduce((acc, date) => {
    acc[date] = { selected: true, selectedColor: Colors.app.primary,  };
    return acc;
  }, {} as { [key: string]: { selected: boolean; selectedColor: string } });

  const sections = [
    {
      title: selectedDate,
      data: agendaItems,
    },
  ];

  if (isLoading) {
    return  <LoadingScreen 
            visible={isLoading}
            // backgroundColor="rgba(0, 0, 0, 0.7)"
            indicatorColor="#FFFFFF"
            indicatorSize={48}
            message=""
            animationType="slide"
          />
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error.message}</Text>;
  }
  

  return (

    <ScreenWrapper>
      <View style={styles.agendaContainer}>
        <AgendaList
          sections={sections}
          ListHeaderComponent={
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
              }}
              markedDates={{
                ...markedDates,
                [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: "black" }
              }}
            />
          }
          renderItem={({ item }) => (
            <AgendaOrderItem item={item} onPress={handleOpenSheet} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyAppoint />
              <Text style={styles.emptyText}>Pas d&apos;évènements pour cette date.</Text>
            </View>
          }
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.agendaListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(750)]}>
        
        <View style={{padding: 20, gap: 20}} >

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
          
    </ScreenWrapper>
  );
};

export default DeliveredList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  agendaContainer: {
    flex: 1,
  },
  agendaListContent: {
    flexGrow: 1,
    paddingBottom: Rs(24),
  },
  agendaItem: {
    padding: Rs(16),
    paddingLeft: Rs(34),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    position: "relative",
    minHeight: Rs(120),
    overflow: "hidden",
    marginBottom: 10
  },
  agendaItemContent: {
    zIndex: 1,
    gap: Rs(6),
  },
  agendaItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Rs(8),
  },
  agendaItemTime: {
    fontSize: SIZES.sm,
    color: Colors.app.error,
  },
  agendaItemName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    marginTop: Rs(4),
  },
  agendaItemDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: Rs(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Rs(16),
  },
  emptyText: {
    fontSize: Rs(16),
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: Rs(20),
  },
  traditionStyle: {
    height: 180,
    width: Rs(10),
    position: "absolute",
    left: 0,
    top: -10,
  }
});
