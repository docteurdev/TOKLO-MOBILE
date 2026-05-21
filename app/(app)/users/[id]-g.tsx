import BottomSheetCompo from '@/components/BottomSheetCompo';
import PaymentInterface from '@/components/calendar/CardDetails';
import BackButton from '@/components/form/BackButton';
import RoundedBtn from '@/components/form/RoundedBtn';
import LoadingScreen from '@/components/Loading';
import DetailListItem from '@/components/user/DetailListItem';
import UserOrderItem from '@/components/user/UserOrderItem';
import { Colors } from '@/constants/Colors';
import { QueryKeys } from '@/interfaces/queries-key';
import { clientOrderStat, EDressStatus, IClient, IOrder } from '@/interfaces/type';
import { baseURL } from '@/util/axios';
import { colors, formatPhoneNumber, formatXOF, Rs, SIZES } from '@/util/comon';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';

// Prevent extra re-renders with memo
const AnimatedScrollView = Animated.createAnimatedComponent(Animated.ScrollView);

const page = () => {
  // Get user data from navigation params
  // const  userId  = 1;
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  const userId = useLocalSearchParams<{id: string}>().id;

  const route =  useRouter()

  // Reanimated shared values with initial value
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(200);

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

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // const { data: Orderstat, isLoading: OrderstatIsLoading, error: OrderstatError, refetch: refetchOrderstat } = useQuery<clientOrderStat, Error>({
  //   queryKey: QueryKeys.clients.byUser(userId),
  //   queryFn: async (): Promise<clientOrderStat> => {  // Explicit return type
  //     try {
  //       const resp = await axios.get(`${baseURL}/clients/client-stat/${userId}`);
  //       return resp.data?.reverse(); // Ensure `resp.data` is returned
  //     } catch (error) {
  //       console.error(error);
  //       throw new Error("Failed to fetch stats"); // Rethrow to handle error properly
  //     }
  //   },
  // });




  // Mock fetchUserData - replace with your actual API call
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with your actual data structure
      setUser({
        id: userId,
        name: 'John',
        lastname: 'Doe',
        telephone: '0123456789',
        adresse: '123 Main Street, City, Country',
        email: 'john.doe@example.com',
        createdAt: '2024-01-15',
      });
      
      setOrders([
        { id: 1, date: '2024-03-01', amount: 120.50, status: 'Delivered', items: 3 },
        { id: 2, date: '2024-02-15', amount: 75.20, status: 'Processing', items: 2 },
        { id: 3, date: '2024-01-30', amount: 210.00, status: 'Delivered', items: 5 },
        { id: 4, date: '2024-01-10', amount: 45.80, status: 'Cancelled', items: 1 },
        { id: 5, date: '2023-12-22', amount: 95.30, status: 'Delivered', items: 2 },
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Set active tab without triggering re-renders
  const setTabJS = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  // Scroll handler with memoization to prevent recreating on each render
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Update scrollY without causing excessive re-renders
      scrollY.value = event.contentOffset.y;
      
      // Calculate new header height with smoothing
      const newHeight = interpolate(
        event.contentOffset.y,
        [-50, 0, 120], 
        [150, 150, 80],
        Extrapolation.CLAMP
      );
      
      // Only update if value changes significantly (prevents micro-shaking)
      if (Math.abs(headerHeight.value - newHeight) > 0.5) {
        headerHeight.value = newHeight;
      }
    },
  });

  // Fixed header height style to prevent layout shifts
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
    };
  }, []);

  // Fixed animated styles with optimized calculations
  const headerContentOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [60, 90],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      // Use transform for hardware acceleration
      transform: [{ scale: opacity }]
    };
  }, []);

  const compactHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [80, 100],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      // Fixed position to avoid layout shifts
      transform: [{ translateY: interpolate(
        scrollY.value,
        [80, 100],
        [10, 0],
        Extrapolation.CLAMP
      )}]
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5c60f5" />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </SafeAreaView>
    );
  }

 
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Fixed position header to prevent layout shifting */}
      <Animated.View style={[styles.header, ]}>
         <View style={{position: "absolute", top: Rs(10), left: Rs(10), width: 40, height: 40, justifyContent: "center", alignItems: "center",}} >
              <BackButton backAction={() => route.replace('/users')  } />
        </View>
        <View style={{}}>
             
              {/* <Text style={styles.infoTitle}> Statistiques </Text> */}
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{clientordersStat?.totalOrders}</Text>
                  <Text style={styles.statLabel}>Vêtements</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {formatXOF(Number(clientordersStat?.totalAmount))}
                  </Text>
                  <Text style={styles.statLabel}>montant total</Text> 
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {clientordersStat?.ordersCompleted}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
            </View>
        
        {/* Tab Navigation with absolute positioning */}
     
      </Animated.View>

      <View style={[styles.tabContainer, { top: headerHeight.value -20  }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setTabJS('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Information
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setTabJS('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Commandes ({clientorders?.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      
      
      {/* Content with padding to account for header height */}
      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: headerHeight.value - 89 } // Header + tabs + spacing
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'info' ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Informations personelles </Text>
              
              <DetailListItem label="Nom" value={`${client?.name} ${client?.lastname}`} />
              <DetailListItem label="Téléphone" value={formatPhoneNumber(client?.telephone ?? '')} />
             {/* {client?.email && <DetailListItem label="Email" value={client?.email} />} */}
             {client?.adresse && <DetailListItem label="Adresse" value={client?.adresse} />}
              
              
            </View>
            
            
            
            {/* <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Edit Customer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>Create New Order</Text>
            </TouchableOpacity> */}
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {orders.length > 0 ? (
              clientorders?.map(item =>  <UserOrderItem  key={item?.id.toString()} order= {item} openBottomSheet={() => bottomSheetModalRef.current?.present()} />)
            ) : (
              <View style={styles.emptyOrdersContainer}>
                <Text style={styles.emptyOrdersText}> Aucun commande trouvée pour cet utilisateur</Text>
              </View>
            )}
          </View>
        )}
      </AnimatedScrollView>

      <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(500)]} >
           <>
               <View style={{position: "absolute", top: Rs(10), left: Rs(10), width: 40, height: 40, justifyContent: "center", alignItems: "center",}} >
                <BackButton backAction={() => route.replace({pathname: "/(app)/(tab)/orders"})  } />
              </View>
          
              
          
              {/* <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: Rs(50)}}>
          
              <LoadingScreen 
                          visible={isLoading}
                          backgroundColor="rgba(0, 0, 0, 0.7)"
                          indicatorColor="#FFFFFF"
                          indicatorSize={48}
                          message=""
                          animationType="slide"
                        />
              <View style={{padding: 20, gap: 20}} >
          
                   <PaymentDetails
                    totalPrice={Number(data?.solde_cal)}
                    quantity={data?.quantite}
                    status={data?.status}
                    date_remise={data?.date_remise}
                      />
                   <PaymentInterface
                    clientfullname={data?.client_name}
                    clientphone={data?.client_phone}
                    dresstype={data?.description}
                    tissu={data?.tissus}
                    fabric={data?.photos}
                    mesure={data?.measure}
          
                    quantity={data?.quantite}
                    solde={data?.solde_cal}
                    price={data?.amount}
                    paid={data?.paiement}
          
                    date_remise={data?.date_remise}
                    date_depot={data?.date_depote}
                    deliveryHour={data?.deliveryHour}
                   />
                  </View>
              
          
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
              </ScrollView> */}
          
              
             </>
      </BottomSheetCompo>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#5c60f5',
  },
  header: {
    height: 120,
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    paddingBottom: Rs(15),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    // top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    left: 20,
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  userHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    // bottom: 15,
    left: 20,
    right: 20,
  },
  compactHeaderContent: {
    position: 'absolute',
    bottom: 15,
    left: 70,
    right: 20,
    // justifyContent: 'center',
  },
  compactHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    // textAlign: 'center',
  },
  userAvatar: {
    width: Rs(40),
    height: Rs(40),
    borderRadius: 30,
    backgroundColor: '#5c60f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInitials: {
    fontSize: SIZES.sm,
    color: 'white',
    fontWeight: 'bold',
  },
  userNameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: SIZES.sm,
    color: '#666',
  },
  tabContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#5c60f5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#5c60f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoContainer: {
    gap: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: Rs(10),
    boxShadow: Colors.shadow.card,
  },
  infoTitle: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: '#888',
  },
  infoValue: {
    flex: 2,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: Rs(10),
    boxShadow: Colors.shadow.card
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    // paddingHorizontal: 10,
  },
  statValue: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: '#5c60f5',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: SIZES.md,
    color: colors.grayText,
  },
  actionButton: {
    backgroundColor: '#5c60f5',
    borderRadius: 10,
    paddingVertical: Rs(15),
    alignItems: 'center',
    boxShadow: Colors.shadow.card,
  },
  actionButtonText: {
    color: 'white',
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#5c60f5',
    shadowColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#5c60f5',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersContainer: {
    backgroundColor: 'transparent',
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderDetail: {
    alignItems: 'center',
  },
  orderDetailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyOrdersContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
  },
  emptyOrdersText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default page;