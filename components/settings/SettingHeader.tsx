import useActiveStore from '@/hooks/mutations/useActiveStore'
import useLocation from '@/hooks/useLocation'
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme'
import { QueryKeys } from '@/interfaces/queries-key'
import { Toklomen } from '@/interfaces/user'
import { useUserStore } from '@/stores/user'
import { base, baseURL } from '@/util/axios'
import { Rs, SIZES } from '@/util/comon'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { XMarkIcon } from 'react-native-heroicons/solid'
import BottomSheetCompo from '../BottomSheetCompo'
import BackButton from '../form/BackButton'
import SubscriptionCompo from '../SubscriptionCompo'
import { SwitchCompo } from '../SwitchCompo'

const SettingHeader = () => {
    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const {user} = useUserStore();

    const {address, getAddressFromCoordinates} = useLocation();

    const subscribeBottomSheet = useRef<BottomSheetModal>(null);
    
    const {mutate, isPending,} = useActiveStore();

     const {data, isLoading, refetch} = useQuery<Toklomen, Error>({
      queryKey: QueryKeys.tokloman.byToklomanStore,
      queryFn: async (): Promise<Toklomen> => {  // Explicit return type
        try {
          const resp = await axios.get(`${baseURL}/tokloMen/${Number(user?.id)}`);
          return resp.data; // Ensure `resp.data` is returned
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
        }
      },
     });

    const [isSwitch, setIsSwitch] = useState(false);


     useEffect(() => {
      const rawLocation = data?.location as unknown;
      let locationJson: { x?: unknown; y?: unknown } = {};

      try {
        locationJson = typeof rawLocation === 'string'
          ? JSON.parse(rawLocation)
          : rawLocation && typeof rawLocation === 'object'
            ? rawLocation as { x?: unknown; y?: unknown }
            : {};
      } catch (error) {
        console.error('Invalid store location JSON', error);
      }

      const latitude = Number(locationJson?.x);
      const longitude = Number(locationJson?.y);
      
      if(Number.isFinite(latitude) && Number.isFinite(longitude)){
        getAddressFromCoordinates(latitude, longitude);
        
      }
      
    }, [data?.location, getAddressFromCoordinates]);

    useEffect(() => {
      setIsSwitch(Boolean(data?.isActiveStore));
    }, [data?.isActiveStore]);



  return (
   <>
     <View style={styles.storeCardContainer}>
       {isPending && <View style={styles.loading}>
         <ActivityIndicator size="small" color={theme.primary} />
       </View>}
        <View style={styles.storeCard}>
          <View style={styles.storeCardHeader}>
            <View style={styles.storeIconContainer}>
              { data?.store_logo? <Image source={{uri: base +'uploads/'+ data?.store_logo}} resizeMode='cover' style={{width: "100%", height: "100%", }} /> :
               <MaterialCommunityIcons name="storefront" size={28} color="#FFFFFF" /> }
            </View>
            <View style={styles.storeInfoContainer}>
              <Text numberOfLines={1} style={styles.storeName}>{data?.store_name}</Text>
              {data?.location && <Text style={styles.storeAddress}>{address}</Text>}
              {isLoading && <ActivityIndicator size="small" color={theme.primary} />}
            </View>
            <View style={[styles.statusIndicator]}>
              <Text style={styles.statusText}>
                Voir
              </Text>
            </View>
          </View>
          
            <TouchableOpacity style={[styles.quickActionButton, styles.quickActionsRow]}>
              <SwitchCompo label='Affichez ma boutique en ligne'
                style={{justifyContent: "space-between", backgroundColor: "transparent"}}
                value={isSwitch}
                activeColor={theme.gold}
                onValueChange={()=> {
                setIsSwitch(!isSwitch)
                mutate(isSwitch? false : true, {
                  onSuccess: () => {
                    refetch();
                  }
                })
                }} />
            </TouchableOpacity>
        </View>
     </View>

               {/* payement bottomsheet */}
     
               <BottomSheetCompo bottomSheetModalRef={subscribeBottomSheet} snapPoints={["100%"]} >
                     <View style={styles.subscribeIntro} >
                       <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}} >
                       <Text style={styles.subscribeTitle} >
                         Votre abonnement a expiré.
                       </Text>
                       <BackButton backAction={() => subscribeBottomSheet?.current?.dismiss() } icon={<XMarkIcon fill={theme.text} size={Rs(20)} />} />
                       </View>
                       <Text style={styles.subscribeText}> 
                         Pour continuer à profiter de tous nos services et fonctionnalités, veuillez renouveler votre abonnement.
                       </Text>
                     </View>
                     <SubscriptionCompo redirectURL="(tab)/add-dress" closeBottomSheet={() => subscribeBottomSheet?.current?.dismiss()} />
               </BottomSheetCompo>
                  {/* payement bottomsheet */}
     
   </>

  )
}

export default SettingHeader

const createStyles = (theme: AppTheme) => StyleSheet.create({
  storeCardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storeCard: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: "hidden",
  },
  storeCardHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: theme.card,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.gold,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  storeInfoContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "600",
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.success,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  quickActionsRow: {
    flexDirection: "row",
    backgroundColor: theme.primaryLight,
    justifyContent: "space-evenly",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },

  loading: {
    flex: 1,
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  subscribeIntro: {
    backgroundColor: theme.card,
    gap: Rs(20),
    padding: Rs(20),
  },
  subscribeTitle: {
    color: theme.text,
    fontSize: SIZES.lg,
    fontWeight: "bold",
  },
  subscribeText: {
    color: theme.danger,
  },
});
