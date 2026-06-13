import { EmpltyProfileLogo } from '@/assets'
import { ThemedText } from '@/components/ThemedText'
import { Colors } from '@/constants/Colors'
import { useUserStore } from '@/stores/user'
import { base } from '@/util/axios'
import { colors, formatIvoryCoastPhoneNumber, Rs, SIZES } from '@/util/comon'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

type Props = {}

const ProfileShower = (props: Props) => {

  const {user} = useUserStore()
  
  return (
     <View style={{
      flexDirection: "row",
      gap: Rs(10),
      alignItems: "center",
      height: Rs(100),
      width: "100%",
      // backgroundColor: colors.inputborderColor,
       padding: Rs(10)}} >
        {
          user?.store_logo ? <Image source={{uri: base+ 'uploads/' + user?.store_logo}}
          style={{width: Rs(80), height: Rs(80), borderRadius: Rs(50)}} /> :
          <Image source={EmpltyProfileLogo}
         style={{width: Rs(80), height: Rs(80), backgroundColor: colors.blackOpacity, borderRadius: Rs(50)}} />
         }
        <View style={{gap: Rs(5)}} >
         <View style={styles.nameRow}>
          <ThemedText numberOfLines={1} style={styles.nameText}>
            {user?.store_name}
          </ThemedText>
          <Feather name="check-circle" size={Rs(16)} color={Colors.app.success} />
         </View>
         
         {/* <Text  style={{fontSize: SIZES.lg, color: Colors.app.texteLight}}>
          {user?.store_slogan}
         </Text> */}

         <View style={styles.phoneRow}>
          <View style={styles.phoneIconContainer}>
            <Feather name="phone" size={Rs(12)} color={Colors.app.primary} />
          </View>
          <Text  style={{fontSize: SIZES.md, color: Colors.app.texteLight}}>
            {formatIvoryCoastPhoneNumber(user?.phone || '')}
          </Text>
         </View>

        </View>
     </View>
  )
}

export default ProfileShower

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(6),
    maxWidth: Rs(180),
  },
  nameText: {
    flexShrink: 1,
    fontSize: SIZES.lg,
    fontWeight: "bold",
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(6),
  },
  phoneIconContainer: {
    width: Rs(22),
    height: Rs(22),
    borderRadius: Rs(11),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.app.secondary,
  },
})
