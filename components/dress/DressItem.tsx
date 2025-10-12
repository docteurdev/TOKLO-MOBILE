import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Square3Stack3DIcon, BanknotesIcon, MinusCircleIcon, Bars2Icon, UserCircleIcon, PhoneIcon, ShoppingCartIcon, CalendarDaysIcon, CalendarIcon, UserIcon } from "react-native-heroicons/solid";


import { Colors } from '@/constants/Colors'
import { formatXOF, Rs, SIZES } from '@/util/comon'
import DressStatus from './DressStatus'
import ItemChild from './ItemChild';
import { useRouter } from 'expo-router';
import { EDressStatus, IOrder } from '@/interfaces/type';
import { Image } from 'react-native';
import { base, baseURL } from '@/util/axios';

type Props = {
  type?: "USER" | "ORDER";
  showDetail: () => void;
  item: IOrder;
  handleChangeStatus?: () => void;
  handlePrint?: () => void;
}


const DressItem = ({type, showDetail, item, handleChangeStatus, handlePrint}: Props) => {

  const { id, description, status, quantite, amount, paiement, date_depote, date_remise, client_Id, client_lastname, client_name, client_phone } = item

  
  
  const route = useRouter()

  return (
    <View>
     <View style={styles.item} >
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
            <DressStatus status={status} />
          </View>
       </View>
      
      </View>
      <View style={styles.topItem} >
       
       <View style={[styles.dressInfo, {gap: 10}]} >
          {/* <Text style={styles.dressType}> Dress type </Text> */}
             <ItemChild label={`Prix: ${formatXOF(Number(amount) * Number(quantite))}`} icon={<BanknotesIcon fill={Colors.app.primary} size={Rs(23)} />} />
             <ItemChild label={`Avance: ${formatXOF(Number(paiement))}`} icon={<MinusCircleIcon fill={Colors.app.primary} size={Rs(23)} />} />
             {/* <ItemChild label='Rest: 0€' icon={<Bars2Icon fill={Colors.app.primary} size={18} />} /> */}
          
       </View>
      </View>
     {type == "ORDER" && <View style={styles.topItem} >
       
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
       {status !== EDressStatus.DELIVERED &&
        <TouchableOpacity onPress={handleChangeStatus} style={styles.bottomBtn} >
            <Text style={[styles.bottomBtnText, {fontWeight: "bold", color: status == EDressStatus.ONGOING ? Colors.app.available.unav_txt: status == EDressStatus.FINISHED? Colors.app.dashitem.t_2 : Colors.app.available.av_txt}]} > {status == EDressStatus.ONGOING ? "Terminer " : "Livrer"} </Text>
        </TouchableOpacity>
        }

      {status === EDressStatus.DELIVERED &&
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
    marginBottom: Rs(10)
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