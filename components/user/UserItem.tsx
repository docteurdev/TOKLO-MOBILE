import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react';
import { UserIcon, ArrowRightIcon } from "react-native-heroicons/solid";
import { Rs, SIZES } from '@/util/comon';
import { IClient } from '@/interfaces/type';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';


type Props = {
  isListed?: boolean;
  user: IClient;
  action?: () => void;
}

const UserItem = ({isListed, user, action}: Props) => {

  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View>
      <TouchableOpacity style={styles.item} onPress={() => action?.()}>
        <View style={styles.iconBox} >
         {!isListed && <View style={styles.pill} >
            <Text style={styles.pillText} > {user?._count?.orders} </Text>
          </View>}
          <UserIcon fill={theme.primary} size={Rs(27)} />
        </View>
        <View style={styles.userBloc} >
          <View style={{flex: 1}} >
           <Text style={styles.userName} > {user.name} </Text>
           <Text style={styles.userPhone} > {user.telephone} </Text>
           {/* <Text style={styles.userPhone} > 01 42 26 90 19 </Text> */}
          </View>
          {!isListed && <View style={styles.arrowBox}>
            <ArrowRightIcon fill={theme.primary} size={Rs(18)} />
          </View>}
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default UserItem

const createStyles = (theme: AppTheme) => StyleSheet.create({
  item: {
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  iconBox: {
    height: Rs(40),
    width: Rs(40),
    backgroundColor: theme.primaryLight,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    color: theme.text,
    fontWeight: "600",
    fontSize: SIZES.md ,
  },
  userPhone: {
    color: theme.muted,
    fontSize: SIZES.sm - 2,
    marginTop: 8,
  },
  pill: {
    position: "absolute",
    top: -20,
    right: -10,
    width: 30,
    height: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: theme.card,
    zIndex: 100,
  },
  pillText: {
    fontSize: SIZES.xs,
    color: theme.primary,
    // textAlign: "center",

  },
  userBloc: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  arrowBox: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
});
