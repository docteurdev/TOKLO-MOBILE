import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { createNotifications } from 'react-native-notificated'

type Props = {}

const useNotif = () => {

 const { NotificationsProvider, useNotifications, ...events } = createNotifications();

  const { notify } = useNotifications()

 function handleNotification(type: 'success' | 'error', title: string, description: string) {
  notify(type, {
   params: {
     title: title,
     description: description,
   },
 })
}

  return {
   handleNotification
  }
 }

export default useNotif

const styles = StyleSheet.create({})