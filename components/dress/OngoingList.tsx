import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import DressItem from "./DressItem";
import FileSheet from "../takeOrder/FileSheet";
import { Sheet } from "../Sheet";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
// import DressDetail from './DressDetail';
import { colors, Rs, SCREEN_H, SIZES } from "@/util/comon";
import { EDressStatus, IOrder } from "@/interfaces/type";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useOrderStore } from "@/stores/order";
import useChangeOrderStatus from "@/hooks/mutations/useChangeOrderStatus";
import ModalCompo from "../ModalCompo";

import {Plane, Pulse, Swing} from "react-native-animated-spinkit"
import LoadingScreen from "../Loading";
import BottomSheetCompo from "../BottomSheetCompo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import RoundedBtn from "../form/RoundedBtn";
import { alertMgs } from "@/util/appText";
import { Colors } from "@/constants/Colors";
import userPrint from "@/hooks/usePrint";
import RemindedOrderPrice from "../form/RemindedOrderPrice";
import { useUserStore } from "@/stores/user";

type Props = {};

const OngoingList = (props: Props) => {
  const sheetRef = useRef<TrueSheet>(null);

  const {setOngoingOrderLength} = useOrderStore()
  
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [selectedItem, setSelectedItem] = useState<{id: number, status: EDressStatus} | {}>({})

  const {user} = useUserStore()
  
  const { data, isLoading, error, refetch } = useQuery<IOrder[], Error>({
    queryKey: QueryKeys.orders.onGoing,
    queryFn: async (): Promise<IOrder[]> => {
      // Explicit return type

      //  console.log("============ QueryKeys.orders.onGoing", QueryKeys.orders.onGoing)
      
      const data = {
        Toklo_menId: user?.id,
        status: "ONGOING",
      };
      try {
        const resp = await axios.post(baseURL+"/orders/by-toklo", data);
        // console.log("ààààààààààààààà", resp.data);
        if (resp.data.length > 0) {
          setOngoingOrderLength(resp.data.length)
        }
        return resp.data; 
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); 
      }
    },
  });

  const {print, selectPrinter} = userPrint()

  const  {mutate, isPending} = useChangeOrderStatus(() => {}, EDressStatus.ONGOING );

  const [isSold, setIsSold] = useState(false);

  useEffect(() => {
    // selectPrinter({
    //   id: 1,
    //   client_name: "Konan",
    //   client_phone: "+22507893456",
    //   client_lastname: "Kouamé",
      
    //   amount: "125000",
    //   paiement: "AVANCE",
    //   description: "Costume de mariage avec doublure personnalisée et boutons dorés",
    //   photos: "costume_photo1.jpg",
    //   solde_cal: "75000",
      
    // })
  }, [])

  const presentDetailModal = async () => {
    await sheetRef.current?.present();
    // console.log('horray! sheet has been presented 💩')
  };

  function handleChangeStatus() {
    
      bottomSheetModalRef.current?.dismiss()
      mutate(selectedItem);
  }

  // const dataFiltered = useMemo(() => {
  //   return data?.filter((item) => {
  //     const searchTerm = filterVal?.toLowerCase();
  //     return (
  //       item.name?.toLowerCase().includes(searchTerm) ||
  //       item.lastname?.toLowerCase().includes(searchTerm)
  //     );
  //   });
  // }, [data]);
   // Only recalculate when data or filterVal changes

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: IOrder) => item.id.toString(), []);

  // Memoize renderItem
  const renderItem = useCallback(
    ({ item }: { item: IOrder }) => (
      <DressItem item={item} type="ORDER" showDetail={presentDetailModal} handleChangeStatus={() => {

        if(Number(item?.solde_cal) > 0){
          setIsSold(true)
        }
        setSelectedItem({id: item.id, status: EDressStatus.FINISHED});
        bottomSheetModalRef.current?.present()
      }} />
    ),
    []
  );

  

  return (
    <>

    <View style={styles.container}>
     
    

      <FlashList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={() => (
                 <View style={{ flex: 1, marginTop: Rs(100) , justifyContent: "center", alignItems: "center", }} >
                   <Text style={{ fontSize: SIZES.md, color: Colors.app.texteLight }}>Pas de commande en cours</Text>
                 </View>
          )}
        removeClippedSubviews={true} // Optimisation de performance
        estimatedItemSize={200}
      />

    </View>
      <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(190)]} >
          <View style={{height: Rs(150), justifyContent: "center", alignItems: "center", gap: Rs(20), paddingHorizontal: Rs(20)}} >
             <Text style={{fontSize: SIZES.sm, color: Colors.app.texteLight}}> 
              { alertMgs.order.order.statussChanging.finish.fr }
            </Text>
            
            <RoundedBtn label={"Terminer"}  disabled loading={isPending} action={() => handleChangeStatus() }  />
          </View>
        </BottomSheetCompo>
    </>
  );
};

export default OngoingList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
