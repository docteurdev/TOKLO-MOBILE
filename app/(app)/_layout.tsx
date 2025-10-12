import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react';
import {Drawer} from "expo-router/drawer";
import DrawerHeader from '@/components/CustomHeaders/DrawerHeader';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/user';

import {ChartBarSquareIcon, Cog6ToothIcon, HomeIcon, PhotoIcon, UserGroupIcon } from "react-native-heroicons/solid";
import { Colors } from '@/constants/Colors';
import CustomDrawer from '@/components/CustomHeaders/CustomDrawer';


type Props = {}

const _layout = (props: Props) => {

  const {userId, token} = useUserStore();

  const [isLoading, setIsLoading] = React.useState(true);

  // console.log("00000000000000", token )

  // useEffect(() => {
    
  
  //   return () => {
  //     setIsLoading(true)
  //   }
  // }, [userId])
  

  // You can keep the splash screen open, or render a loading screen like we do here.
  // if (isLoading) {
  //   return <Text>Loading...</Text>;
  // }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <>
        <Drawer
          drawerContent={CustomDrawer}
        initialRouteName='(tab)'
        screenOptions={{
          headerTitle: "", 
          header: () => <DrawerHeader/>,
          //  headerSearchBarOptions: {
          //   placeholder: "Rechercher un produit",
          //   onChangeText: (query) => console.log(query),
          // },
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
     
    </>
  )
}

export default _layout

const styles = StyleSheet.create({})