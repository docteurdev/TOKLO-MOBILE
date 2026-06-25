import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import useChangeOrderStatus from "@/hooks/mutations/useChangeOrderStatus";
import { QueryKeys } from "@/interfaces/queries-key";
import { EDressStatus, IOrder } from "@/interfaces/type";
import { useOrderStore } from "@/stores/order";
import { useUserStore } from "@/stores/user";
import { alertMgs } from "@/util/appText";
import { baseURL } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomSheetCompo from "../BottomSheetCompo";
import RoundedBtn from "../form/RoundedBtn";
import DressItem from "./DressItem";

const OngoingList = () => {
  const {setOngoingOrderLength} = useOrderStore()
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [selectedItem, setSelectedItem] = useState<{ id: number; status: EDressStatus } | null>(null)

  const {user} = useUserStore()
  
  const { data, isLoading, refetch } = useQuery<IOrder[], Error>({
    queryKey: QueryKeys.orders.onGoing,
    queryFn: async (): Promise<IOrder[]> => {
      
      const data = {
        Toklo_menId: user?.id,
        status: "ONGOING",
      };
      try {
        const resp = await axios.post(baseURL+"/orders/by-toklo", data);
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

  const  {mutate, isPending} = useChangeOrderStatus(() => {}, EDressStatus.ONGOING );

  const presentDetailModal = async () => {
    // console.log('horray! sheet has been presented 💩')
  };

  function handleChangeStatus() {
      if (!selectedItem) return;
    
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
                 <View style={styles.emptyWrap} >
                   <Text style={styles.emptyText}>Pas de commande en cours</Text>
                 </View>
          )}
        removeClippedSubviews={true} // Optimisation de performance
      />

    </View>
      <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(220)]} >
          <View style={styles.sheetContent} >
             <Text style={styles.sheetMessage}> 
              { alertMgs.order.order.statussChanging.finish.fr }
            </Text>
            
            <RoundedBtn  label={"Terminer"}  disabled loading={isPending} action={() => handleChangeStatus() }  />
          </View>
        </BottomSheetCompo>
    </>
  );
};

export default OngoingList;

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    flex: 1,
    paddingTop: 20,
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
  sheetContent: {
    alignItems: "center",
    backgroundColor: theme.card,
    gap: Rs(20),
    height: Rs(150),
    justifyContent: "center",
    paddingHorizontal: Rs(20),
  },
  sheetMessage: {
    color: theme.muted,
    fontSize: SIZES.sm,
    lineHeight: Rs(20),
    textAlign: "center",
  },
});
