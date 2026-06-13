import StoreInfo from '@/components/settings/StoreInfo'
import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = {}

const store = (props: Props) => {
  return (
    <SafeAreaView style={{flex: 1}} >
      <StoreInfo  handleClose={() => null} />
    </SafeAreaView>
  )
}

export default store

const styles = StyleSheet.create({})