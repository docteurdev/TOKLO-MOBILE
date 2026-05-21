import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { EDressStatus, IOrder } from '@/interfaces/type';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { QueryKeys } from '@/interfaces/queries-key';
import { baseURL } from '@/util/axios';
import axios from 'axios';
import BackButton from '@/components/form/BackButton';
import { Rs, SIZES } from '@/util/comon';
import BottomSheetCompo from '@/components/BottomSheetCompo';
import { Colors } from '@/constants/Colors';
import { alertMgs } from '@/util/appText';
import useChangeOrderStatus from '@/hooks/mutations/useChangeOrderStatus'
import { ActivityIndicator } from 'react-native';
import RoundedBtn from '@/components/form/RoundedBtn';



const { width } = Dimensions.get('window');

const Page = () => {
  const [activeTab, setActiveTab] = useState('details');

  const route = useRouter();
const {id} = useLocalSearchParams <{id: string}> ();



const bottomSheetModalRef = useRef<BottomSheetModal>(null);

const { data, isLoading, error, refetch } = useQuery<IOrder, Error>({
  queryKey: QueryKeys.orders.byId(Number(id)),
  queryFn: async (): Promise<IOrder> => {
    // Explicit return type
 
    const data = {
      Toklo_menId: 1,
      status: "ONGOING",
    };
    try {
      const resp = await axios.get(baseURL+"/orders/"+2);
      // console.log("ààààààààààààààà", resp.data);
      if (resp.data.length > 0) {
        // setOngoingOrderLength(resp.data.length)
      }
      return resp.data; 
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch clients"); 
    }
  },
 });

 const [dressStatus, setDressStatus] = useState<EDressStatus | undefined>(data?.status  )


const {mutate, isPending} = useChangeOrderStatus(closebottomSheet, dressStatus)


 function closebottomSheet(){
   refetch()
   bottomSheetModalRef?.current?.close()
   }
 
   if (isLoading) {
     return <ActivityIndicator size="large" color={Colors.app.primary} />;
   }
 
   if (error) {
     return <Text style={styles.errorText}>Erreur: {error.message}</Text>;
   }


   const handleChangeStatus = () => {
     if (!data) return;
     const newStatus = data.status === EDressStatus.ONGOING ? EDressStatus.FINISHED : EDressStatus.DELIVERED;
     mutate({ id: data.id, status: newStatus });
   };
 

  // Mock data - in real app would come from props or API
  const orderData = {
    orderId: 'ORD-20240302-8754',
    orderDate: 'March 2, 2024',
    status: 'In Progress',
    estimatedDelivery: 'March 15, 2024',
    paymentStatus: 'Paid',
    totalAmount: '$249.99',
    
    customer: {
      name: 'Emma Johnson',
      phone: '+1 (555) 123-4567',
      email: 'emma.johnson@example.com',
      address: '123 Fashion Avenue, New York, NY 10001'
    },
    
    dress: {
      name: 'Evening Gown with Lace Detail',
      style: 'A-Line',
      color: 'Navy Blue',
      fabric: 'Silk Chiffon with Lace Overlay',
      fabricImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVPcfG-5CaP_WHTuPEwfOs15PJGBYAmqtHfQ&s',
      modelImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHhCH6MS2PD78ftq2Bu4SO0-CdQHV-aXy_5Q&s',
      notes: 'Add extra beading around neckline. Client prefers slightly looser fit around waist.',
      
      measurements: {
        bust: '36 inches',
        waist: '28 inches',
        hips: '38 inches',
        shoulder: '15 inches',
        armLength: '24 inches',
        backLength: '16 inches',
        frontLength: '14 inches',
        hemLength: '45 inches'
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <View style={styles.tabContent}>
            <SectionTitle title="Détail de la commande" />
            <InfoRow isHighlighted label="Numéro de commande" value={data?.id} />
            <InfoRow label="Date d'enregistrement" value={data?.date_depote} />
            <InfoRow label="Date livraison" value={data?.date_remise} />
            <InfoRow label="Heure" value={data?.deliveryHour} />
            <InfoRow label="Statut" value={data?.status === EDressStatus.ONGOING ? "En cours" : data?.status === EDressStatus.FINISHED ? "Terminée" : "Livrée"} isHighlighted />
            <InfoRow label="Montant  " value={data?.amount} />
            <InfoRow label="Avance " value={data?.paiement} />
            <InfoRow label="Reste" value={data?.solde_cal} />
            
          </View>
        );

      case 'measurements':
        return (
          <View style={styles.tabContent}>
            <View style={styles.measurementsContainer}>
              <View style={styles.measurementColumn}>
                <MeasurementItem label="Bust" value={orderData.dress.measurements.bust} />
                <MeasurementItem label="Waist" value={orderData.dress.measurements.waist} />
                <MeasurementItem label="Hips" value={orderData.dress.measurements.hips} />
                <MeasurementItem label="Shoulder" value={orderData.dress.measurements.shoulder} />
              </View>
              <View style={styles.measurementColumn}>
                <MeasurementItem label="Arm Length" value={orderData.dress.measurements.armLength} />
                <MeasurementItem label="Back Length" value={orderData.dress.measurements.backLength} />
                <MeasurementItem label="Front Length" value={orderData.dress.measurements.frontLength} />
                <MeasurementItem label="Hem Length" value={orderData.dress.measurements.hemLength} />
              </View>
            </View>
            <View style={styles.measurementDiagram}>
              <Image 
                source={{uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVPcfG-5CaP_WHTuPEwfOs15PJGBYAmqtHfQ&s"}} 
                style={styles.diagramImage}
                resizeMode="contain"
              />
              <Text style={styles.diagramNote}>
                * Measurement diagram is for reference only
              </Text>
            </View>
          </View>
        );

      case 'customer':
        return (
          <View style={styles.tabContent}>
            <View style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <View style={styles.customerInitials}>
                  <Text style={styles.initialsText}>
                    {data?.client_lastname.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.customerHeaderInfo}>
                  <Text style={styles.customerName}>{data?.client_lastname} {data?.client_name}</Text>
                  {/* <Text style={styles.customerSince}>{data?.client_phone} </Text> */}
                </View>
              </View>
              
              <View style={styles.contactDetail}>
                <Ionicons name="call-outline" size={20} color="#333" />
                <Text style={styles.contactText}>{data?.client_phone}</Text>
              </View>
              
              {/* <View style={styles.contactDetail}>
                <Ionicons name="mail-outline" size={20} color="#333" />
                <Text style={styles.contactText}>{orderData.customer.email}</Text>
              </View>
              
              <View style={styles.contactDetail}>
                <Ionicons name="location-outline" size={20} color="#333" />
                <Text style={styles.contactText}>{orderData.customer.address}</Text>
              </View> */}
              
              <View style={styles.customerButtons}>
                <TouchableOpacity style={styles.customerButton}>
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.customerButtonText}>Appel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.customerButton}>
                  <Ionicons name="mail" size={20} color="#fff" />
                  <Text style={styles.customerButtonText}>Email</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* <SectionTitle title="Order History" />
            <View style={styles.orderHistory}>
              <HistoryItem 
                date="Jan 15, 2024" 
                title="Evening Gown" 
                status="Delivered"
                amount="$299.99"
              />
              <HistoryItem 
                date="Oct 5, 2023" 
                title="Cocktail Dress" 
                status="Delivered"
                amount="$175.50"
              />
            </View> */}
          </View>
        );
    }
  };

  // Component for section titles
  const SectionTitle = ({ title }) => (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
  
  // Component for info rows
  const InfoRow = ({ label, value, isHighlighted }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text 
        style={[
          styles.infoValue, 
          isHighlighted && styles.highlightedValue
        ]}
      >
        {value}
      </Text>
    </View>
  );
  
  // Component for measurement items
  const MeasurementItem = ({ label, value }) => (
    <View style={styles.measurementItem}>
      <Text style={styles.measurementLabel}>{label}</Text>
      <Text style={styles.measurementValue}>{value}</Text>
    </View>
  );
  
  // Component for history items
  const HistoryItem = ({ date, title, status, amount }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyDate}>{date}</Text>
        <Text style={styles.historyTitle}>{title}</Text>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyStatus}>{status}</Text>
        <Text style={styles.historyAmount}>{amount}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{position: "absolute", top: Rs(10), left: Rs(10), width: 40, height: 40, justifyContent: "center", alignItems: "center",}} >
        <BackButton backAction={() => route.push('/orders')  } />
      </View>

      {/* <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> {data?.description} </Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View> */}
      
      <ScrollView style={styles.scrollView}>
        {/* Image gallery */}
        <View style={styles.imageGallery}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
          >
            <Image 
              source={{ uri: orderData.dress.modelImage }} 
              style={styles.galleryImage} 
              resizeMode="cover"
            />
            <Image 
              source={{ uri: orderData.dress.fabricImage }} 
              style={styles.galleryImage} 
              resizeMode="cover"
            />
          </ScrollView>
          <View style={styles.imageDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
          </View>
        </View>
        
        {/* Dress title */}
        <View style={styles.dressInfo}>
          <Text style={styles.dressTitle}>{data?.description}</Text>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'details' && styles.activeTab]} 
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
              Détails
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'measurements' && styles.activeTab]} 
            onPress={() => setActiveTab('measurements')}
          >
            <Text style={[styles.tabText, activeTab === 'measurements' && styles.activeTabText]}>
              Mesures
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'customer' && styles.activeTab]} 
            onPress={() => setActiveTab('customer')}
          >
            <Text style={[styles.tabText, activeTab === 'customer' && styles.activeTabText]}>
              Client
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab content */}
        {renderTabContent()}
        
        {/* Action buttons */}
        {data?.status !== "DELIVERED" && <View style={{paddingHorizontal: 20, marginBottom: Rs(50), flexDirection: "row", alignItems: "center", gap: 20}} >
        
        <View style={{flex: 1}} >

          <RoundedBtn
           label={data?.status === EDressStatus.ONGOING ? `Terminer le vêtement` : 'Livrer le vêtement'}
            disabled
            action={() => bottomSheetModalRef.current?.present()}
            />
        </View>
     </View>}
     <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(190)]} >
      <View style={{height: Rs(150), justifyContent: "center", alignItems: "center", gap: Rs(20), paddingHorizontal: Rs(20)}} >
       <Text style={{fontSize: SIZES.sm, color: Colors.app.texteLight}}> 
         {data?.status === EDressStatus.ONGOING ? alertMgs.order.order.statussChanging.finish.fr : alertMgs.order.order.statussChanging.deliver.fr}
        </Text>
       <RoundedBtn label={data?.status === "ONGOING" ? 'Terminer' : 'Livrer'}  disabled loading={isPending} action={() => handleChangeStatus()}  />
      </View>
   </BottomSheetCompo>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#5a189a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  moreButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    height: 300,
    backgroundColor: '#eee',
  },
  galleryImage: {
    width: width,
    height: 300,
  },
  imageDots: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  dressInfo: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  dressTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#5a189a',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#777',
  },
  activeTabText: {
    color: '#5a189a',
  },
  tabContent: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 20,
  },
  sectionTitleContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  highlightedValue: {
    color: '#5a189a',
    fontWeight: '600',
  },
  notesContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    margin: 15,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  measurementsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  measurementColumn: {
    flex: 1,
  },
  measurementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  measurementLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  measurementDiagram: {
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
  },
  diagramImage: {
    width: width * 0.8,
    height: 250,
  },
  diagramNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
  },
  customerCard: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  customerInitials: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5a189a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  initialsText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  customerHeaderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  customerSince: {
    fontSize: 14,
    color: '#888',
  },
  contactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  customerButtons: {
    flexDirection: 'row',
    marginTop: 15,
  },
  customerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5a189a',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  customerButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  orderHistory: {
    margin: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyLeft: {
    flex: 3,
  },
  historyRight: {
    flex: 2,
    alignItems: 'flex-end',
  },
  historyDate: {
    fontSize: 14,
    color: '#888',
  },
  historyTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 2,
  },
  historyStatus: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
  },
  historyAmount: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#5a189a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Page;