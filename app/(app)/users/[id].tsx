import BottomSheetCompo from '@/components/BottomSheetCompo';
import PaymentInterface from '@/components/calendar/CardDetails';
import PaymentDetails from '@/components/calendar/OrderDetail';
import DressStatus from '@/components/dress/DressStatus';
import BackButton from '@/components/form/BackButton';
import RoundedBtn from '@/components/form/RoundedBtn';
import { Colors } from '@/constants/Colors';
import useInvoice from '@/hooks/useInvoice';
import { QueryKeys } from '@/interfaces/queries-key';
import { clientOrderStat, EDressStatus, IClient, IOrder, TInvoice } from '@/interfaces/type';
import { useUserStore } from '@/stores/user';
import { base, baseURL } from '@/util/axios';
import { colors, formatXOF, generateInvoiceNumber, Rs, SCREEN_H, SIZES } from '@/util/comon';
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/solid';


type OrderStatusValue = IOrder["status"] | EDressStatus | string | undefined | null;

const getOrderStatus = (status: OrderStatusValue): EDressStatus | undefined => {
  const statuses = Object.values(EDressStatus);

  if (typeof status === "string" && statuses.includes(status as EDressStatus)) {
    return status as EDressStatus;
  }

  if (status && typeof status === "object" && "status" in status) {
    const nestedStatus = status.status;
    if (statuses.includes(nestedStatus)) {
      return nestedStatus;
    }
  }

  return undefined;
};

