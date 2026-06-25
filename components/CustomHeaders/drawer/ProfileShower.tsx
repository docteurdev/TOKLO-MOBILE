import { EmpltyProfileLogo } from '@/assets'
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme'
import { useUserStore } from '@/stores/user'
import { base } from '@/util/axios'
import { formatIvoryCoastPhoneNumber, Rs, SIZES } from '@/util/comon'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

const ProfileShower = () => {

  const {user} = useUserStore()
  const theme = useAppTheme()
  const styles = React.useMemo(() => createStyles(theme), [theme])
  
  return (
     <View style={styles.container}>
        {
          user?.store_logo ? <Image source={{uri: base+ 'uploads/' + user?.store_logo}}
          style={{width: Rs(80), height: Rs(80), borderRadius: Rs(50)}} /> :
          <Image source={EmpltyProfileLogo}
         style={styles.avatarPlaceholder} />
         }
        <View style={{gap: Rs(5)}} >
         <View style={styles.nameRow}>
          <Text numberOfLines={1} style={styles.nameText}>
            {user?.store_name}
          </Text>
          <Feather name="check-circle" size={Rs(16)} color={theme.success} />
         </View>
         
         {/* <Text  style={{fontSize: SIZES.lg, color: Colors.app.texteLight}}>
          {user?.store_slogan}
         </Text> */}

         <View style={styles.phoneRow}>
          <View style={styles.phoneIconContainer}>
            <Feather name="phone" size={Rs(12)} color={theme.primary} />
          </View>
          <Text style={styles.phoneText}>
            {formatIvoryCoastPhoneNumber(user?.phone || '')}
          </Text>
         </View>

        </View>
     </View>
  )
}

export default ProfileShower

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: Rs(10),
    height: Rs(100),
    padding: Rs(10),
    width: "100%",
  },
  avatarPlaceholder: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.border,
    borderRadius: Rs(50),
    borderWidth: 1,
    height: Rs(80),
    width: Rs(80),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(6),
    maxWidth: Rs(180),
  },
  nameText: {
    color: theme.text,
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
    backgroundColor: theme.primaryLight,
  },
  phoneText: {
    color: theme.muted,
    fontSize: SIZES.md,
  },
})
