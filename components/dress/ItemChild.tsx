import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'
import { SIZES } from '@/util/comon'

type Props = {}

function ItemChild({label, icon}: {label: string, icon: React.ReactNode}) {
 return (
   <View style={{flexDirection: "row", alignItems: "center", gap: 6}} >
      {icon}
     <Text numberOfLines={1} style={{fontSize: SIZES.sm -2, color: Colors.app.texteLight}}> {label} </Text>
   </View>
 )
}


export default ItemChild

const styles = StyleSheet.create({})