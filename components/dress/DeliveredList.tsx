import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { FlashList } from "@shopify/flash-list";
import DressItem from "./DressItem";
import FileSheet from "../takeOrder/FileSheet";
import { Sheet } from "../Sheet";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
// import DressDetail from './DressDetail';
import { generateInvoiceNumber, Rs, SCREEN_H, SIZES } from "@/util/comon";
import { IOrder, TInvoice } from "@/interfaces/type";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useOrderStore } from "@/stores/order";
import { useUserStore } from "@/stores/user";
import { Colors } from "@/constants/Colors";
import usePrint from "@/hooks/usePrint";
import { Platform } from "react-native";
import useInvoice from "@/hooks/useInvoice";

type Props = {};

const DeliveredList = (props: Props) => {
  const sheetRef = useRef<TrueSheet>(null);

    const {setDeliveredOrderLength} = useOrderStore();
    const {user} = useUserStore();
  
  const {handleInvoice} = useInvoice()
  
  const { data, isLoading, error, refetch } = useQuery<IOrder[], Error>({
    queryKey: QueryKeys.orders.delivered,
    queryFn: async (): Promise<IOrder[]> => {
      // Explicit return type
      // console.log("============ QueryKeys.orders.delivered", QueryKeys.orders.delivered)
      const data = {
        Toklo_menId: user?.id,
        status: "DELIVERED",
      };
      try {
        const resp = await axios.post(baseURL+"/orders/by-toklo", data);
        if (resp.data.length > 0) {
          console.log("ààààààààààààààà", resp.data.length);
          setDeliveredOrderLength(resp.data.length)
        }
        return resp.data; 
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); 
      }
    },
  });

  const presentDetailModal = async () => {
    await sheetRef.current?.present();
    // console.log('horray! sheet has been presented 💩')
  };

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
    ({ item, index }: { item: IOrder, index : number }) => (
      <DressItem item={item} type="ORDER" handlePrint={() => handlePrint(item, index)} showDetail={presentDetailModal} />
    ),
    []
  );

  function handlePrint(item: IOrder, index: number) {


    const invoice : TInvoice = {
      storeName: user?.store_name ?? "",
      sotreSlogan: user?.store_slogan ?? "",
      storeAddress: "123 Avenue de la Mode, 75008 Paris",
      storePhone: user?.phone ?? "",
      clientFullName: item?.client_name +" " + item?.client_lastname,
      clientPhone: item?.client_phone,
      invoiceNumber: generateInvoiceNumber(user?.id || 0, item?.updatedat || new Date().toLocaleDateString('fr-FR') ),
      invoiceDate: new Date().toLocaleDateString('fr-FR'),
      staus: "Payée",
      dressName: item?.description?? "",
      quantite: item?.quantite?? "",
      price: Number(item?.amount),
      totalPrice: Number(item?.amount) * Number(item?.quantite),
      paiement: Number(item?.paiement),
      biTotal: Number(item?.amount) * Number(item?.quantite) - Number(item?.paiement),
    }


    handleInvoice(invoice)
  }

  return (
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
            <Text style={{ fontSize: SIZES.md, color: Colors.app.texteLight }}>Pas de commande livrée</Text>
          </View>
        )}
        removeClippedSubviews={true} // Optimisation de performance
        estimatedItemSize={200}
      />

      {/* <Sheet sheet={sheetRef}>
          <ScrollView  style={{height: SCREEN_H * 2, backgroundColor: "red" }} >

          <DressDetail closeSheet={() => sheetRef.current?.dismiss()} />
          </ScrollView>
        </Sheet> */}
    </View>
  );
};

export default DeliveredList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
