import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'
import { Image } from 'react-native'
import { Rs, SCREEN_W, SIZES } from '@/util/comon'
import ItemChild from './ItemChild';
import { Square3Stack3DIcon, BanknotesIcon, MinusCircleIcon, Bars2Icon, UserCircleIcon, PhoneIcon, ShoppingCartIcon, CalendarDaysIcon, CalendarIcon, UserIcon } from "react-native-heroicons/solid";
import Separator from '../Separator'
import CustomButton from '../form/CustomButton'
import RoundedBtn from '../form/RoundedBtn'
import BackButton from '../form/BackButton'
import { DisplayMeasure } from './DisplayMeasure'


type Props = {
 closeSheet: () => void
}

function Card (){
 return (
  <View style={styles.card}>
    <Text style={styles.dressType} > Maticap  </Text>

    <View style={{marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", }} >

    <ItemChild label='Dress number: 3' icon={<Square3Stack3DIcon fill={Colors.app.primary} size={Rs(18)} />} />
    <ItemChild label='Price: 120€' icon={<BanknotesIcon fill={Colors.app.primary} size={Rs(18)} />} />
    </View>

    <View style={{marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", }} >
             
             <ItemChild label='Avance: 120€' icon={<MinusCircleIcon fill={Colors.app.primary} size={Rs(18)} />} />
             <ItemChild label='Rest: 0€' icon={<Bars2Icon fill={Colors.app.primary} size={Rs(18)} />} />

    </View>
   

    <Separator />
    
    <Text style={styles.dressType} > user informations  </Text>

    <View style={[{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}]} >
          
             <ItemChild label='Omar Adje' icon={<UserIcon fill={Colors.app.primary} size={20} />} />
             <ItemChild label='01 42 25 89 09' icon={<PhoneIcon fill={Colors.app.primary} size={18} />} />
          
       </View>
 </View>
 )
}


function MeasureCard (){
 return (
  <View style={[styles.card, {boxShadow:"none", padding: 0}]}>
    <Text style={styles.dressType} > Measures  </Text>

    <View style={{flexDirection: "row", flexWrap: "wrap", gap: 10}} >
     {[1,2,3,4,5,6, 7,8,9,10,11,12].map(() => <DisplayMeasure value='12' title='Hips' />)}
      
    </View>
    

    
 </View>
 )
}


function DetailHeader (){
 return (
  <View style={{}}>
   <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
   <Image style={{width: SCREEN_W, height: 200}} source={{uri: "https://media.istockphoto.com/id/178851955/fr/photo/flowery-evase-bateau-robe-jaune.jpg?s=612x612&w=0&k=20&c=m1b0bibVmSmSio6uaht1KGUfo1AeQQ5jTmh7Z98E6s4="}}  />
   <Image style={{width: SCREEN_W, height: 200}} source={{uri: "https://t3.ftcdn.net/jpg/00/96/74/82/360_F_96748234_L1OpQlE8LQJmmjGpeQZvcOVOkhxCPzCa.jpg"}}  />
   
   </ScrollView>
 </View>
 )
}


const DressDetail = ({closeSheet}: Props) => {
  return (
    <View style={styles.container}>
      <DetailHeader />
      <Card />
      <MeasureCard />

      <View style={{paddingHorizontal: 20, marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 20}} >
        <BackButton backAction={closeSheet } />
         <View style={{flex: 1}} >

           <RoundedBtn label='Deliver' disabled  />
         </View>
      </View>
    </View>
  )
}

export default DressDetail

const styles = StyleSheet.create({
 container: {
   flex: 1,
   
 },
 card:{
   padding: 20,
   minHeight: 200,
   boxShadow: Colors.shadow.card,
   margin: 20,
   borderRadius: 10
 },
 dressType:{
  fontWeight: "700",
  color: Colors.app.texte,
  fontSize: SIZES.sm,
  marginBottom: 20
 },
})