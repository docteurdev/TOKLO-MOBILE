import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, LocaleConfig, AgendaList } from 'react-native-calendars';
import { QueryKeys } from '@/interfaces/queries-key';
import { IOrder } from '@/interfaces/type';
import { baseURL } from '@/util/axios';
import { useOrderStore } from '@/stores/order';
import BottomSheetCompo from '@/components/BottomSheetCompo';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Rs, SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';
import PaymentDetails from '@/components/calendar/OrderDetail';
import PaymentInterface from '@/components/calendar/CardDetails';
import ScreenWrapper from '@/components/ScreenWrapper';
import LoadingScreen from '@/components/Loading';
import EmptyAppoint from '@/components/svgCompo/EmptyAppoint';
import Notification from '@/components/NofiCompo';
import { Button } from 'react-native';

import LottieView from 'lottie-react-native';
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

const DeliveredList = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const { setDeliveredOrderLength } = useOrderStore();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const animation = useRef<LottieView>(null);
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

  //  Fonction inverse pour convertir YYYY-MM-DD vers JJ/MM/AAAA
const convertToDisplayFormat = (isoDateString: string) => {
  if (!isoDateString) return "";
  const [year, month, day] = isoDateString.split('-');
  return `${day}/${month}/${year}`;
};

  // Transform the data into the required format
  const transformData = (data: IOrder[]) => {
    const result: { [key: string]: any[] } = {};
  
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
    acc[date] = { selected: true, selectedColor: 'red' };
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
            backgroundColor="rgba(0, 0, 0, 0.7)"
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
      {/* Calendar Component */}
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' }
        }}
      />

      {/* AgendaList Component */}
      <View style={styles.agendaContainer}>


       { agendaItems.length > 0 ? <AgendaList
          sections={sections}
          renderItem={({ item }) => (
            <TouchableOpacity
            style={[styles.agendaItem, {backgroundColor: item?.data?.status === "ONGOING" ? Colors.app.available.unav_bg : Colors.app.available.av_bg}]}
              onPress={() => {
                 handleOpenSheet(item?.data)
              }}
             >
              <Text style={styles.agendaItemTime}>{item.time}</Text>
              <Text style={styles.agendaItemName}>{item.name}</Text>
              {/* Display additional details if needed */}
              <Text style={styles.agendaItemDetail}>Client: {item.data.client_name}</Text>
              <Text style={styles.agendaItemDetail}>Téléphone: {item.data.client_phone}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Pas d'évènements pour cette date.</Text>
            </View>
          }
          keyExtractor={(item, index) => index.toString()}
        />: (
          <View style={{flex: 1, justifyContent: "center", alignItems: "center", gap: Rs(20)}} >
              <EmptyAppoint />
          </View>
        )}
      <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(750)]}>
        
        <View style={{padding: 20, gap: 20}} >

         <PaymentDetails
          totalPrice={Number(selectedOrder?.solde_cal)}
          quantity={selectedOrder?.quantite}
          status={selectedOrder?.status}
          date_remise={selectedOrder?.date_remise}
            />
         <PaymentInterface
          clientfullname={selectedOrder?.client_name}
          clientphone={selectedOrder?.client_phone}
          dresstype={selectedOrder?.description}
          tissu={selectedOrder?.tissus}
          fabric={selectedOrder?.photos}
          mesure={selectedOrder?.measure}

          quantity={selectedOrder?.quantite}
          solde={selectedOrder?.solde_cal}
          price={selectedOrder?.amount}
          paid={selectedOrder?.paiement}

          date_remise={selectedOrder?.date_remise}
          date_depot={selectedOrder?.date_depote}
          deliveryHour={selectedOrder?.deliveryHour}
         />
        </View>
      </BottomSheetCompo>
      </View>

          
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
    marginTop: Rs(16),
  },
  agendaItem: {
    padding: Rs(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
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
});