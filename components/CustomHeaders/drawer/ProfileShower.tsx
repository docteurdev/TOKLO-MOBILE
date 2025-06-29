import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'
import { colors, formatIvoryCoastPhoneNumber, Rs, SIZES } from '@/util/comon'
import { EmpltyProfileLogo } from '@/assets'
import { ThemedText } from '@/components/ThemedText'
import { useUserStore } from '@/stores/user'
import { base } from '@/util/axios'

type Props = {}

const ProfileShower = (props: Props) => {

  const {user} = useUserStore()
  
  return (
    <View>
     <View style={{
      flexDirection: "row",
      gap: Rs(10),
      alignItems: "center",
      height: Rs(100),
      // backgroundColor: colors.inputborderColor,
       padding: Rs(10)}} >
        {
          user?.store_logo ? <Image source={{uri: base+ 'uploads/' + user?.store_logo}}
          style={{width: Rs(80), height: Rs(80), borderRadius: Rs(50)}} /> :
          <Image source={EmpltyProfileLogo}
         style={{width: Rs(80), height: Rs(80), backgroundColor: colors.blackOpacity, borderRadius: Rs(50)}} />
         }
        <View style={{gap: Rs(5)}} >
         <ThemedText numberOfLines={1} style={{ fontSize: SIZES.sm, fontWeight: "bold" }}>
           {user?.store_name} 
          </ThemedText>
         
         <Text  style={{fontSize: SIZES.xs, color: Colors.app.texteLight}}>
          {user?.store_slogan}
         </Text>

         <Text  style={{fontSize: SIZES.xs, color: Colors.app.texteLight}}>
          {formatIvoryCoastPhoneNumber(user?.phone || '')}
         </Text>

        </View>
     </View>
    </View>
  )
}

export default ProfileShower

const styles = StyleSheet.create({})