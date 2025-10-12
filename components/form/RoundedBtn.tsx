import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Animated from 'react-native-reanimated'
import { Colors } from '@/constants/Colors'
import { Rs, SIZES } from '@/util/comon'
import { ActivityIndicator } from 'react-native'

type Props = {
 label: string
 action?: () => void
 disabled?: boolean
 loading?: boolean
 isOutline?: boolean
}

const AnimatedButton = Animated.createAnimatedComponent(Pressable)

const RoundedBtn = ({label, action, disabled, loading, isOutline}:Props) => {
  return (
   <AnimatedButton onPress={loading? () => {} : action} disabled={loading? true : false} style={[styles.button, {backgroundColor: isOutline? 'white' : !disabled? Colors.app.disabled : Colors.app.primary}]} >
    {!loading? <Text style={[styles.label, {color: isOutline? Colors.app.primary: 'white'}]} > {label} </Text> :
     <ActivityIndicator size="small" color='#ffffff' />}
   </AnimatedButton>
  )
}

export default RoundedBtn

const styles = StyleSheet.create({
 button:{
   backgroundColor: Colors.app.primary,
   borderRadius: Rs(50),
   height: Rs(50),
   justifyContent: 'center',
   alignItems: 'center',
   boxShadow: Colors.shadow.card,
   paddingHorizontal: Rs(20),
  //  width: "100%"
 },
 label:{
   color: '#ffffff',
   fontSize: SIZES.sm,
   textAlign: 'center',
 }
})