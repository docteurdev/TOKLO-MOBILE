import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react';
import { UserIcon, ArrowRightIcon, SparklesIcon } from "react-native-heroicons/solid";
import { Colors } from '@/constants/Colors';
import { Rs, SIZES } from '@/util/comon';
import { useRouter } from 'expo-router';
import { IUser } from '@/interfaces/user';
import { IClient, IDress } from '@/interfaces/type';


type Props = {
  isListed?: boolean;
  dress: IDress;
  action?: () => void;
}

const DressItem = ({isListed, dress, action}: Props) => {


  const route = useRouter();

  return (
    <View>
      <TouchableOpacity style={styles.item} onPress={() => action?.()}>
        <View style={styles.iconBox} >
         {/* {!isListed && <View style={styles.pill} >
            <Text style={styles.pillText} > {user?._count?.orders} </Text>
          </View>} */}
          <SparklesIcon fill={Colors.app.primary} size={Rs(27)} />
        </View>
        <View style={styles.userBloc} >
          <View style={{flex: 1}} >
           <Text style={styles.userName} > {dress?.nom} </Text>
           <Text style={styles.userPhone} > {dress?.genre} </Text>
           {/* <Text style={styles.userPhone} > 01 42 26 90 19 </Text> */}
          </View>
          {!isListed && <View style={{width: 40, height: 40, justifyContent: "center", alignItems: "center", }} >
            <ArrowRightIcon fill={Colors.app.primary} size={Rs(18)} />
          </View>}
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default DressItem

const styles = StyleSheet.create({
  item: {
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  iconBox: {
    height: Rs(40),
    width: Rs(40),
    backgroundColor: Colors.app.light,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontWeight: "semibold",
    fontSize: SIZES.md ,
  },
  userPhone: {
    color: Colors.app.texteLight,
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
    borderColor: Colors.app.disabled,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "white",
    zIndex: 100,
  },
  pillText: {
    fontSize: SIZES.xs,
    color: Colors.app.primary,
    // textAlign: "center",

  },
  userBloc: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.app.disabled,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center"
  },
});