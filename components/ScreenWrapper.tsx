import React from 'react'
import { StyleSheet } from 'react-native'
import Animated, { FadeInUp } from "react-native-reanimated"

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
	 flex: 1,
	 width: '100%',
	 backgroundColor: '#fefefe',
	}
})
