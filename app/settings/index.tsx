import BottomSheetCompo from '@/components/BottomSheetCompo';
import BackButton from '@/components/form/BackButton';
import StoreInfo from '@/components/settings/StoreInfo';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { Rs } from '@/util/comon';
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import SettingHeader from '@/components/settings/SettingHeader';
import ToklomanUser from '@/components/settings/ToklomanUser';
import useLocation from '@/hooks/useLocation';
import { QueryKeys } from '@/interfaces/queries-key';
import { ITokloUser, Toklomen } from '@/interfaces/user';
import { useUserStore } from '@/stores/user';
import { baseURL } from '@/util/axios';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Page = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bottosheetRef = useRef<BottomSheetModal>(null);
  const router = useRouter();

  const { user, tokloUser } = useUserStore();
  const userId = user?.id;

  const { data, error: storeError } = useQuery<Toklomen, Error>({
    queryKey: [...QueryKeys.tokloman.byToklomanStore, userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Toklomen> => {
      try {
        const resp = await axios.get(`${baseURL}/tokloMen/${Number(userId)}`);
        return resp.data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch store settings");
      }
    },
  });
    
  const { error: usersError } = useQuery<ITokloUser[], Error>({
    queryKey: [...QueryKeys.tokloman.byToklomanUsers, userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ITokloUser[]> => {
      try {
        const resp = await axios.get(`${baseURL}/tokloMen/users/${Number(userId)}`);
        return resp.data;
      } catch (error) {
        if (isAxiosError(error)) {
          console.error(error.response?.data);
        }
        throw new Error("Failed to fetch users");
      }
    },
  });

  const { getAddressFromCoordinates } = useLocation();

  useEffect(() => {
    if (data?.location) {
      try {
        const locationJSON = typeof data.location === 'string'
          ? JSON.parse(data.location)
          : data.location;
        const latitude = Number(locationJSON?.x);
        const longitude = Number(locationJSON?.y);

        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          getAddressFromCoordinates(latitude, longitude);
        }
      } catch (error) {
        console.error('Invalid store location JSON', error);
      }
    }
  }, [data?.location, getAddressFromCoordinates])

  function handleClose() {
    bottosheetRef.current?.dismiss()
  }
    
  

  // Parameter categories with their respective icons and descriptions
  const parameterCategories = [
    {
      id: 'store-info',
      title: 'Infos de votre boutique',
      icon: <MaterialCommunityIcons name="store" size={24} color="#ffffff" />,
      color: theme.success,
      description: 'Nom , contact,whatsapp, logo, bannière, localisation',
      badge: null,
      count: 6
    },
    {
     id: 'notifications',
     title: 'Notifications',
     icon: <Ionicons name="notifications" size={24} color="#ffffff" />,
     color: theme.danger,
     description: 'Nombre de jours avant et nombre de notification',
     badge: null,
     count: 7
   },
    // {
    //   id: 'toklo-users',
    //   title: 'Équipe Couture',
    //   icon: <Ionicons name="people-circle-outline" size={24} color="#ffffff" />,
    //   color: '#9b59b6', 
    //   description: "Gestion des artisans et du personnel de l'atelier",
    //   badge: null,
    //   count: usersIsLoading ? '...' : users?.length || 0
    // }
    
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton backAction={() => router.back()} icon={<Feather name="arrow-left" size={24} color={theme.text} />} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSubtitle}>Gérer vos paramètres </Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Store Card Summary */}
       {(storeError || usersError) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            Certains paramètres n&apos;ont pas pu être chargés.
          </Text>
        </View>
       )}
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
              if(category.id === "store-info"){
                router.push('/settings/store')
              }else if(category.id === "notifications"){
               router.push("/settings/notifications")
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
                <AntDesign name="right" size={18} color={theme.muted} />
              </View>
            </View>
            <Image style={styles.traditional} source={require("@/assets/images/measure/top-sheet.png")} />
          </TouchableOpacity>
        ))}
        
        
      </ScrollView>}

      <BottomSheetCompo
        bottomSheetModalRef={bottosheetRef}
        snapPoints={['90%']}
        android_keyboardInputMode="adjustResize"
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
      >
        
        <StoreInfo  handleClose={handleClose} />
      </BottomSheetCompo>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "transparent",
    gap: Rs(15),
  },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.goldLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  errorBannerText: {
    color: theme.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.muted,
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
    backgroundColor: theme.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeCardHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: theme.card,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.primary,
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
    color: theme.text,
  },
  storeAddress: {
    fontSize: 14,
    color: theme.muted,
    marginTop: 2,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.success,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsRow: {
    flexDirection: 'row',
    backgroundColor: theme.primaryLight,
    justifyContent: 'space-evenly',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  quickActionText: {
    fontSize: 14,
    color: theme.text,
    marginLeft: 6,
  },
  divider: {
    width: 1,
    backgroundColor: theme.border,
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
    color: theme.text,
    marginTop: 10,
    marginBottom: 16,
    paddingLeft: 4,
  },
  categoryCard: {
    position: "relative",
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden"
  },
  traditional:{
    width: 100,
    height:100,
    position:"absolute",
    top: -6,
    right: -16
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
    color: theme.text,
  },
  badgeContainer: {
    backgroundColor: theme.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryDescription: {
    fontSize: 13,
    color: theme.muted,
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
    color: theme.muted,
    fontWeight: '500',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});

export default Page;
