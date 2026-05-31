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


  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
     
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
  decorationsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  traditionPattern: {
    position: 'absolute',
    height: 86,
  },
  leftTraditionPattern: {
    top: -40,
    left: -70,
    width: 150,
    height: 110,
    transform: [{ rotate: '40deg' }],
  },
  rightTraditionPattern: {
    top: -35,
    right: -65,
    width: 140,
    height: 105,
    transform: [{ rotate: '-40deg' }],
  },
	})
