import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import { 
  FontAwesome, 
  MaterialIcons, 
  Ionicons, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { clientOrderStat, IClient, IOrder, TInvoice } from '@/interfaces/type';
import { QueryKeys } from '@/interfaces/queries-key';
import { base, baseURL } from '@/util/axios';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatXOF, generateInvoiceNumber, Rs, SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';
import DressStatus from '@/components/dress/DressStatus';
import BackButton from '@/components/form/BackButton';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheetCompo from '@/components/BottomSheetCompo';
import { XMarkIcon } from 'react-native-heroicons/solid';
import PaymentInterface from '@/components/calendar/CardDetails';
import PaymentDetails from '@/components/calendar/OrderDetail';
import RoundedBtn from '@/components/form/RoundedBtn';
import usePrint from '@/hooks/usePrint';
import { useUserStore } from '@/stores/user';
import useLocation from '@/hooks/useLocation';
import useInvoice from '@/hooks/useInvoice';


// Sample data - replace with your actual API call
const SAMPLE_ORDERS = [
  {
    id: '1',
    dress_name: 'Floral Summer Dress',
    price: 129.99,
    date: '2023-03-15',
    status: 'completed',
    image: 'https://via.placeholder.com/100',
    customer: {
      name: 'Emma Wilson',
      address: '123 Main St, New York, NY',
      phone: '+1 (555) 123-4567'
    }
  },
  {
    id: '2',
    dress_name: 'Evening Gown',
    price: 249.99,
    date: '2023-03-18',
    status: 'processing',
    image: 'https://via.placeholder.com/100',
    customer: {
      name: 'Sophia Martinez',
      address: '456 Oak Ave, San Francisco, CA',
      phone: '+1 (555) 987-6543'
    }
  },
  {
    id: '3',
    dress_name: 'Wedding Dress',
    price: 899.99,
    date: '2023-03-20',
    status: 'completed',
    image: 'https://via.placeholder.com/100',
    customer: {
      name: 'Olivia Johnson',
      address: '789 Pine Blvd, Chicago, IL',
      phone: '+1 (555) 789-0123'
    }
  },
  {
    id: '4',
    dress_name: 'Cocktail Dress',
    price: 179.99,
    date: '2023-03-22',
    status: 'pending',
    image: 'https://via.placeholder.com/100',
    customer: {
      name: 'Ava Brown',
      address: '321 Elm St, Los Angeles, CA',
      phone: '+1 (555) 456-7890'
    }
  },
  {
    id: '5',
    dress_name: 'Casual Sundress',
    price: 79.99,
    date: '2023-03-25',
    status: 'completed',
    image: 'https://via.placeholder.com/100',
    customer: {
      name: 'Isabella Davis',
      address: '654 Maple Rd, Miami, FL',
      phone: '+1 (555) 321-0987'
    }
  }
];

const UserOrderList = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalAmount: 0,
    completedOrders: 0
  });

  const [selectOrder, setSelectOrder] = useState<IOrder | undefined>(undefined);

  const {print, selectPrinter} = usePrint()

    const userId = useLocalSearchParams<{id: string}>().id;

   const {user} = useUserStore();

   const {getAddressFromCoordinates} = useLocation()
  
   const router = useRouter();

   const bottomSheetModal = useRef<BottomSheetModal>(null);

   const [invoice, setInvoice] = useState<TInvoice | undefined>(undefined);
   const {handleInvoice} = useInvoice()
   

   useEffect(() => {
    setInvoice( {
      storeName: user?.store_name ?? "",
      sotreSlogan: user?.store_slogan ?? "",
      storeAddress: "123 Avenue de la Mode, 75008 Paris",
      storePhone: user?.phone ?? "",
      clientFullName: selectOrder?.client_name +" " + selectOrder?.client_lastname,
      clientPhone: selectOrder?.client_phone,
      invoiceNumber: generateInvoiceNumber(user?.id || 0, selectOrder?.updatedat || new Date().toLocaleDateString('fr-FR')),
      invoiceDate: new Date().toLocaleDateString('fr-FR'),
      staus: "Payée",
      dressName: selectOrder?.description?? "",
      quantite: selectOrder?.quantite?? "",
      price: Number(selectOrder?.amount),
      totalPrice: Number(selectOrder?.amount) * Number(selectOrder?.quantite),
      paiement: Number(selectOrder?.paiement),
      biTotal: Number(selectOrder?.amount) * Number(selectOrder?.quantite) -  Number(selectOrder?.paiement)
 
    });
  }, [selectOrder]);
   
  
   
    const { data: client, isLoading: clientIsLoading, error: clientError, refetch: refetchClient } = useQuery<IClient, Error>({
      queryKey: QueryKeys.clients.byUser(Number(userId)),
      queryFn: async (): Promise<IClient> => {  // Explicit return type
        try {
          const resp = await axios.get(`${baseURL}/clients/${Number(userId)}`);
          // console.log("ààààààààààààààà", resp.data)
          return resp.data; // Ensure `resp.data` is returned
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
        }
      },
    });
  
    const { data: clientorders, isLoading: ordersIsLoading, error: ordersError, refetch: refetchorders } = useQuery<IOrder[], Error>({
      queryKey: QueryKeys.clients.clientOrdersbyId((Number(userId))),
      queryFn: async (): Promise<IOrder[]> => {  // Explicit return type
        try {
          const resp = await axios.post(`${baseURL}/orders/by-client`, {client_id: Number(userId)});
          return resp.data; // Ensure `resp.data` is returned
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch client's orders"); // Rethrow to handle error properly
        }
      },
    });
  
    const { data: clientordersStat, isLoading: ordersStatIsLoading, error: ordersStatError, refetch: refetchordersStat } = useQuery<clientOrderStat, Error>({
      queryKey: QueryKeys.clients.statByid(Number(userId)),
      queryFn: async (): Promise<clientOrderStat> => {  // Explicit return type
       
        try {
          const resp = await axios.get(`${baseURL}/orders/client-stat/${Number(userId)}`);
          // console.log("oppppppppp", resp.data);
          return resp.data; // Ensure `resp.data` is returned
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch client's orders"); // Rethrow to handle error properly
        }
      },
    });
  

  // Fetch orders - replace with your actual API call
  useEffect(() => {
    // Simulating API fetch
    setOrders(SAMPLE_ORDERS);
    
    // Calculate summary data
    const total = SAMPLE_ORDERS.length;
    const amount = SAMPLE_ORDERS.reduce((sum, order) => sum + order.price, 0);
    const completed = SAMPLE_ORDERS.filter(order => order.status === 'completed').length;
    
    setSummary({
      totalOrders: total,
      totalAmount: amount,
      completedOrders: completed
    });
  }, []);

  const renderOrderItem = ({ item }: { item: IOrder }) => (
    <TouchableOpacity onPress={() => {

      setSelectOrder(item)
      bottomSheetModal?.current?.present()
    } } style={styles.orderItem}>
     
      {item?.tissus ? <Image source={{uri:base+"uploads/"+item?.tissus}} style={styles.dressImage} /> :
       <View style={styles.dressImage}> 
        
        </View>
      }
      
      <View style={styles.orderDetails}>
        <Text style={styles.dressName}>{item.description}</Text>
        <Text style={styles.date}>Date de dépôt: {formatDate(item.date_depote)}</Text>
        <View style={styles.priceStatusContainer}>
          <Text style={styles.price}>{formatXOF(Number(item.amount))}</Text>

           <DressStatus status={item.status} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderInformation = () => (
    <View style={styles.informationContainer}>
      {/* <Text style={styles.infoTitle}>Information du client</Text> */}
      
      <View style={styles.infoSection}>
        <MaterialIcons name="person" size={24} color="#333" />
        <View style={styles.infoDetails}>
          <Text style={styles.infoLabel}> Nom complet  </Text>
          <Text style={styles.infoValue}> {client?.lastname} {client?.name}</Text>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <MaterialIcons name="email" size={24} color="#333" />
        <View style={styles.infoDetails}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>jane.smith@example.com</Text>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <MaterialIcons name="phone" size={24} color="#333" />
        <View style={styles.infoDetails}>
          <Text style={styles.infoLabel}>Téléphone</Text>
          <Text style={styles.infoValue}> {client?.telephone} </Text>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <MaterialIcons name="location-on" size={24} color="#333" />
        <View style={styles.infoDetails}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}> {client?.adresse} </Text>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <MaterialCommunityIcons name="account-check" size={24} color="#333" />
        <View style={styles.infoDetails}>
          <Text style={styles.infoLabel}> Membre depuis </Text>
          {/* <Text style={styles.infoValue}> {client?.} </Text> */}
          
        </View>
      </View>
    </View>
  );

  // Helper functions
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'processing':
        return Colors.app.primary;
      case 'pending':
        return '#FFC107';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>

        <BackButton backAction={() => {

        //  Platform.OS === 'android' ? print(invoice) : selectPrinter(invoice)

           router.replace({pathname: "/(app)/users"}) 
        }
            } />

        <Text style={styles.headerTitle}> {client?.name} {client?.lastname} </Text>
      </View>
      
      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="shirt" size={22} color="#2196F3" />
            </View>
            <View>
              {clientordersStat ? <Text style={styles.summaryValue}>{clientordersStat?.totalOrders}</Text> : <ActivityIndicator size="small" color={Colors.app.primary} />}
              <Text style={styles.summaryLabel}>Vêtement</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <FontAwesome name="dollar" size={22} color="#4CAF50" />
            </View>
            <View>
             {clientordersStat ? <Text style={styles.summaryValue}>{formatXOF(Number(clientordersStat?.totalAmount))}</Text> : <ActivityIndicator size="small" color={Colors.app.primary} />}
              <Text style={styles.summaryLabel}>Montant</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
              <MaterialIcons name="done-all" size={22} color="#FF9800" />
            </View>
            <View>
              {clientordersStat ? <Text style={styles.summaryValue}>{clientordersStat?.ordersCompleted}</Text> : <ActivityIndicator size="small" color={Colors.app.primary} />}
              <Text style={styles.summaryLabel}>Livrés</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'info' && styles.activeTab]} 
          onPress={() => setActiveTab('info')}
        >
          <MaterialIcons 
            name="info-outline"
            size={20}
            color={activeTab === 'info' ? Colors.app.primary : '#757575'}
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'info' && styles.activeTabText
          ]}>Information</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]} 
          onPress={() => setActiveTab('orders')}
        >
          <MaterialIcons 
            name="shopping-bag"
            size={20}
            color={activeTab === 'orders' ? Colors.app.primary : '#757575'}
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'orders' && styles.activeTabText
          ]}>Commandes</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'info' ? (
          renderInformation()
        ) : (
          <FlatList
            data={clientorders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <BottomSheetCompo bottomSheetModalRef={bottomSheetModal} snapPoints={['90%']} >
        <View style={styles.header}>
          <BackButton backAction={() => bottomSheetModal?.current?.close() } icon={<XMarkIcon fill={Colors.app.texteLight} size={Rs(20)} />} />
        </View>

         <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: Rs(50), }}>
        
            <View style={{padding: 20, gap: 20, }} >
        
                
                {selectOrder &&
                 <PaymentDetails
                  totalPrice={Number(selectOrder?.solde_cal)}
                  quantity={selectOrder?.quantite}
                  status={selectOrder?.status}
                  date_remise={selectOrder?.date_remise}
                    />}
        
               { selectOrder &&
                <PaymentInterface
                  clientfullname={selectOrder?.client_name}
                  clientphone={selectOrder?.client_phone}
                  dresstype={selectOrder?.description}
                  tissu={selectOrder?.tissus}
                  fabric={selectOrder?.photos}
                  mesure={selectOrder?.measure}
        
                  quantity={selectOrder?.quantite}
                  solde={selectOrder?.solde_cal}
                  price={selectOrder?.amount}
                  paid={selectOrder?.paiement}
        
                  date_remise={selectOrder?.date_remise}
                  date_depot={selectOrder?.date_depote}
                  deliveryHour={selectOrder?.deliveryHour}
                 />}
                </View>
              {selectOrder?.status === "DELIVERED" && <View style={{paddingHorizontal: 20, marginBottom: Rs(50), flexDirection: "row", alignItems: "center", gap: 20}} >
               
                <View style={{flex: 1}} >
       
                  <RoundedBtn
                   label={"Générer la facture"}
                    disabled
                    action={() => handleInvoice(invoice)}
                    />
                </View>
             </View>}            
        
            </ScrollView>
      </BottomSheetCompo>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    flexDirection: "row",
    alignItems: "center",
    gap: Rs(10)
  },
  headerTitle: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: Colors.app.texte,
  },
  summaryContainer: {
    padding: 15,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    alignItems: 'center',
    // flexDirection: 'row',
    justifyContent: "center",
    gap: 10
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 12,
  },
  summaryValue: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: Colors.app.texte,
    textAlign: "center"
  },
  summaryLabel: {
    fontSize: SIZES.xs,
    color: '#757575',
    marginTop: 3,
    textAlign: "center"
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 15,
    boxShadow: Colors.shadow.card,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.app.primary,
  },
  tabText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: '#757575',
    marginLeft: 6,
  },
  activeTabText: {
    color: Colors.app.primary,
  },
  content: {
    flex: 1,
    marginTop: 15,
  },
  ordersList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dressImage: {
    width: Rs(80),
    height: Rs(80),
    borderRadius: 8,
    
  },
  orderDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  dressName: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: Colors.app.texte,
  },
  date: {
    fontSize: SIZES.xs,
    color: '#757575',
    marginTop: 4,
  },
  priceStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: Colors.app.texte,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  informationContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: Colors.app.texte,
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoDetails: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#757575',
  },
  infoValue: {
    fontSize: SIZES.xs,
    color: Colors.app.texte,
    marginTop: 2,
  },
});

export default UserOrderList;