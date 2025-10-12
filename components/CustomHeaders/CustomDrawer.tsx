import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../ScreenWrapper'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { Feather } from '@expo/vector-icons'
import { Rs, SIZES } from '@/util/comon'
import { usePathname, useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { BanknotesIcon, ChartBarSquareIcon, ChatBubbleBottomCenterIcon, Cog6ToothIcon, HomeIcon, PhotoIcon, ShoppingBagIcon, UserGroupIcon } from 'react-native-heroicons/solid'
import ProfileShower from './drawer/ProfileShower'
import RoundedBtn from '../form/RoundedBtn'
import { useUserStore } from '@/stores/user'
import { BlurView } from 'expo-blur'

type Props = {}

const CustomDrawer = (props: any) => {

 const currentRouteName = props.state.routes[props.state.index].name;
 const router = useRouter();
 const pathname = usePathname();

 const {clearToken, clearSubscribe, setSubscribe, clearTokloUser} = useUserStore();

 
 const linkList = [
  {
    link: "stat", 
    label: "Statistiques", 
    icon: ({color, focused}: {color: string, focused: boolean}) => (
      <ChartBarSquareIcon fill={focused ? Colors.app.primary : color} size={27}/>
    )
  },
  {
    link: "users", 
    label: "Client", 
    icon: ({color, focused}: {color: string, focused: boolean}) => (
      <UserGroupIcon fill={focused ? Colors.app.primary : color} size={27}/>
    )
  },
  {
    link: "gallery", 
    label: "Catalogue",
    icon: ({color, focused}: {color: string, focused: boolean}) => (
      <PhotoIcon fill={focused ? Colors.app.primary : color} size={27}/>
    )
  },
  {
    link: "(store)", 
    label: "Ma boutique",
    icon: ({color, focused}: {color: string, focused: boolean}) => (
      <ShoppingBagIcon fill={focused ? Colors.app.primary : color} size={27}/>
    )
  },
  {
    link: "settings", 
    label: "Paramètres", 
    icon: ({color, focused}: {color: string, focused: boolean}) => (
      <Cog6ToothIcon fill={focused ? Colors.app.primary : color} size={27}/>
    )
  },

  {
    link: "pricing", 
    label: "Abonnement", 
    icon: ({color, focused}: {color: string, focused: boolean}) => (
      <BanknotesIcon fill={focused ? Colors.app.primary : color} size={27}/>
    )
  }
  // {
  //   link: "pricing", 
  //   label: "Rapport", 
  //   icon: ({color, focused}: {color: string, focused: boolean}) => (
  //     <ChatBubbleBottomCenterIcon fill={focused ? Colors.app.primary : color} size={27}/>
  //   )
  // }
]



function handleNav(link: string){
 const splitedPath = link.split('/');
 const path = splitedPath.includes('index');
 const joinPath = splitedPath.slice(0, 2).join('/');  
 router.push(joinPath )
}

  return (
    <ImageBackground
    source={require('@/assets/images/drawer/bg-2.jpg')}
    resizeMode="stretch"
    style={{flex: 1, backgroundColor: 'white'}}>

      <ProfileShower />

      <DrawerContentScrollView {...props}>
        {/* <DrawerItemList {...props} /> */}
        <DrawerItem
          focused={currentRouteName == "(tab)"}
          activeTintColor={Colors.app.primary}
          icon={({color,focused}) => <HomeIcon fill={focused ? Colors.app.primary : color} size={27}/>}
          label="Accueil"
          labelStyle={{ fontSize: SIZES.sm, marginLeft: 20, color: currentRouteName == "(tab)" ? Colors.app.primary : Colors.app.texteLight }}
          onPress={() => router.push('/(app)/(tab)')}
        />



        {linkList.map((item) => (
          <BlurView intensity={100} style={{marginBottom: Rs(10)}} key={item.link}>
          <DrawerItem
            
            activeTintColor={Colors.app.primary}
            focused={currentRouteName.includes(item.link)}
            icon={({color, focused}) => item.icon({color, focused})}
            label={item.label}
            labelStyle={{ fontSize: SIZES.sm, marginLeft: 20, color: currentRouteName.includes(item.link) ? Colors.app.primary : Colors.app.texteLight}}
            onPress={() => handleNav(item.link)}
          />
          </BlurView>
        ))}
      </DrawerContentScrollView>
        <View style={{position: "absolute", bottom: 0, width: '100%', padding: Rs(10)}} >
          <RoundedBtn disabled label="Se déconnecter"  action={() => {
            clearToken()
            setSubscribe(false)
            clearTokloUser()
            router.push('/login')
          }} />
        </View>
    </ImageBackground>
  )
}

export default CustomDrawer

const styles = StyleSheet.create({})