const UserOrderList = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const [selectOrder, setSelectOrder] = useState<IOrder | undefined>(undefined);
  const [isTabsPinned, setIsTabsPinned] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const headerHeightRef = useRef(0);
  const summaryHeightRef = useRef(0);

    const userId = useLocalSearchParams<{id: string}>().id;

   const {user} = useUserStore();

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
	      clientPhone: selectOrder?.client_phone ?? "",
	      invoiceNumber: generateInvoiceNumber(
          user?.id || 0,
          selectOrder?.updatedat
            ? new Date(selectOrder.updatedat).toISOString()
            : new Date().toISOString(),
        ),
      invoiceDate: new Date().toLocaleDateString('fr-FR'),
      staus: "Payée",
      dressName: selectOrder?.description?? "",
      quantite: selectOrder?.quantite?? "",
      price: Number(selectOrder?.amount),
      totalPrice: Number(selectOrder?.amount) * Number(selectOrder?.quantite),
      paiement: Number(selectOrder?.paiement),
      biTotal: Number(selectOrder?.amount) * Number(selectOrder?.quantite) -  Number(selectOrder?.paiement)
 
    });
	  }, [selectOrder, user?.id, user?.phone, user?.store_name, user?.store_slogan]);
   
  
   
    const { data: client } = useQuery<IClient, Error>({
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
  
    const { data: clientorders } = useQuery<IOrder[], Error>({
      queryKey: QueryKeys.clients.clientOrdersbyId((Number(userId))),
      queryFn: async (): Promise<IOrder[]> => {  // Explicit return type
        try {
          const resp = await axios.post(`${baseURL}/orders/by-client`, {client_id: Number(userId)});
          console.log(resp.data)
          return resp.data; // Ensure `resp.data` is returned
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch client's orders"); // Rethrow to handle error properly
        }
      },
    });
  
    const { data: clientordersStat } = useQuery<clientOrderStat, Error>({
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
        <Text style={styles.date}>Date de dépôt: {formatDate(item.date_depote)} </Text>
        <View style={styles.priceStatusContainer}>
          <Text style={styles.price}>{formatXOF(Number(item.amount))}</Text>

           <DressStatus status={getOrderStatus(item.status) ?? EDressStatus.ONGOING} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderInformation = () => (
      <View style={styles.informationContainer}>
      
      <View style={styles.infoSection}>
        <View style={styles.infoIconContainer}>
          <MaterialIcons name="person" size={24} color={colors.orange} />
        </View>
        <View style={styles.infoDetails}>
          <Text style={styles.infoLabel}> Nom complet  </Text>
          <Text style={styles.infoValue}> {client?.lastname} {client?.name}</Text>
        </View>
      </View>
      
      
      <View style={styles.infoSection}>
        <View style={styles.infoIconContainer}>
          <MaterialIcons name="phone" size={24} color={colors.orange} />
        </View>
        <View style={styles.infoDetails}>
          <Text style={styles.infoLabel}>Téléphone</Text>
          <Text style={styles.infoValue}> {client?.telephone} </Text>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.infoIconContainer}>
          <MaterialIcons name="location-on" size={24} color={colors.orange} />
        </View>
        <View style={styles.infoDetails}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}> {client?.adresse} </Text>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.infoIconContainer}>
          <MaterialCommunityIcons name="account-check" size={24} color={colors.orange} />
        </View>
        <View style={styles.infoDetails}>
          <Text style={styles.infoLabel}> Membre depuis </Text>
          {/* <Text style={styles.infoValue}> {client?.} </Text> */}
          
        </View>
      </View>
    </View>
  );

  // Helper functions
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const [day, month, year] = dateString.split("/").map(Number);

    if (day && month && year) {
      return new Date(year, month - 1, day).toLocaleDateString("fr-FR", options);
    }

    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const scrollToTabs = (animated = true) => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(headerHeightRef.current + summaryHeightRef.current - 1, 0),
      animated,
    });
  };

  const handleTabChange = (tab: "info" | "orders") => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      scrollToTabs();
    });
    setTimeout(() => {
      scrollToTabs();
    }, 80);
  };

  const renderTabs = (isPinned = false) => (
    <View style={[styles.tabContainer, isPinned && styles.pinnedTabContainer]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'info' && styles.activeTab]}
        onPress={() => handleTabChange('info')}
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

      <View style={styles.tabSeparator} />

      <TouchableOpacity
        style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
        onPress={() => handleTabChange('orders')}
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.screenScrollContent}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          const tabsStartY = headerHeightRef.current + summaryHeightRef.current;
          const nextIsTabsPinned = tabsStartY > 0 && scrollY >= tabsStartY;
          setIsTabsPinned((current) =>
            current === nextIsTabsPinned ? current : nextIsTabsPinned,
          );
        }}
      >
        {/* Header */}
        <View
          style={styles.header}
          onLayout={(event) => {
            headerHeightRef.current = event.nativeEvent.layout.height;
          }}
        >

          <BackButton backAction={() => {
             router.replace({pathname: "/(app)/users"}) 
          }
              } />

          <Text style={styles.headerTitle}> {client?.name} {client?.lastname} </Text>
        </View>
        
        {/* Summary Section */}
        <View
          style={styles.summaryContainer}
          onLayout={(event) => {
            summaryHeightRef.current = event.nativeEvent.layout.height;
          }}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="shirt" size={22} color={colors.orange} />
              </View>
              <View>
                {clientordersStat ? <Text style={styles.summaryValue}>{clientordersStat?.totalOrders}</Text> : <ActivityIndicator size="small" color={Colors.app.primary} />}
                <Text style={styles.summaryLabel}>Vêtement</Text>
              </View>
            </View>
            
            <View style={styles.summarySeparator} />

            <View style={styles.summaryItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                <FontAwesome name="dollar" size={22} color="#4CAF50" />
              </View>
              <View>
               {clientordersStat ? <Text style={styles.summaryValue}>{formatXOF(Number(clientordersStat?.totalAmount))}</Text> : <ActivityIndicator size="small" color={Colors.app.primary} />}
                <Text style={styles.summaryLabel}>Montant</Text>
              </View>
            </View>
            
            <View style={styles.summarySeparator} />

            <View style={styles.summaryItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
                <MaterialIcons name="done-all" size={22} color={colors.orange} />
              </View>
              <View>
                {clientordersStat ? <Text style={styles.summaryValue}>{clientordersStat?.ordersCompleted}</Text> : <ActivityIndicator size="small" color={Colors.app.primary} />}
                <Text style={styles.summaryLabel}>Livrés</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabWrapper}>
          {renderTabs()}
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
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {isTabsPinned && (
        <View style={styles.pinnedTabWrapper}>
          {renderTabs(true)}
        </View>
      )}

      <BottomSheetCompo bottomSheetModalRef={bottomSheetModal} snapPoints={['90%']} >
        <View style={styles.header}>
          <BackButton backAction={() => bottomSheetModal?.current?.close() } icon={<XMarkIcon fill={Colors.app.texteLight} size={Rs(20)} />} />
        </View>

         <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: Rs(50), }}>
        
            <View style={{padding: 20, gap: 20, }} >
        
                
                {selectOrder &&
                 <PaymentDetails
                  totalPrice={Number(selectOrder.solde_cal)}
                  status={getOrderStatus(selectOrder.status) ?? EDressStatus.ONGOING}
                  date_remise={selectOrder.date_remise}
                  date_depot={selectOrder.date_depote}
                  solde_cal={selectOrder.solde_cal}
                  paiement={selectOrder.paiement}
                    />}
        
               { selectOrder &&
                <PaymentInterface
                  clientfullname={selectOrder.client_name ?? ""}
                  clientphone={selectOrder.client_phone ?? ""}
                  dresstype={selectOrder.description}
                  tissu={selectOrder.tissus}
                  fabric={selectOrder.photos}
                  mesure={selectOrder.measure}
        
                  quantity={selectOrder.quantite}
                  solde={selectOrder.solde_cal}
                  price={selectOrder.amount}
                  paid={selectOrder.paiement}
        
                  date_remise={new Date(selectOrder.date_remise)}
                  date_depot={new Date(selectOrder.date_depote)}
                  deliveryHour={selectOrder.deliveryHour}
                 />}
                </View>
              {getOrderStatus(selectOrder?.status) === EDressStatus.DELIVERED && <View style={{paddingHorizontal: 20, marginBottom: Rs(50), flexDirection: "row", alignItems: "center", gap: 20}} >
               
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
  screenScrollContent: {
    paddingBottom: Rs(24),
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
    alignItems: "stretch",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    // flexDirection: 'row',
    justifyContent: "center",
    gap: 10
  },
  summarySeparator: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "#E5E7EB",
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
  tabWrapper: {
    backgroundColor: "white",
    paddingTop: Rs(8),
    paddingBottom: Rs(8),
  },
  pinnedTabWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingTop: Rs(8),
    paddingBottom: Rs(8),
    zIndex: 50,
    elevation: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 15,
    boxShadow: Colors.shadow.card,
    overflow: "hidden",
  },
  pinnedTabContainer: {
    marginTop: 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  tabSeparator: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "#E5E7EB",
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
    marginTop: 15,
    minHeight: SCREEN_H,
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
    backgroundColor: colors.inputborderColor,
    
    
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
    alignItems: "center",
    marginBottom: 20,
  },
  infoIconContainer: {
    width: Rs(42),
    height: Rs(42),
    borderRadius: Rs(21),
    backgroundColor: colors.lightOrange,
    alignItems: "center",
    justifyContent: "center",
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
