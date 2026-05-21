import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react';
import { Colors } from '@/constants/Colors';
import { SIZES } from '@/util/comon';
import { Feather } from '@expo/vector-icons'

type Props = {
 backAction: () => void,
 icon?: React.ReactNode
}

const BackButton = ({backAction, icon}: Props) => {
  return (
    <View>
      <TouchableOpacity style={[styles.button, {zIndex: icon? 0 : 100}]} onPress={backAction}>
       {icon? icon : <Feather name='arrow-left' size={20} color={Colors.app.black} />}
      </TouchableOpacity>
    </View>
  )
}

export default BackButton

const styles = StyleSheet.create({
 button:{
   backgroundColor: Colors.app.secondary,
   borderWidth: StyleSheet.hairlineWidth,
   borderColor: Colors.app.texteLight,
   borderRadius: 10,
   height: 35,
   width: 35,
   justifyContent: 'center',
   alignItems: 'center',
  //  zIndex: 100
 }
})