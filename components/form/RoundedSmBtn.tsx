import { Colors } from '@/constants/Colors'
import { Rs, SIZES } from '@/util/comon'
import React from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text } from 'react-native'
import Animated from 'react-native-reanimated'

type Props = {
 label: string
 action?: () => void
 disabled?: boolean
 loading?: boolean
 isOutline?: boolean
}

const AnimatedButton = Animated.createAnimatedComponent(Pressable)

const RoundedSmBtn = ({label, action, disabled, loading, isOutline}:Props) => {
  const isDisabled = Boolean(disabled || loading)

  return (
   <AnimatedButton
    onPress={isDisabled ? undefined : action}
    disabled={isDisabled}
    style={[
      styles.button,
      isOutline ? styles.outlineButton : styles.filledButton,
      disabled && !isOutline ? styles.disabledButton : null,
    ]}
   >
    {/* <Image style={[styles.africanTouchSheet, {left: -20, top: -90}]} source={require("@/assets/images/measure/down-sheet.png")} /> */}

    {!loading? <Text style={[styles.label, {color: isOutline? Colors.app.primary: 'white'}]} >{label}</Text> :
     <ActivityIndicator size="small" color='#ffffff' />}
      <Image style={styles.africanTouchSheet} source={require("@/assets/images/measure/top-sheet.png")} />
     
   </AnimatedButton>
  )
}

export default RoundedSmBtn

const styles = StyleSheet.create({
 button:{
   borderRadius: Rs(50),
   height: Rs(50),
   justifyContent: 'center',
   alignItems: 'center',
   boxShadow: Colors.shadow.card,
   paddingHorizontal: Rs(20),
   position: "relative",
   overflow: "hidden",
   alignSelf: "flex-start",
 },
 filledButton: {
   backgroundColor: Colors.app.primary,
 },
 outlineButton: {
   backgroundColor: "white",
   borderColor: Colors.app.primary,
   borderWidth: 1,
 },
 disabledButton: {
   backgroundColor: Colors.app.disabled,
 },
 label:{
   color: '#ffffff',
   fontSize: SIZES.sm,
   textAlign: 'center',
 },
  africanTouchSheet: {
    height: 150, 
    width: 150,
    position: "absolute",
    right: -70,
    top: -2
  }
})
