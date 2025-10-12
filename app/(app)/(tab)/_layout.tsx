import { Text, View } from 'react-native';
import { Redirect, Stack, Tabs } from 'expo-router';
import { useUserStore } from '@/stores/user';
import { CalendarDaysIcon, ClipboardDocumentListIcon as OrderIcon } from "react-native-heroicons/solid";
import { UserGroupIcon  as UsersIcon } from "react-native-heroicons/solid";
import { PlusIcon } from "react-native-heroicons/solid";
import { Colors } from '@/constants/Colors';
import { useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '@/util/axios';


export default function AppLayout() {
  // const { session, isLoading } = useSession();
  const {user, notify_token} = useUserStore();

  useEffect(() => {
    if (user) {
      handleManageToken();
    }
  }, []);

  // checking if the user token is exist

  async function handleManageToken() {
    try {
      const token = await axios.post(`${baseURL}/otoken/verify`,{
        token: notify_token,
        tokloManId: user?.id,
      });
      console.log("token", token);
    } catch (error) {}
  }
  
  return (
        // <ConfettiProvider>

          <Tabs 
          //  initialRouteName='(drawer)'
          screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarActiveTintColor: Colors.app.primary,
            
          }}
          
          >
            <Tabs.Screen name='index'
            options={{
              tabBarLabel: "Accueil",
              tabBarIcon: ({color}) => <CalendarDaysIcon fill={color} size={27}/>,
              
            }}
            
              />

            <Tabs.Screen name='add-dress'
            
            options={{
              // tabBarLabel: "",
              tabBarIcon: ({color}) => <View
              style={{
                backgroundColor: Colors.app.primary,
                position: "absolute",
                top: -30,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                boxShadow: Colors.shadow.card,
                zIndex: 10,
                borderRadius: 25,
              }}
            >
              <PlusIcon fill={"#ffffff"} size={27}/>
            </View> ,
              
              
            }}
            
              />


            <Tabs.Screen name='orders'
            options={{
              tabBarLabel: "Commandes",
              tabBarIcon: ({color}) => <OrderIcon fill={color} size={27}/>,
              
            }}
            />

          <Tabs.Screen name='users/[id]'
            options={{
              href: null,
              tabBarIcon: ({color}) => <UsersIcon fill={color} size={27}/>,
              
            }}
            />
            <Tabs.Screen name='users/index'
            options={{
              href: null,
              tabBarIcon: ({color}) => <UsersIcon fill={color} size={27}/>,
              
            }}
            />
          </Tabs>
        // </ConfettiProvider>
  );
}
