import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Bars3CenterLeftIcon as MenuIcon, BellAlertIcon as BellIcon, QrCodeIcon } from "react-native-heroicons/solid";
import { Rs, SIZES } from '@/util/comon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';

const DrawerHeader = () => {

  const nav = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <>
    <View style={[styles.container, { paddingTop: insets.top + Rs(8) }]} >
       <TouchableOpacity onPress={() => nav.dispatch(DrawerActions.openDrawer())} style={styles.menu} >
         <MenuIcon fill={theme.muted} size={27}/>
       </TouchableOpacity>
      <Text style={styles.title}>Toklo<Text style={styles.titleLight}></Text> </Text>
      <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}} >
      <TouchableOpacity onPress={() => router.push("/(app)/qrCode")} style={styles.icon} >
        <QrCodeIcon fill={theme.primary} size={27}/>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(app)/notification")} style={styles.icon} >
        {/* <Feather name="bell" size={16} /> */}
        <BellIcon fill={theme.muted} size={27}/>
      </TouchableOpacity>
      </View>
    </View>

    </>
  )
}

export default DrawerHeader

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container:{
    flexDirection: "row",
     alignItems: "center",
     justifyContent: "space-between",
     width: "100%",
     minHeight: 72,
     backgroundColor: theme.card,
     paddingHorizontal: 20,
     paddingBottom: Rs(10),
     borderBottomWidth: StyleSheet.hairlineWidth,
     borderColor: theme.border
    },
    title: {
      color: theme.text,
      fontSize: SIZES.lg,
      fontWeight: "700",
    },
    titleLight: {
      color: theme.muted,
      fontSize: SIZES.lg,
      fontWeight: "500",
    },

    menu:{
      // backgroundColor: "red",
      width: 44,
      height: 44,
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
