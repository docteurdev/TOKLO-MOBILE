import { View, Text } from 'react-native'
import React from 'react'
import NotifEmptyCompo from '@/components/NotifEmptyCompo'
import { colors } from '@/util/comon'

type Props = {}

const Page = (props: Props) => {
  return (
    <View style={{flex: 1, backgroundColor: "white"}} >
       <NotifEmptyCompo
       title="Pas de notifications"
       message="Votre boîte de réception est vide. Les nouveaux messages apparaîtront ici."
       iconColor={colors.available.unav_txt}
       // primaryColor="#4F46E5"
       />
    </View>
  )
}

export default Page