import { Colors } from '@/constants/Colors'
import useActiveStore from '@/hooks/mutations/useActiveStore'
import useLocation from '@/hooks/useLocation'
import { QueryKeys } from '@/interfaces/queries-key'
import { Toklomen } from '@/interfaces/user'
import { useUserStore } from '@/stores/user'
import { base, baseURL } from '@/util/axios'
import { colors, Rs, SIZES } from '@/util/comon'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { XMarkIcon } from 'react-native-heroicons/solid'
import BottomSheetCompo from '../BottomSheetCompo'
import BackButton from '../form/BackButton'
import SubscriptionCompo from '../SubscriptionCompo'
import { SwitchCompo } from '../SwitchCompo'

type Props = {}

const SettingHeader = (props: Props) => {

    const {user} = useUserStore();

    const {address, getAddressFromCoordinates} = useLocation();

    const subscribeBottomSheet = useRef<BottomSheetModal>(null);
    
    const {mutate, isPending,} = useActiveStore();

     const {data, isLoading, error, refetch} = useQuery<Toklomen, Error>({
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

    const [isSwitch, setIsSwitch] = useState(data?.isActiveStore);


     useEffect(() => {
      const locationJson = JSON.parse(data?.location || '{}');
      
      if(locationJson?.x && locationJson?.y){
        getAddressFromCoordinates(locationJson?.x, locationJson?.y);
        
      }
      
    }, [data?.location]);



  return (
   <>
     <View style={styles.storeCardContainer}>
       {isPending && <View style={styles.loading}>
         <ActivityIndicator size="small" color={Colors.app.primary} />
       </View>}
        <View style={styles.storeCard}>
          <View style={styles.storeCardHeader}>
            <View style={styles.storeIconContainer}>
              { data?.store_logo? <Image source={{uri: base +'uploads/'+ data?.store_logo}} resizeMode='cover' style={{width: "100%", height: "100%", }} /> :
               <MaterialCommunityIcons name="storefront" size={28} color="white" /> }
            </View>
            <View style={styles.storeInfoContainer}>
              <Text numberOfLines={1} style={styles.storeName}>{data?.store_name}</Text>
              {data?.location && <Text style={styles.storeAddress}>{address}</Text>}
              {isLoading && <ActivityIndicator size="small" color={Colors.app.primary} />}
            </View>
            <View style={[styles.statusIndicator]}>
              <Text style={styles.statusText}>
                Voir
              </Text>
            </View>
          </View>
          
            <TouchableOpacity style={[styles.quickActionButton, styles.quickActionsRow]}>
              <SwitchCompo label='Affichez ma boutique en ligne'
                style={{justifyContent: "space-between", backgroundColor: "none"}}
                value={isSwitch}
                activeColor={colors.orange}
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
                     <View style={{padding: Rs(20), gap: Rs(20)}} >
                       <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}} >
                       <Text style={{color: Colors.app.texte, fontSize: SIZES.lg, fontWeight: "bold"}} >
                         Votre abonnement a expiré.
                       </Text>
                       <BackButton backAction={() => subscribeBottomSheet?.current?.dismiss() } icon={<XMarkIcon fill={Colors.app.texte} size={Rs(20)} />} />
                       </View>
                       <Text style={{color: Colors.app.available.unav_txt}}> 
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

const styles = StyleSheet.create({
  storeCardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    // backgroundColor: 
  },
  storeCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  storeCardHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: "white",
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orange,
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
    color: "#333",
  },
  storeAddress: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.available.av_txt,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  quickActionsRow: {
    flexDirection: "row",
    backgroundColor: colors.lightOrange,
    justifyContent: "space-evenly",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ffffff",
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
});