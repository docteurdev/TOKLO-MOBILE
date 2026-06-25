import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import { IDress } from "@/interfaces/type";
import { baseURL } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { XMarkIcon } from "react-native-heroicons/solid";
import { SafeAreaView } from "react-native-safe-area-context";
import DressItem from "./DressItem";


type Props = {
 isShowModal: boolean;
 // children: React.ReactNode;
 closeModal: () => void;
 setSelectedDress: (dress: IDress) => void;
};

const DressType = ({isShowModal, closeModal, setSelectedDress}: Props) => {

 const theme = useAppTheme();
 const styles = React.useMemo(() => createStyles(theme), [theme]);
 const [filterVal] = useState('')
 
 const { data, isLoading, error, refetch } = useQuery<IDress[], Error>({
  queryKey: ['toklo-men_dress_type_v2'],
  queryFn: async (): Promise<IDress[]> => {  // Explicit return type
    try {
      const resp = await axios.get(baseURL+"/clothing/clothing-categories");
      // console.log(resp.data)
      return resp.data; // Ensure `resp.data` is returned
    } catch {
      try {
        const fallbackResp = await axios.get(baseURL+"/clothing-categories");
        return fallbackResp.data;
      } catch (fallbackError) {
        console.error(fallbackError);
        throw new Error("Impossible de récupérer les types de vêtements");
      }
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
const keyExtractor = useCallback((item: IDress) =>
  item.id.toString(),
[]);

// Memoize renderItem
const renderItem = useCallback(({ item }: { item: IDress }) => (
  <DressItem dress={item} action={() => setSelectedDress(item)}  />
), [setSelectedDress]);

// Memoize EmptyComponent
const ListEmptyComponent = useCallback(
  () => <Text style={styles.emptyText}>{error ? error.message : "Aucun type de vêtement configuré"}</Text>,
  [error, styles.emptyText],
);

  return (
    <Modal style={{flex: 1}}  presentationStyle="pageSheet" transparent visible={isShowModal}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.closeRow}>
          
         <TouchableOpacity onPress={() => closeModal()} style={styles.closeButton} >

           <XMarkIcon fill={theme.primary} size={27} />
         </TouchableOpacity>
         
        </View>
        <View style={styles.listDisplay}>

            <Text style={styles.listTitle}>Type de vêtements</Text>
         
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
         />

        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default DressType;

const createStyles = (theme: AppTheme) => StyleSheet.create({
  modalContainer: {
   flex: 1,
   backgroundColor: theme.background === "#FFFDF8" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.72)",
   padding: Rs(20),
   
  },
  closeRow: {
    alignItems: "center",
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 6,
    height: Rs(50),
    justifyContent: "flex-end",
    width: "100%",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: Rs(4),
    borderWidth: StyleSheet.hairlineWidth,
    height: Rs(40),
    justifyContent: "center",
    width: 40,
  },
  listDisplay: {
   backgroundColor: theme.card,
   borderColor: theme.border,
   borderWidth: StyleSheet.hairlineWidth,
   width: "100%",
   height: "80%",
   borderRadius: 8,
   marginTop: Rs(20),
   padding: Rs(10),
   
  //  padding: Rs(20),
  },
  listTitle:{
    color: theme.text,
    fontSize: SIZES.sm,
    fontWeight: "bold",
    marginVertical: Rs(10),
    textAlign: "left",
  },
  emptyText: {
    color: theme.muted,
    fontSize: SIZES.sm,
    paddingVertical: Rs(16),
    textAlign: "center",
  }
});
