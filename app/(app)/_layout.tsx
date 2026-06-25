import DrawerHeader from '@/components/CustomHeaders/DrawerHeader';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { useUserStore } from '@/stores/user';
import { Redirect } from 'expo-router';
import { Drawer } from "expo-router/drawer";
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import CustomDrawer from '@/components/CustomHeaders/CustomDrawer';
import { ChartBarSquareIcon, Cog6ToothIcon, HomeIcon, UserGroupIcon } from "react-native-heroicons/solid";


const AppLayout = () => {

  const { token } = useUserStore();
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const statusBarStyle = theme.background === "#FFFDF8" ? "dark-content" : "light-content";


  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
     
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        initialRouteName='(tab)'
        screenOptions={{
          drawerActiveBackgroundColor: theme.primaryLight,
          drawerActiveTintColor: theme.primary,
          drawerInactiveTintColor: theme.muted,
          drawerContentStyle: {
            backgroundColor: theme.card,
          },
          drawerItemStyle: {
            borderRadius: 8,
          },
          drawerLabelStyle: {
            color: theme.text,
            fontWeight: "700",
          },
          drawerStyle: {
            backgroundColor: theme.card,
            borderRightColor: theme.border,
            borderRightWidth: StyleSheet.hairlineWidth,
          },
          sceneStyle: {
            backgroundColor: theme.background,
          },
          headerTitle: "", 
          header: () => <DrawerHeader />,
        }}
        >
          

          <Drawer.Screen name="(tab)"
            options={{
              drawerLabel: "Accueil",
              drawerLabelStyle:{
                  paddingLeft: -50
              },
                drawerIcon: ({ color }) => <HomeIcon fill={color} size={27} /> ,
          }}
          />

          

            
          <Drawer.Screen name="stat"
            options={{
              drawerLabel: "Statistiques",
              drawerItemStyle: null ,
              drawerIcon: ({ color }) => <ChartBarSquareIcon fill={color} size={27}/>,
            }}
          />

          <Drawer.Screen name="users/index"
            options={{
              drawerLabel: "Clients",
              drawerItemStyle: null ,
              drawerIcon: ({ color }) => <UserGroupIcon fill={color} size={27}/>,
            }}
          />

          <Drawer.Screen name="setting"
            options={{
              drawerLabel: "Paramètres",
              drawerIcon: ({ color }) => <Cog6ToothIcon fill={color} size={27}/>,
            }}
          />

          <Drawer.Screen name="users/[id]"
            options={{
              drawerLabel: "Clien",
              drawerItemStyle: {display: "none"} ,
              drawerIcon: ({ color }) => <UserGroupIcon fill={color} size={27}/>,
            }}
          />
          
        </Drawer>
     
    </View>
  )
}

export default AppLayout

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    backgroundColor: theme.background,
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
