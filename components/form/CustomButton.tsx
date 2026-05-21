import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Animated from 'react-native-reanimated'
import { Colors } from '@/constants/Colors'
import { SIZES } from '@/util/comon'
import { ActivityIndicator } from 'react-native'

type Props = {
 label: string
 action?: () => void,
 disabled?: boolean,
 loading?: boolean
}

const AnimatedButton = Animated.createAnimatedComponent(Pressable)

const CustomButton = ({label, action, disabled, loading}:Props) => {
  
  return (
   <AnimatedButton onPress={loading? () => {} : action} disabled={loading? true : false} style={[styles.button, {backgroundColor: !disabled? Colors.app.disabled : Colors.app.primary}]} >
    <Image style={[styles.africanTouchSheet, {left: -20, top: -100}]} source={require("@/assets/images/measure/down-sheet.png")} />
    
    {!loading? <Text style={styles.label} > {label} </Text> :
     <ActivityIndicator size="small" color='#ffffff' />
     }
    <Image style={styles.africanTouchSheet} source={require("@/assets/images/measure/top-sheet.png")} />
     
   </AnimatedButton>
  )
}

export default CustomButton

const styles = StyleSheet.create({
 button:{
   backgroundColor: Colors.app.primary,
   borderRadius: 10,
   height: 50,
   justifyContent: 'center',
   alignItems: 'center',
   boxShadow: Colors.shadow.card,
   position: "relative",
   overflow: "hidden"
 },
 africanTouchSheet: {
    height: 150, 
    width: 150,
    position: "absolute",
    right: -30,
    top: -10
  },
 label:{
   color: '#ffffff',
   fontSize: SIZES.sm,
   textAlign: 'center',
 }
})