import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

type Props = {}

const AddDressMeasure = (props: Props) => {
  return (
    <View style={{flex: 1, backgroundColor: 'red'}}>
     <Stack.Screen name="AddDressMeasure" options={{presentation: "formSheet", sheetAllowedDetents: "fitToContents"}} />
      <Text>AddDressMeasure</Text>
    </View>
  )
}

export default AddDressMeasure

const styles = StyleSheet.create({})