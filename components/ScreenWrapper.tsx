import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Animated, { FadeInDown, FadeInUp, ZoomIn, ZoomOut } from "react-native-reanimated"

type Props = {
  children: React.ReactNode,
  isPadding?: boolean
}

const ScreenWrapper = ({ children, isPadding }: Props) => {
  return (
    <Animated.View entering={FadeInUp}  style={[styles.container, {padding: !isPadding? 20 : 10}]} > 
      {children}
    </Animated.View>
  )
}

export default ScreenWrapper

const styles = StyleSheet.create({
 
container:{
 height: '100%',
 width: '100%',
 backgroundColor: '#ffffff',
}
})