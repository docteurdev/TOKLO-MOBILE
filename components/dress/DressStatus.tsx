import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'
import { Rs, SIZES } from '@/util/comon'
import { IDressType } from '@/interfaces/type'

type Props = {}

const DressStatus = ({status}: IDressType) => {
  return (
    <View>
     <View style={[styles.status, {borderColor: status === "ONGOING" ? Colors.app.available.unav_txt: status === "FINISHED" ? Colors.app.dashitem.t_2: Colors.app.success}]} >
       <Text style={[styles.statusText, {color: status === "ONGOING"? Colors.app.available.unav_txt: status === "FINISHED" ? Colors.app.dashitem.t_2: Colors.app.success}]} > 
        {status === "ONGOING" ? "En cours" : status === "FINISHED" ? "Terminée" : "Livrée"}
      </Text>
     </View>
    </View>
  )
}

export default DressStatus

const styles = StyleSheet.create({
 status:{
   width: Rs(100),
   borderWidth: StyleSheet.hairlineWidth,
   paddingVertical: 5,
   paddingHorizontal: 5,
   borderRadius: 6,
   color: Colors.app.error
 },
 statusText:{
  fontSize: SIZES.xs,
 color: Colors.app.error,
 textTransform: "uppercase",
 textAlign: "center",
}
})