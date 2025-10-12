import { Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import usePrint from './usePrint'
import { TInvoice } from '@/interfaces/type'

type Props = {}

const useInvoice = () => {

 const {print, selectPrinter} = usePrint();

 function handleInvoice(invoice?: TInvoice) {
   Platform.OS === 'android' ? print(invoice) : selectPrinter(invoice)
 }

  return {
   handleInvoice
  }
}

export default useInvoice

const styles = StyleSheet.create({})