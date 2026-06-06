import BtnFill from '@/components/svgCompo/BtnFill';
import Measure from '@/components/svgCompo/Measure';
import Needle from '@/components/svgCompo/Needle';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/stores/user';
import { baseURL } from '@/util/axios';
import axios from 'axios';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { UserGroupIcon as UsersIcon } from "react-native-heroicons/solid";


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
      const token = await axios.post(`${baseURL}/token/verify`,{
        token: notify_token,
        tokloManId: user?.id,
      });
    } catch (error) {
            console.warn("token-error============================", error);

    }
  }
  
  return (
        // <ConfettiProvider>

          <Tabs 
          //  initialRouteName='(drawer)'
          screenOptions={{
            tabBarShowLabel: true,
            headerShown: false,
            tabBarActiveTintColor: Colors.app.primary,
            
          }}
          
          >
            <Tabs.Screen name='index'
            options={{
              tabBarLabel: "Accueil",
              tabBarIcon: ({color}) => <Needle fill={color} width={35} height={30}/>,
              
            }}
            
              />

            <Tabs.Screen name='add-dress'
            
            options={{
              tabBarLabel: "Mesure",
              tabBarIcon: ({color}) => 
              <View
              style={{
                backgroundColor: "white",
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
              <Measure fill={color} color={color} width={30} height={30}/>
            </View> 
            ,
              
              
            }}
            
              />


            <Tabs.Screen name='orders'
            options={{
              tabBarLabel: "Commandes",
              tabBarIcon: ({color}) => <BtnFill fill={color} width={40} height={40}/>,
              
            }}
            />

          <Tabs.Screen name='users/[id]'
            options={{
              href: null,
              tabBarIcon: ({color}) => <UsersIcon fill={color} size={27} height={30}/>,
              
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
