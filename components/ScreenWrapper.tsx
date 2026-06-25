import React from 'react'
import { StyleSheet } from 'react-native'
import Animated, { FadeInUp } from "react-native-reanimated"
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme'

type Props = {
  children: React.ReactNode,
  isPadding?: boolean
}

const ScreenWrapper = ({ children, isPadding }: Props) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <Animated.View entering={FadeInUp}  style={[styles.container, {padding: !isPadding? 20 : 10}]} > 
      {children}
    </Animated.View>
  )
}

export default ScreenWrapper

const createStyles = (theme: AppTheme) => StyleSheet.create({
 
	container:{
	 flex: 1,
	 width: '100%',
	 backgroundColor: theme.background,
	}
})
