import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors';
import { SIZES } from '@/util/comon';

type Props = {
 icon: React.ReactNode;
 label: string;
 action: () => void
}

const FileSheet = ({icon, label, action}: Props) => {
  return (
    <View>
     <TouchableOpacity onPress={action} style={styles.button} >
       {icon}
       <Text style={styles.buttonText}> {label} </Text>
     </TouchableOpacity>
    </View>
  )
}

export default FileSheet

const styles = StyleSheet.create({
 button:{
  flexDirection:"row",
  // gap: 10,
  backgroundColor: Colors.app.secondary,
  borderRadius: 10,
  height: 50,
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 10,
  borderWidth: StyleSheet.hairlineWidth
},
buttonText:{
 fontSize: SIZES.sm,
 color: Colors.app.texteLight
}
})