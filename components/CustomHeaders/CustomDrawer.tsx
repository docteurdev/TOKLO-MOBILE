import { DrawerContentScrollView } from '@react-navigation/drawer'
import { usePathname, useRouter } from 'expo-router'
import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  BanknotesIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  HomeIcon,
  PhotoIcon,
  UserGroupIcon
} from 'react-native-heroicons/solid'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useUserStore } from '@/stores/user'
import { colors, formatIvoryCoastPhoneNumber, Rs, SIZES } from '@/util/comon'
import CustomButton from '../form/CustomButton'
import ProfileShower from './drawer/ProfileShower'

const DRAWER_BG = '#FFF8EC'
const TEXT_MAIN = '#2B1A0E'
const TEXT_SECONDARY = '#6F6254'
const GOLD = '#DFA32C'
const RICH_GOLD = '#B8860B'
const ACTIVE_BG = '#F7E5BC'

type MenuIconProps = {
  color: string
  focused: boolean
}

type MenuItemProps = {
  focused: boolean
  icon: (props: MenuIconProps) => React.ReactNode
  label: string
  onPress: () => void
}

const CustomDrawer = (props: any) => {
  const currentRouteName = props.state.routes[props.state.index].name
  const router = useRouter()
  const pathname = usePathname()

  const { user, clearToken, setSubscribe, clearTokloUser } = useUserStore()

  const linkList = [
    {
      link: 'stat',
      label: 'Statistiques',
      icon: ({ color }: MenuIconProps) => <ChartBarSquareIcon fill={color} size={24} />,
    },
    {
      link: 'users',
      label: 'Client',
      icon: ({ color }: MenuIconProps) => <UserGroupIcon fill={color} size={24} />,
    },
    {
      link: 'gallery',
      label: 'Catalogue',
      icon: ({ color }: MenuIconProps) => <PhotoIcon fill={color} size={24} />,
    },
    // {
    //   link: '(store)',
    //   label: 'Ma boutique',
    //   icon: ({ color }: MenuIconProps) => <ShoppingBagIcon fill={color} size={24} />,
    // },
    // {
    //   link: 'toklo-market',
    //   label: 'Toklo market',
    //   icon: ({ color }: MenuIconProps) => <ShoppingCartIcon fill={color} size={24} />,
    // },
    {
      link: 'settings',
      label: 'Paramètres',
      icon: ({ color }: MenuIconProps) => <Cog6ToothIcon fill={color} size={24} />,
    },
    {
      link: 'pricing',
      label: 'Abonnement',
      icon: ({ color }: MenuIconProps) => <BanknotesIcon fill={color} size={24} />,
    },
  ]

  function handleNav(link: string) {
    const splitedPath = link.split('/')
    const joinPath = splitedPath.slice(0, 2).join('/')
    router.push(joinPath as any)
  }

  const phoneNumber = user?.phone ? formatIvoryCoastPhoneNumber(user.phone) : ''
  const userName = user?.store_name || `${user?.name || ''} ${user?.lastname || ''}`.trim() || 'Atelier Toklo'
  const userDescription = user?.store_slogan || 'Atelier de couture premium'

  return (
    <SafeAreaView style={styles.container}>
      {/* <RightPatternBand /> */}

      <View style={styles.header}>
        
        <ProfileShower />

        <Image
          source={require('@/assets/images/measure/double-arrow.png')}
          resizeMode="cover"
          style={styles.headerDoubleArrow}
        />
      </View>

      <DrawerContentScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DrawerMenuItem
          focused={currentRouteName == '(tab)' || pathname.includes('/(tab)')}
          icon={({ color }) => <HomeIcon fill={color} size={24} />}
          label="Accueil"
          onPress={() => router.push('/(app)/(tab)')}
        />

        {linkList.map((item) => (
          <DrawerMenuItem
            key={item.link}
            focused={currentRouteName.includes(item.link)}
            icon={item.icon}
            label={item.label}
            onPress={() => handleNav(item.link)}
          />
        ))}
      </DrawerContentScrollView>
    
      <View style={styles.logoutWrap}>
        <CustomButton
         label='Se déconnecter'
         disabled
         action={()=>{
          clearToken()
            setSubscribe(false)
            clearTokloUser()
            router.push('/login')
         }}
        />
        
      </View>
    </SafeAreaView>
  )
}

const DrawerMenuItem = ({ focused, icon, label, onPress }: MenuItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        focused && styles.menuItemActive,
        pressed && styles.menuItemPressed,
      ]}
    >
      {focused && <ActiveItemPattern />}
      <View style={[styles.iconCircle, {    backgroundColor: focused? 'white': colors.lightOrange,}]}>
        {icon({ color: GOLD, focused })}
        </View>
      <Text numberOfLines={1} style={[styles.menuLabel, focused && styles.menuLabelActive]}>
        {label}
      </Text>
    </Pressable>
  )
}


const ActiveItemPattern = () => (
  <View pointerEvents="none" style={styles.activePattern}>
    <Image style={styles.activePattern} width={100} height={100} source={require("@/assets/images/measure/top-sheet.png")} />
  </View>
)

const RightPatternBand = () => (
  <View pointerEvents="none" style={styles.rightBand}>
    <Image
      source={require('@/assets/images/measure/cauri.png')}
      resizeMode="repeat"
      style={styles.rightBandImage}
    />
  </View>
)


