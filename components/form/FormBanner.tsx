import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {Feather} from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { SIZES } from '@/util/comon'

type Props = {
  title: string;
  subtitle: string;
 
}

const FormBanner = ({ title, subtitle }: Props) => {
  return (
    <View>
     <View style={{alignItems: 'center' , marginBottom: 0}}>
      {/* <Feather name='lock' size={100} color={Colors.app.primary} /> */}
      <Image source={require('@/assets/logos/toklo.jpg')} style={{width: 200, height: 200}} />
      {/* <View style={{marginVertical: 20,}} >

       <Text style={styles.title} > {title} </Text>
       <Text style={styles.subtitle} > {subtitle} </Text>
      </View> */}
     </View>
    </View>
  )
}

export default FormBanner

const styles = StyleSheet.create({
 title:{
   fontSize: SIZES.xl,
   color: Colors.app.black,
   
   fontWeight: 'bold',
   textAlign: "center",
 },
 subtitle:{
  fontSize: SIZES.sm,
  marginTop: 5,
  color: Colors.app.texteLight,
  textAlign: "center",
 }
})