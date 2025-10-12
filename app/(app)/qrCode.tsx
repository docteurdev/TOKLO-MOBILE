import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

import { Colors } from '@/constants/Colors';
import BackButton from '@/components/form/BackButton';
import { Rs } from '@/util/comon';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/user';


const Page = () => {
 
const {user} = useUserStore()
const route = useRouter()

  return (
   <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}} >
    <View style={{position: "absolute", top: 20, left: 20}} >
     <BackButton backAction={() => route.back()}/>
    </View>
    <QRCode
      value="http://awesome.link.qr"
      size={Rs(250)}
      color={Colors.app.primary}
    />

    <Text style={{marginTop: Rs(20), fontSize: 16, fontWeight: "600", color: Colors.app.texteLight, textAlign: "center"}}>
      Scannez pour voir mon catalogue
    </Text>
   </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scanText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.app.texteLight,
  }
});

export default Page;