export default CustomDrawer

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(14),
    paddingHorizontal: Rs(18),
    paddingTop: Rs(18),
    paddingBottom: Rs(22),
    position: "relative",
  },
  headerDoubleArrow: {
    position: 'absolute',
    bottom: Rs(-1),
    left: '50%',
    width: Rs(170),
    height: Rs(15),
    marginLeft: Rs(-80),
  },
  avatarOuter: {
    width: Rs(88),
    height: Rs(88),
    borderRadius: Rs(44),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  avatarOuterImage: {
    position: 'absolute',
    width: Rs(190),
    height: Rs(128),
    left: Rs(-51),
    top: Rs(-20),
  },
  avatarInner: {
    width: Rs(54),
    height: Rs(54),
    borderRadius: Rs(27),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(184, 134, 11, 0.28)',
  },
  avatarNeedle: {
    position: 'absolute',
    right: Rs(13),
    bottom: Rs(14),
    transform: [{ rotate: '-18deg' }],
  },
  avatarPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    justifyContent: 'center',
    gap: Rs(7),
  },
  avatarPatternLine: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  avatarPatternDiamond: {
    width: Rs(8),
    height: Rs(8),
    borderWidth: 1,
    borderColor: RICH_GOLD,
    transform: [{ rotate: '45deg' }],
  },
  avatarPatternDot: {
    width: Rs(4),
    height: Rs(4),
    borderRadius: Rs(2),
    backgroundColor: RICH_GOLD,
  },
  userTextWrap: {
    flex: 1,
    paddingRight: Rs(18),
    gap: Rs(4),
  },
  userName: {
    color: TEXT_MAIN,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  userDescription: {
    color: TEXT_SECONDARY,
    fontSize: SIZES.sm,
    lineHeight: Rs(18),
  },
  userPhone: {
    color: GOLD,
    fontSize: SIZES.sm,
    fontWeight: '800',
  },
  scrollContent: {
    paddingTop: Rs(10),
    paddingHorizontal: Rs(12),
    paddingBottom: Rs(112),
  },
  menuItem: {
    position: "relative",
    minHeight: Rs(62),
    width: Rs(250),
    borderRadius: Rs(16),
    paddingHorizontal: Rs(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(13),
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    overflow: 'hidden',
  },
  menuItemActive: {
    backgroundColor: ACTIVE_BG,
    borderBottomColor: 'transparent',
    marginVertical: Rs(3),
  },
  menuItemPressed: {
    opacity: 0.82,
  },
  iconCircle: {
    width: Rs(42),
    height: Rs(42),
    borderRadius: Rs(21),
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    color: TEXT_MAIN,
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
  menuLabelActive: {
    color: colors.DARK_BROWN,
    fontWeight: '800',
  },
  menuSeparator: {
    position: 'absolute',
    left: 0,
    bottom: Rs(-8),
    width: '100%',
    height: Rs(16),
    opacity: 1,
    zIndex: 5,
    tintColor: RICH_GOLD,
  },
  menuSeparatorActive: {
    tintColor: colors.DARK_BROWN,
  },
  activePattern: {
    position: 'absolute',
    right: Rs(-12),
    top: Rs(0),
    // bottom: Rs(8),
    justifyContent: 'space-around',
    
  },
  activePatternRow: {
    flexDirection: 'row',
    gap: Rs(12),
  },
  activePatternDiamond: {
    width: Rs(10),
    height: Rs(10),
    borderWidth: 1,
    borderColor: RICH_GOLD,
    transform: [{ rotate: '45deg' }],
  },
  rightBand: {
    position: 'absolute',
    top: 0,
    right: -12,
    bottom: 0,
    width: Rs(40),
    backgroundColor: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
    overflow: 'hidden',
    zIndex: 10,
  },
  rightBandImage: {
    width: 50,
    height: '100%',
  },
  bandBlock: {
    alignItems: 'center',
    gap: Rs(8),
    marginBottom: Rs(18),
  },
  bandDiamond: {
    width: Rs(8),
    height: Rs(8),
    borderWidth: 1,
    borderColor: 'rgba(184, 134, 11, 0.42)',
    transform: [{ rotate: '45deg' }],
  },
  bandLine: {
    width: 1,
    height: Rs(18),
    backgroundColor: 'rgba(184, 134, 11, 0.28)',
  },
  logoutWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Rs(45),
    paddingHorizontal: Rs(16),
    paddingTop: Rs(12),
    paddingBottom: Rs(18),
    borderTopWidth: 0.5,
    marginRight: Rs(20),
    borderTopColor: 'rgba(232, 216, 184, 0.65)',
  },
  logoutButton: {
    minHeight: Rs(54),
    borderRadius: Rs(30),
    backgroundColor: GOLD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Rs(11),
    overflow: 'hidden',
    shadowColor: '#7A4B0A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  logoutButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  logoutIconCircle: {
    width: Rs(32),
    height: Rs(32),
    borderRadius: Rs(16),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(58, 34, 13, 0.28)',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  logoutPattern: {
    position: 'absolute',
    right: Rs(18),
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(10),
    opacity: 0.16,
  },
  logoutDiamond: {
    width: Rs(13),
    height: Rs(13),
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
})
