import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import StoreInfo from '@/components/settings/StoreInfo'
import SettingHeader from '@/components/settings/SettingHeader'

type Props = {}

const settings = (props: Props) => {
  return (
    <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
     <SettingHeader /> 
     <StoreInfo  handleClose={() => null} isNOtBack />
      
    </ScrollView>
  )
}

export default settings

const styles = StyleSheet.create({})