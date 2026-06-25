import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { Feather } from '@expo/vector-icons'
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native'

type Props = {
 backAction: () => void,
 icon?: React.ReactNode
}

const BackButton = ({backAction, icon}: Props) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View>
      <TouchableOpacity style={[styles.button, {zIndex: icon? 0 : 100}]} onPress={backAction}>
       {icon? icon : <Feather name='arrow-left' size={20} color={theme.text} />}
      </TouchableOpacity>
    </View>
  )
}

export default BackButton

const createStyles = (theme: AppTheme) => StyleSheet.create({
 button:{
   backgroundColor: theme.card,
   borderWidth: StyleSheet.hairlineWidth,
   borderColor: theme.border,
   borderRadius: 10,
   height: 35,
   width: 35,
   justifyContent: 'center',
   alignItems: 'center',
  //  zIndex: 100
 }
})
