import { Pressable, StyleSheet, Text, View } from 'react-native'
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
    {!loading? <Text style={styles.label} > {label} </Text> :
     <ActivityIndicator size="small" color='#ffffff' />
     }
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
   boxShadow: Colors.shadow.card
 },
 label:{
   color: '#ffffff',
   fontSize: SIZES.sm,
   textAlign: 'center',
 }
})