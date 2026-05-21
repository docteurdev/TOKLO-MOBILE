import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react';
import { useNavigation, useRouter } from 'expo-router';
import {Feather} from '@expo/vector-icons'
import { BellAlertIcon as BellIcon } from "react-native-heroicons/solid";
import { MagnifyingGlassIcon as SearchIcon } from "react-native-heroicons/solid";
import { Bars3CenterLeftIcon as MenuIcon } from "react-native-heroicons/solid";
import { Colors } from '@/constants/Colors';
import { formatXOF, SIZES } from '@/util/comon';

type Props = {}

const StatHeader = (props: Props) => {

  const nav = useNavigation();
  const router = useRouter()

  return (
    <View style={styles.container} >
       <TouchableOpacity onPress={() => nav?.openDrawer()} style={styles.menu} >
         <MenuIcon fill={Colors.app.texteLight} size={27}/>
       </TouchableOpacity>
       <View style={{alignItems: "center", flex: 1}} >
         <Text style={{fontSize: SIZES.lg, fontWeight: "bold", color: Colors.app.texteLight}} > Statistiques</Text>
         {/* <Text style={{fontSize: SIZES.xs, fontWeight: "600", color: Colors.app.texteLight}} > Total </Text> */}

       </View>
      <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}} >
      {/* <TouchableOpacity style={styles.icon} >
        <SearchIcon fill={Colors.app.texteLight} size={27}/>
      </TouchableOpacity> */}
      <TouchableOpacity onPress={() => router.push("/profile")} style={styles.icon} >
        {/* <Feather name="bell" size={16} /> */}
        <BellIcon  fill={Colors.app.texteLight} size={27}/>
      </TouchableOpacity>
      </View>
    </View>
  )
}

export default StatHeader

const styles = StyleSheet.create({
  container:{
    flexDirection: "row",
     alignItems: "center",
     justifyContent: "space-between",
     width: "100%",
     height: 60,
     backgroundColor: "white",
     paddingHorizontal: 20,
     borderBottomWidth: StyleSheet.hairlineWidth,
     borderColor: Colors.app.disabled
    },

    menu:{
      // backgroundColor: "red",
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center"
    },
    icon: {
     width: 40,
     height: 40,
     justifyContent: "center",
     alignItems: "center"
    }
})