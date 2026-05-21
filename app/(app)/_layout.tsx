import DrawerHeader from '@/components/CustomHeaders/DrawerHeader';
import { useUserStore } from '@/stores/user';
import { Redirect } from 'expo-router';
import { Drawer } from "expo-router/drawer";
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import CustomDrawer from '@/components/CustomHeaders/CustomDrawer';
import { Colors } from '@/constants/Colors';
import { ChartBarSquareIcon, Cog6ToothIcon, HomeIcon, UserGroupIcon } from "react-native-heroicons/solid";


const AppLayout = () => {

  const { token } = useUserStore();

  // console.log("00000000000000", token )

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      {/* <Image
        resizeMode="cover"
        source={require("@/assets/images/measure/tradition-2.png")}
        style={styles.traditionPattern}
      /> */}
      <Drawer
          drawerContent={CustomDrawer}
        initialRouteName='(tab)'
        screenOptions={{
          headerTitle: "", 
          header: () => <DrawerHeader/>,
        }}
        >
          

          <Drawer.Screen name="(tab)"
            options={{
              drawerLabel: "Accueil",
              drawerLabelStyle:{
                  paddingLeft: -50
              },
                drawerIcon: () => <HomeIcon fill={Colors.app.texteLight} size={27} /> ,
          }}
          />

          

            
          <Drawer.Screen name="stat"
            options={{
              drawerLabel: "Statistiques",
              drawerItemStyle: null ,
              drawerIcon: () => <ChartBarSquareIcon fill={Colors.app.texteLight} size={27}/>,
            }}
          />

          <Drawer.Screen name="users/index"
            options={{
              drawerLabel: "Clients",
              drawerItemStyle: null ,
              drawerIcon: () => <UserGroupIcon fill={Colors.app.texteLight} size={27}/>,
            }}
          />

          <Drawer.Screen name="setting"
            options={{
              drawerLabel: "Paramètres",
              drawerIcon: () => <Cog6ToothIcon fill={Colors.app.texteLight} size={27}/>,
            }}
          />

          <Drawer.Screen name="users/[id]"
            options={{
              drawerLabel: "Clien",
              drawerItemStyle: {display: "none"} ,
              drawerIcon: () => <UserGroupIcon fill={Colors.app.texteLight} size={27}/>,
            }}
          />
          
        </Drawer>
     
    </View>
  )
}

export default AppLayout

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  traditionPattern: {
    position: 'absolute',
    top: -5,
    left: 0,
    right: 0,
    width: '100%',
    height: 20,
    zIndex: 20,
  },
})
