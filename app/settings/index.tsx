import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { 
  MaterialCommunityIcons, 
  Ionicons, 
  FontAwesome5,
  AntDesign,
  Feather
} from '@expo/vector-icons';
import BackButton from '@/components/form/BackButton';
import { colors, Rs } from '@/util/comon';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheetCompo from '@/components/BottomSheetCompo';
import StoreInfo from '@/components/settings/StoreInfo';

import { useRouter } from 'expo-router';
import useLocation from '@/hooks/useLocation';
import axios, { AxiosError } from 'axios';
import { base, baseURL } from '@/util/axios';
import { useQuery } from '@tanstack/react-query';
import { ITokloUser, Toklomen } from '@/interfaces/user';
import { QueryKeys } from '@/interfaces/queries-key';
import { useUserStore } from '@/stores/user';
import { Colors } from '@/constants/Colors';
import ToklomanUser from '@/components/settings/ToklomanUser';
import { SwitchCompo } from '@/components/SwitchCompo';
import SettingHeader from '@/components/settings/SettingHeader';

const Page = () => {
  // Sample store data

  const bottosheetRef = useRef<BottomSheetModal>(null);
  const router = useRouter();

   const {user, tokloUser} = useUserStore();


     const {data, isLoading, error, refetch} = useQuery<Toklomen, Error>({
      queryKey: QueryKeys.tokloman.byToklomanStore,
      queryFn: async (): Promise<Toklomen> => {  // Explicit return type
        try {
          const resp = await axios.get(`${baseURL}/tokloMen/${Number(user?.id)}`);
          // console.log("tokloMen°°°°°°", resp.data)
          return resp.data; // Ensure `resp.data` is returned
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
        }
      },
    });
    

    const {data: users, isLoading: usersIsloading, error: usersError, refetch: usersRefetch} = useQuery<ITokloUser[], Error>({
      queryKey: QueryKeys.tokloman.byToklomanUsers,
      queryFn: async (): Promise<ITokloUser[]> => {  // Explicit return type
        try {
          const resp = await axios.get(`${baseURL}/tokloMen/users/${Number(user?.id)}`);

          // console.log("tokloMen°°°°°°", user?.id)
          return resp.data; // Ensure `resp.data` is returned
        } catch (error) {
          if(axios.isAxiosError(error)){
          console.error(error.response?.data);
          }
          throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
        }
      },
    });


  
    const {location, displayindAddress, getAddressFromCoordinates} = useLocation();

    useEffect(() => {
      if(data?.location){

        const locationJSON = JSON.parse(data?.location || '');
        getAddressFromCoordinates(locationJSON?.x, locationJSON?.y);
      }
      return () => {
        
      }
    }, [data])

    function handleClose() {
      bottosheetRef.current?.dismiss()
    }
    
  

  const storeData = {
    name: "Urban Grocery Market",
    address: "123 Main Street, Cityville",
    openStatus: true,
    coverImage: null // You would use a real image here
  };

  // Parameter categories with their respective icons and descriptions
  const parameterCategories = [
    {
      id: 'store-info',
      title: 'Infos de votre boutique',
      icon: <MaterialCommunityIcons name="store" size={24} color="#ffffff" />,
      color: colors.available.av_txt,
      description: 'Nom , contact,whatsapp, logo, bannière, localisation',
      badge: null,
      count: 6
    },
    {
     id: 'notifications',
     title: 'Notifications',
     icon: <Ionicons name="notifications" size={24} color="#ffffff" />,
     color: colors.available.unav_txt,
     description: 'Nombre de jours avant et nombre de notification',
     badge: null,
     count: 7
   },
    {
      id: 'toklo-users',
      title: 'Équipe Couture',
      icon: <Ionicons name="people-circle-outline" size={24} color="#ffffff" />,
      color: '#9b59b6', 
      description: "Gestion des artisans et du personnel de l'atelier",
      badge: null,
      count: users?.length || 0
    }
    // {
    //   id: 'delivery-options',
    //   title: 'Delivery Settings',
    //   icon: <FontAwesome5 name="shipping-fast" size={20} color="#e74c3c" />,
    //   color: '#e74c3c',
    //   description: 'Delivery radius, fees, minimum orders, and availability',
    //   badge: 'Updated',
    //   count: 6
    // },
    // {
    //   id: 'pickup-options',
    //   title: 'Pickup Options',
    //   icon: <MaterialCommunityIcons name="shopping" size={24} color="#2ecc71" />,
    //   color: '#2ecc71',
    //   description: 'In-store pickup rules, wait times, and procedures',
    //   badge: null,
    //   count: 3
    // },
    // {
    //   id: 'payment-methods',
    //   title: 'Payment Methods',
    //   icon: <MaterialCommunityIcons name="credit-card-outline" size={24} color="#f39c12" />,
    //   color: '#f39c12',
    //   description: 'Accepted payment types, cash handling, and digital payments',
    //   badge: null,
    //   count: 5
    // },
    // {
    //   id: 'tax-settings',
    //   title: 'Tax Settings',
    //   icon: <FontAwesome5 name="percentage" size={18} color="#16a085" />,
    //   color: '#16a085',
    //   description: 'Sales tax configurations, tax-exempt rules, and reports',
    //   badge: 'New',
    //   count: 2
    // },
    // {
    //   id: 'inventory',
    //   title: 'Inventory Rules',
    //   icon: <Feather name="box" size={22} color="#8e44ad" />,
    //   color: '#8e44ad',
    //   description: 'Stock handling, low inventory alerts, and auto-ordering',
    //   badge: null,
    //   count: 8
    // },
    // {
    //   id: 'staff-access',
    //   title: 'Staff & Permissions',
    //   icon: <Ionicons name="people" size={24} color="#d35400" />,
    //   color: '#d35400',
    //   description: 'Employee access levels and management capabilities',
    //   badge: null,
    //   count: 4
    // },
    
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton backAction={() => router.back()} icon={<Feather name="arrow-left" size={24} color="#333" />} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSubtitle}>Gérer vos paramètres </Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Store Card Summary */}
       <SettingHeader />
     {tokloUser?.id ?  <View>
        <Text style={[styles.sectionTitle, {marginLeft: Rs(20), marginBottom: Rs(5)}]}>Utilisateur  </Text>

        <ToklomanUser 
          user={tokloUser}
        />
       </View> :

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* <Text style={styles.sectionTitle}>Paramètres Catégories</Text> */}

       
        
        {parameterCategories.map((category) => (
          <TouchableOpacity 
            key={category.id}
            style={styles.categoryCard}
            onPress={() => {
              if(category.id == "store-info"){
                bottosheetRef.current?.present()
              }else{
               router.push("/settings/"+category.id)
              }
            }}
          >
            <View style={styles.categoryCardContent}>
              <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                {category.icon}
              </View>
              
              <View style={styles.categoryInfo}>
                <View style={styles.categoryTitleRow}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  {category.badge && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{category.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.categoryDescription}>{category.description}</Text>
                <View style={styles.categoryMeta}>
                  <Text style={styles.parameterCount}>{category.count} parameters</Text>
                </View>
              </View>
              
              <View style={styles.chevronContainer}>
                <AntDesign name="right" size={18} color="#bbb" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        
      </ScrollView>}

      <BottomSheetCompo bottomSheetModalRef={bottosheetRef} snapPoints={['90%']} >
        
        <StoreInfo  handleClose={handleClose} />
      </BottomSheetCompo>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
    gap: Rs(15),
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  storeCardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeCardHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: "hidden"
  },
  storeInfoContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  storeAddress: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.available.av_txt,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f7fa',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  divider: {
    width: 1,
    backgroundColor: '#ddd',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 16,
    paddingLeft: 4,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  badgeContainer: {
    backgroundColor: '#ff9ff3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  categoryMeta: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  parameterCount: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});

export default Page;