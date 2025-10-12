import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon  } from "react-native-heroicons/solid";
import { Colors } from "@/constants/Colors";
import { Rs, size, SIZES } from "@/util/comon";
import OtherInput from "../form/OtherInput";
import { FlashList } from "@shopify/flash-list";
import UserItem from "../user/UserItem";
import { IUser } from "@/interfaces/user";
import { IClient, IDress } from "@/interfaces/type";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DressItem from "./DressItem";
import { baseURL } from "@/util/axios";


type Props = {
 isShowModal: boolean;
 // children: React.ReactNode;
 closeModal: () => void;
 setSelectedDress: (dress: IDress) => void;
};

const DressType = ({isShowModal, closeModal, setSelectedDress}: Props) => {

 const [filterVal, setFilterVal] = useState('')
 
 const { data, isLoading, error, refetch } = useQuery<IDress[], Error>({
  queryKey: ['toklo-men_dress_type'],
  queryFn: async (): Promise<IDress[]> => {  // Explicit return type
    try {
      const resp = await axios.get(baseURL+"/clothing/clothing-categories");
      // console.log(resp.data)
      return resp.data; // Ensure `resp.data` is returned
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
    }
  },
});


 const dataFiltered = useMemo(() => {
  return data?.filter(item => {
    const searchTerm = filterVal?.toLowerCase();
    return (
      item.nom?.toLowerCase().includes(searchTerm) 
    )
  });
}, [data, filterVal]); // Only recalculate when data or filterVal changes

// Memoize keyExtractor
const keyExtractor = useCallback((item: IClient) => 
  item.id.toString(),
[]);

// Memoize renderItem
const renderItem = useCallback(({ item }: { item: IDress }) => (
  <DressItem dress={item} action={() => setSelectedDress(item)}  />
), []);

// Memoize EmptyComponent
const ListEmptyComponent = useCallback(() => <Text>Pas de client enregistrés</Text>,
[]);

  return (
    <Modal style={{flex: 1}}  presentationStyle="pageSheet" transparent visible={isShowModal}>
      <View style={styles.modalContainer}>
        <View style={[styles.listDisplay, {height: Rs(50), flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "transparent", gap: 6}]}>
          <View style={{flex: 1, }}>

            <OtherInput icon={<MagnifyingGlassIcon color={Colors.app.primary} />} placeholder="Rechercher un vêtement" value={filterVal} setValue={setFilterVal}  />
          </View>
         <TouchableOpacity onPress={() => closeModal()} style={{width: 40, height: Rs(40), backgroundColor: "white", justifyContent: "center", alignItems: "center", borderRadius: Rs(4), }} >

           <XMarkIcon fill={Colors.app.primary} size={27} />
         </TouchableOpacity>
         
        </View>
        <View style={[styles.listDisplay, {marginTop: Rs(20),  padding: Rs(10)}]}>

          <View style={{flexDirection: "row", alignItems: "center", gap: 20}}>
            
            <Text style={[styles.listTitle, ]} >Type de vêtements</Text>
            <Text style={[styles.listTitle, {fontSize: SIZES.xs}]} > {dataFiltered?.length} </Text>
          </View>
         
          <FlashList
           data={dataFiltered}
           keyExtractor={keyExtractor}
           renderItem={renderItem}
          
           showsVerticalScrollIndicator={false}
           keyboardShouldPersistTaps="handled"
           onRefresh={refetch}
           refreshing={isLoading}
           ListEmptyComponent={ListEmptyComponent}
           removeClippedSubviews={true} // Optimisation de performance
           estimatedItemSize={200}
         />

        </View>
      </View>
    </Modal>
  );
};

export default DressType;

const styles = StyleSheet.create({
  modalContainer: {
   flex: 1,
   backgroundColor: "rgba(0,0,0,0.5)",
   padding: Rs(20),
   
  },
  listDisplay: {
   backgroundColor: "white",
   width: "100%",
   height: "80%",
   borderRadius: 8,
   
  //  padding: Rs(20),
  },
  listTitle:{
    fontSize: SIZES.sm,
    fontWeight: "bold",
  }
});
