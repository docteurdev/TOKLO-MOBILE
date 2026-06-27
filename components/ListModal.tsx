import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import { Rs, SIZES } from "@/util/comon";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MagnifyingGlassIcon, XMarkIcon } from "react-native-heroicons/solid";
import OtherInput from "./form/OtherInput";


type Props = {
 isShowModal: boolean;
 children: React.ReactNode;
 closeModal: () => void
};

const ListModal = ({isShowModal, children, closeModal}: Props) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal style={{flex: 1}}  presentationStyle="pageSheet" transparent visible={isShowModal}>
      <View style={styles.modalContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>

            <OtherInput icon={<MagnifyingGlassIcon color={theme.primary} />} placeholder="Nom du client" value="John" setValue={() => {}} />
          </View>
         <TouchableOpacity onPress={() => closeModal()} style={styles.closeButton} >

           <XMarkIcon fill={theme.primary} size={27} />
         </TouchableOpacity>
         
        </View>
        <View style={styles.listDisplay}>

          <View style={styles.listHeader}>
            
            <Text style={styles.listTitle}>Liste des clients</Text>
            <Text style={styles.listCount}> 23</Text>
          </View>
          {children}

        </View>
      </View>
    </Modal>
  );
};

export default ListModal;

const createStyles = (theme: AppTheme) => StyleSheet.create({
  modalContainer: {
   flex: 1,
   backgroundColor: theme.background === "#FFFDF8" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.72)",
   padding: Rs(20),
   
  },
  searchRow: {
    alignItems: "center",
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 6,
    height: Rs(50),
    justifyContent: "space-between",
    width: "100%",
  },
  searchInputWrap: {
    flex: 1,
    marginTop: Rs(7),
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: Rs(4),
    borderWidth: StyleSheet.hairlineWidth,
    height: 50,
    justifyContent: "center",
    width: 40,
  },
  listDisplay: {
   backgroundColor: theme.card,
   borderColor: theme.border,
   borderWidth: StyleSheet.hairlineWidth,
   width: "100%",
   height: "50%",
   borderRadius: 8,
   marginTop: Rs(20),
   padding: Rs(10),
   
  //  padding: Rs(20),
  },
  listHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
  },
  listTitle:{
    color: theme.text,
    fontSize: SIZES.sm,
    fontWeight: "bold",
  },
  listCount: {
    color: theme.muted,
    fontSize: SIZES.xs,
    fontWeight: "bold",
  }
});
