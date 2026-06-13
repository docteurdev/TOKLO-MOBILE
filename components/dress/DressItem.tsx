import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BanknotesIcon, CalendarDaysIcon, CalendarIcon, MinusCircleIcon, PhoneIcon, Square3Stack3DIcon, UserIcon } from "react-native-heroicons/solid";


import { Colors } from '@/constants/Colors';
import { EDressStatus, IOrder } from '@/interfaces/type';
import { base } from '@/util/axios';
import { formatXOF, Rs, SIZES } from '@/util/comon';
import { useRouter } from 'expo-router';
import DressStatus from './DressStatus';
import ItemChild from './ItemChild';

type Props = {
  type?: "USER" | "ORDER";
  showDetail?: () => void;
  item: IOrder;
  handleChangeStatus?: () => void;
  handlePrint?: () => void;
}

const normalizeDressStatus = (status: IOrder["status"] | EDressStatus | string) => {
  if (typeof status === "string") {
    return status as EDressStatus;
  }

  return status.status;
};

const DressItem = ({type, item, handleChangeStatus, handlePrint}: Props) => {

  const { id, description, status, quantite, amount, paiement, date_depote, date_remise, client_lastname, client_name, client_phone } = item

  const normalizedStatus = normalizeDressStatus(status);
  
  
  const route = useRouter()

  return (
    <View>
     <View style={styles.item} >
      <Image style={styles.africanTouch} source={require("@/assets/images/measure/tradition.png")} />
      <Image style={styles.africanTouchSheet} source={require("@/assets/images/measure/top-sheet.png")} />
      {/* top */}
      <View style={[styles.topItem, {gap: 10}]} >

        {item?.tissus && <Image source={{uri: base +'uploads/'+ item?.tissus}} style={styles.imgBox} />}
       {/* <View style={styles.imgBox} >

       </View> */}
       <View style={styles.dressInfo} >
          <Text style={styles.dressType}> {description} </Text>
          <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}} >
             <ItemChild label={quantite} icon={<Square3Stack3DIcon fill={Colors.app.primary} size={Rs(23)} />} />
             {/* <ItemChild label='Pattern 2' icon={<ShieldCheckIcon fill={Colors.app.primary} size={18}/>} /> */}
            <DressStatus status={normalizedStatus} />
          </View>
       </View>
      
      </View>
      <View style={styles.topItem} >
       
       <View style={[styles.dressInfo, {gap: 10, flexDirection: "row", justifyContent: "space-between"}]} >
          {/* <Text style={styles.dressType}> Dress type </Text> */}
             <ItemChild label={`Prix: ${formatXOF(Number(amount))}`} icon={<BanknotesIcon fill={Colors.app.primary} size={Rs(23)} />} />
             <ItemChild label={`Avance: ${formatXOF(Number(paiement))}`} icon={<MinusCircleIcon fill={Colors.app.primary} size={Rs(23)} />} />
             {/* <ItemChild label='Rest: 0€' icon={<Bars2Icon fill={Colors.app.primary} size={18} />} /> */}
          
       </View>
      </View>
     {type === "ORDER" && <View style={styles.topItem} >
       
       <View style={[styles.dressInfo, {flexDirection: "row", alignItems: "center", justifyContent: "space-between"}]} >
          
             <ItemChild label={`${client_lastname} ${client_name}`} icon={<UserIcon fill={Colors.app.primary} size={Rs(23)} />} />
             <ItemChild label={client_phone} icon={<PhoneIcon fill={Colors.app.primary} size={Rs(18)} />} />
          
       </View>
       
      </View>}

      <View style={styles.topItem} >
       
       <View style={[styles.dressInfo, {gap: 10}]} >
          
       <ItemChild label={`Date d'enregistrement: ${date_depote}`} icon={<CalendarDaysIcon fill={Colors.app.primary} size={Rs(23)} />} />
       <ItemChild label={`Date de livraison: ${date_remise}`} icon={<CalendarIcon fill={Colors.app.primary} size={Rs(23)} />} />
          
       </View>
       
      </View>

      

      
      {/* bottom */}
      <View style={styles.bottomItem}>
        <TouchableOpacity style={styles.bottomBtn} onPress={() => route.push({pathname: "/OrderDetail", params: {id}}) } >
        <Text style={styles.bottomBtnText} > Voir les détails </Text>
        </TouchableOpacity>
        <View style={{width: 1, height: "100%", backgroundColor: Colors.app.disabled}}  />
       {normalizedStatus !== EDressStatus.DELIVERED &&
        <TouchableOpacity onPress={handleChangeStatus} style={styles.bottomBtn} >
            <Text style={[styles.bottomBtnText, {fontWeight: "bold", color: normalizedStatus === EDressStatus.ONGOING ? Colors.app.available.unav_txt: normalizedStatus === EDressStatus.FINISHED? Colors.app.dashitem.t_2 : Colors.app.available.av_txt}]} > {normalizedStatus === EDressStatus.ONGOING ? "Terminer " : "Livrer"} </Text>
        </TouchableOpacity>
        }

      {normalizedStatus === EDressStatus.DELIVERED &&
        <TouchableOpacity onPress={handlePrint} style={styles.bottomBtn} >
            <Text style={[styles.bottomBtnText, {fontWeight: "bold", color: Colors.app.texteLight}]} > Géner la facture </Text>
        </TouchableOpacity>
        }

      </View>
     </View>
    </View>
  )
}

export default DressItem

const styles = StyleSheet.create({
  item:{
    height: "auto",
    width: "100%",
    // boxShadow: Colors.shadow.card,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth, 
    borderColor: Colors.app.disabled,
    marginBottom: Rs(10),
    position: "relative"
  },
  africanTouch: {
    height: 400, 
    width: 60,
    position: "absolute",
    left: -50
  },
  africanTouchSheet: {
    height: 150, 
    width: 150,
    position: "absolute",
    right: -30,
    top: -10
  },
  imgBox:{
    width: Rs(80),
    height: Rs(80),
    borderRadius: Rs(10),
    overflow: "hidden"
  },
  dressInfo:{
    flex: 1,
    // flexDirection: "row"
    
  },
  topItem:{
    flexDirection: "row",
    alignItems: "center", 
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.app.disabled,
    paddingVertical: 10,
    paddingHorizontal: 18,
    // height: 150
    
  },

  dressType:{
    fontWeight: "700",
    color: Colors.app.texte,
    fontSize: SIZES.sm
   },
  bottomItem:{
   flexDirection: "row",
   height: 50
  },
  bottomBtn:{
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.app.secondary,
   
  },
  bottomBtnText:{
    fontSize: SIZES.sm,
    color: Colors.app.primary
  }
})
