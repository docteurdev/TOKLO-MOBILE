import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme'
import { SIZES } from '@/util/comon'

function ItemChild({label, icon}: {label: string, icon: React.ReactNode}) {
 const theme = useAppTheme();
 const styles = React.useMemo(() => createStyles(theme), [theme]);

 return (
   <View style={{flexDirection: "row", alignItems: "center", gap: 6}} >
     <View style={styles.iconContainer} >
      {icon}
     </View>
     <Text numberOfLines={1} style={[styles.labelText]}> {label} </Text>
   </View>
 )
}


export default ItemChild

const createStyles = (theme: AppTheme) => StyleSheet.create({
  iconContainer: {
    width: 35,
     height: 35,
     borderRadius:"100%",
     justifyContent: "center",
     alignItems: "center",
     backgroundColor: theme.goldLight,
  },
  labelText: {
    color: theme.muted,
    fontSize: SIZES.sm - 2,
  },
})
