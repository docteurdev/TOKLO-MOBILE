import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { MagnifyingGlassIcon, XMarkIcon  } from "react-native-heroicons/solid";
import { Colors } from "@/constants/Colors";
import { Rs, size, SIZES } from "@/util/comon";
import OtherInput from "./form/OtherInput";


type Props = {
 isShowModal: boolean;
 children: React.ReactNode;
 closeModal: () => void
};

const ListModal = ({isShowModal, children, closeModal}: Props) => {
  return (
    <Modal style={{flex: 1}}  presentationStyle="pageSheet" transparent visible={isShowModal}>
      <View style={styles.modalContainer}>
        <View style={[styles.listDisplay, {height: Rs(50), flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "transparent", gap: 6}]}>
          <View style={{flex: 1, marginTop: Rs(7), }}>

            <OtherInput icon={<MagnifyingGlassIcon color={Colors.app.primary} />} placeholder="Nom du client" value="John" onChangeText={() => {}} />
          </View>
         <TouchableOpacity onPress={() => closeModal()} style={{width: 40, height: 50, backgroundColor: "white", justifyContent: "center", alignItems: "center", borderRadius: Rs(4), }} >

           <XMarkIcon fill={Colors.app.primary} size={27} />
         </TouchableOpacity>
         
        </View>
        <View style={[styles.listDisplay, {marginTop: Rs(20),  padding: Rs(10)}]}>

          <View style={{flexDirection: "row", alignItems: "center", gap: 20}}>
            
            <Text style={[styles.listTitle, ]} >Liste des clients</Text>
            <Text style={[styles.listTitle, {fontSize: SIZES.xs}]} > 23</Text>
          </View>
          {children}

        </View>
      </View>
    </Modal>
  );
};

export default ListModal;

const styles = StyleSheet.create({
  modalContainer: {
   flex: 1,
   backgroundColor: "rgba(0,0,0,0.5)",
   padding: Rs(20),
   
  },
  listDisplay: {
   backgroundColor: "white",
   width: "100%",
   height: "50%",
   borderRadius: 8,
   
  //  padding: Rs(20),
  },
  listTitle:{
    fontSize: SIZES.sm,
    fontWeight: "bold",
  }
});
