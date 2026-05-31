import { Colors } from '@/constants/Colors'
import { SIZES } from '@/util/comon'
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

type Props = {
  title: string;
  subtitle: string;
  isLogo?: boolean
 
}

const FormBanner = ({isLogo }: Props) => {
  
  
  return (
    <View>
     <View style={{alignItems: 'center' , marginBottom: 0}}>
{	isLogo &&
<Image source={require('@/assets/logos/toklo.jpg')} style={styles.logo} />
}     
     </View>
    </View>
  )
}

export default FormBanner

const styles = StyleSheet.create({
 logo: {
   width: 160,
   height: 160,
 },
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
