import BtnFill from '@/components/svgCompo/BtnFill';
import Measure from '@/components/svgCompo/Measure';
import Needle from '@/components/svgCompo/Needle';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserStore } from '@/stores/user';
import { baseURL } from '@/util/axios';
import axios from 'axios';
import { Tabs } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { UserGroupIcon as UsersIcon } from "react-native-heroicons/solid";


export default function AppLayout() {
  // const { session, isLoading } = useSession();
  const {user, notify_token} = useUserStore();
  const theme = useAppTheme();

  // checking if the user token is exist

  const handleManageToken = useCallback(async () => {
    try {
      await axios.post(`${baseURL}/token/verify`,{
        token: notify_token,
        tokloManId: user?.id,
      });
    } catch (error) {
            console.warn("token-error============================", error);

    }
  }, [notify_token, user?.id]);

  useEffect(() => {
    if (user) {
      handleManageToken();
    }
  }, [handleManageToken, user]);
  
  return (
        // <ConfettiProvider>

          <Tabs 
          //  initialRouteName='(drawer)'
          screenOptions={{
            tabBarShowLabel: true,
            headerShown: false,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.muted,
            tabBarStyle: {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
            },
            sceneStyle: {
              backgroundColor: theme.background,
            },
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
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1,
                position: "absolute",
                top: -30,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: theme.background === "#FFFDF8" ? "#000000" : "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: theme.background === "#FFFDF8" ? 0.12 : 0.35,
                shadowRadius: 8,
                elevation: 6,
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
