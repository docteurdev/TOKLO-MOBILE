import useChangeOrderStatus from "@/hooks/mutations/useChangeOrderStatus";
import usePayOrderSold from "@/hooks/mutations/usePayOrderSold";
import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
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
import RoundedSmBtn from "../form/RoundedSmBtn";
import DressItem from "./DressItem";

const FinishedList = () => {
    const {setFinishedOrderLength} = useOrderStore()
  
   const {user} = useUserStore()
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const { data, isLoading, refetch } = useQuery<IOrder[], Error>({
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
  const remainingBalance = Number(selectedItem?.solde_cal ?? 0);
  const hasRemainingBalance = remainingBalance > 0;
  
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

  const presentDeliverModal = useCallback((item: IOrder) => {
    setSelectedItem(item);
    requestAnimationFrame(() => {
      bottomSheetModalRef.current?.present();
    });
  }, []);

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: IOrder) => item.id.toString(), []);

  // Memoize renderItem
  const renderItem = useCallback(
    ({ item }: { item: IOrder }) => (
      <DressItem item={item} type="ORDER" showDetail={presentDetailModal} handleChangeStatus={() => {
        presentDeliverModal(item);
      }} />
    ),
    [presentDeliverModal]
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
                  <View style={styles.emptyWrap} >
                    <Text style={styles.emptyText}>Pas de commande terminée</Text>
                  </View>
                )}
        removeClippedSubviews={true} // Optimisation de performance
      />

    </View>

    <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[hasRemainingBalance ? Rs(220) : Rs(190)]} >
          <View style={styles.sheetContent} >
            <Text style={styles.sheetMessage}> 
              {hasRemainingBalance ? <Text>Il reste un solde de <Text style={styles.remainingBalance} >{formatXOF(remainingBalance)}</Text> à régler pour ce vêtement. 💰</Text> :  alertMgs.order.order.statussChanging.deliver.fr }
            </Text>
            <View style={styles.sheetActions} >
               <RoundedSmBtn
                label="Livrer"
                isOutline={hasRemainingBalance}
                disabled={isPayOrderSoldPending}
                loading={isPending}
                action={() => handleChangeStatus(false)}
               />
               {hasRemainingBalance && (
                <RoundedSmBtn
                  label="Payer puis livrer"
                  disabled={isPending}
                  loading={isPayOrderSoldPending}
                  action={() => handleChangeStatus(true)}
                />
               )}
            </View>
          </View>
        </BottomSheetCompo>
    </>
  );
};

export default FinishedList;

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    flex: 1,
    paddingTop: 20,
  },
  sheetContent: {
    backgroundColor: theme.card,
    minHeight: Rs(150),
    justifyContent: "center",
    alignItems: "center",
    gap: Rs(20),
    paddingHorizontal: Rs(20),
    paddingVertical: Rs(16),
  },
  sheetMessage: {
    color: theme.muted,
    fontSize: SIZES.sm,
    lineHeight: Rs(20),
    textAlign: "center",
  },
  remainingBalance: {
    color: theme.danger,
    fontWeight: "800",
  },
  sheetActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Rs(12),
    justifyContent: "center",
  },
  emptyWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginTop: Rs(100),
  },
  emptyText: {
    color: theme.muted,
    fontSize: SIZES.md,
  },
});
