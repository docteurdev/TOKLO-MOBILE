import { Colors } from '@/constants/Colors'
import { SIZES } from '@/util/comon'
import React from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text } from 'react-native'
import Animated from 'react-native-reanimated'

type Props = {
 label: string
 action?: () => void,
 disabled?: boolean,
 pressDisabled?: boolean,
 loading?: boolean
}

const AnimatedButton = Animated.createAnimatedComponent(Pressable)

const CustomButton = ({label, action, disabled, pressDisabled, loading}:Props) => {
  const isPressDisabled = Boolean(loading || pressDisabled);
  
  return (
   <AnimatedButton onPress={isPressDisabled ? undefined : action} disabled={isPressDisabled} style={[styles.button, {backgroundColor: !disabled? '#A9C2B5' : Colors.app.primary}]} >
    <Image style={[styles.africanTouchSheet, {left: -50, top: -90}]} source={require("@/assets/images/measure/down-sheet.png")} />
    
    {!loading? <Text style={[styles.label, {color:"#F8FAF9"}]} > {label} </Text> :
     <ActivityIndicator size="small" color='#ffffff' />
     }
    <Image style={[styles.africanTouchSheet, {top: -5, right: -50}]} source={require("@/assets/images/measure/top-sheet.png")} />
     
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
