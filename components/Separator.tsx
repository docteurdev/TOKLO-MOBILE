import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'

type Props = {}

const Separator = (props: Props) => {
  return <View style={styles.separator} />
}

export default Separator

const styles = StyleSheet.create({
 separator:{
  height: StyleSheet.hairlineWidth,
  backgroundColor: Colors.app.disabled,
  marginVertical: 20
 }
})