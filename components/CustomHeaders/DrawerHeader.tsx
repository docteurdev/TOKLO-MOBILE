import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react';
import { useNavigation, useRouter } from 'expo-router';
import {Feather} from '@expo/vector-icons'
import { BellAlertIcon as BellIcon, QrCodeIcon } from "react-native-heroicons/solid";
import { MagnifyingGlassIcon as SearchIcon } from "react-native-heroicons/solid";
import { Bars3CenterLeftIcon as MenuIcon } from "react-native-heroicons/solid";
import { Colors } from '@/constants/Colors';
import { Rs, SIZES } from '@/util/comon';
import BottomSheetCompo from '../BottomSheetCompo';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type Props = {}

const DrawerHeader = (props: Props) => {

  const nav = useNavigation();
  const router = useRouter();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  return (
    <>
    <View style={styles.container} >
       <TouchableOpacity onPress={() => nav?.openDrawer()} style={styles.menu} >
         <MenuIcon fill={Colors.app.texteLight} size={27}/>
       </TouchableOpacity>
      <Text style={{fontSize: SIZES.lg, fontWeight: "700"}} >Toklo<Text style={{fontSize: SIZES.lg, fontWeight: "500"}}></Text> </Text>
      <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}} >
      <TouchableOpacity onPress={() => router.push("/(app)/qrCode")} style={styles.icon} >
        <QrCodeIcon fill={Colors.app.primary} size={27}/>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(app)/notification")} style={styles.icon} >
        {/* <Feather name="bell" size={16} /> */}
        <BellIcon  fill={Colors.app.texteLight} size={27}/>
      </TouchableOpacity>
      </View>
    </View>

    </>
  )
}

export default DrawerHeader

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