import { Colors } from "@/constants/Colors";
import useChangeOrderStatus from "@/hooks/mutations/useChangeOrderStatus";
import usePayOrderSold from "@/hooks/mutations/usePayOrderSold";
import { QueryKeys } from "@/interfaces/queries-key";
import { EDressStatus, IOrder } from "@/interfaces/type";
import { useOrderStore } from "@/stores/order";
import { useUserStore } from "@/stores/user";
import { alertMgs } from "@/util/appText";
import { baseURL } from "@/util/axios";
import { formatXOF, Rs, SIZES } from "@/util/comon";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomSheetCompo from "../BottomSheetCompo";
import RoundedBtn from "../form/RoundedBtn";
import DressItem from "./DressItem";

type Props = {};

const FinishedList = (props: Props) => {
    const {setFinishedOrderLength} = useOrderStore()
  
   const {user} = useUserStore()
  const { data, isLoading, error, refetch } = useQuery<IOrder[], Error>({
    queryKey: QueryKeys.orders.finished,
    queryFn: async (): Promise<IOrder[]> => {
      const data = {
        Toklo_menId: user?.id,
        status: "FINISHED",
      };
      try {
        const resp = await axios.post(baseURL+"/orders/by-toklo", data);
        if (resp.data.length > 0) {
          setFinishedOrderLength(resp.data.length)
        }
        return resp.data; 
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); 
      }
    },
  });

  const [selectedItem, setSelectedItem] = useState<IOrder | null>(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  
  const  {mutate, isPending} = useChangeOrderStatus(() => {}, EDressStatus.FINISHED );
  const  {mutate: payOrderSoldMutate, isPending: isPayOrderSoldPending} = usePayOrderSold(() => {}, EDressStatus.FINISHED );
  
  function handleChangeStatus(isPayDelivered: boolean) {
        if (!selectedItem) return;
      
        bottomSheetModalRef.current?.dismiss();
        if(isPayDelivered){
          
          payOrderSoldMutate({id: selectedItem?.id, paiement: selectedItem?.paiement, solde_cal:  selectedItem?.solde_cal});
        }else{

           mutate({id: selectedItem?.id, status: EDressStatus.DELIVERED});
        }
    }

  const presentDetailModal = async () => {
    // console.log('horray! sheet has been presented 💩')
  };


  // Memoize keyExtractor
  const keyExtractor = useCallback((item: IOrder) => item.id.toString(), []);

  // Memoize renderItem
  const renderItem = useCallback(
    ({ item }: { item: IOrder }) => (
      <DressItem item={item} type="ORDER" showDetail={presentDetailModal} handleChangeStatus={() => {
        setSelectedItem(item);
        bottomSheetModalRef.current?.present()
      }} />
    ),
    []
  );

  return (
    <>
    {/* {data &&  <LoadingScreen 
      visible={isPending || isPayOrderSoldPending}
      backgroundColor="rgba(0, 0, 0, 0.7)"
      indicatorColor="#FFFFFF"
      indicatorSize={48}
      message=""
      animationType="slide"
    />} */}
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
                    <Text style={{ fontSize: SIZES.md, color: Colors.app.texteLight }}>Pas de commande terminée</Text>
                  </View>
                )}
        removeClippedSubviews={true} // Optimisation de performance
      />

    </View>

    <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(190)]} >
          <View style={{height: Rs(150), justifyContent: "center", alignItems: "center" ,  gap: Rs(20), paddingHorizontal: Rs(20)}} >
            <Text style={{fontSize: SIZES.sm, color: Colors.app.texteLight, textAlign: "justify"}}> 
              {Number(selectedItem?.solde_cal) > 0 ? <Text>Il reste un solde de <Text style={{color: Colors.app.error}} > {formatXOF(Number(selectedItem?.solde_cal))} </Text> à régler pour ce vêtement. 💰 </Text> :  alertMgs.order.order.statussChanging.deliver.fr }
            </Text>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", }} >
            <RoundedBtn label={"Livrer"} isOutline={Number(selectedItem?.solde_cal) > 0}  disabled loading={isPending} action={() => handleChangeStatus(false) }  />
            {Number(selectedItem?.solde_cal) > 0 && <RoundedBtn label={"Payer puis livrer"}  disabled loading={isPending} action={() => handleChangeStatus(true) }  />}

            </View>
          </View>
        </BottomSheetCompo>
    </>
  );
};

export default FinishedList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
