import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react';
import {Feather} from '@expo/vector-icons'
import { Colors } from '@/constants/Colors';

type Props = {}

const StandardHeader = (props: Props) => {
  return (
    <View style={styles.container} >
       <TouchableOpacity style={styles.menu} >
         <Feather name="menu"  size={30} color={Colors.app.black}/>
       </TouchableOpacity>
      <Text>StandardHeader</Text>
    </View>
  )
}

export default StandardHeader

const styles = StyleSheet.create({
  container:{
    flexDirection: "row",
     alignItems: "center",
     justifyContent: "space-between",
     width: "100%",
     height: 60,
     backgroundColor: "white",
     paddingHorizontal: 20
    },

    menu:{
      // backgroundColor: "red",
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center"
    }
})