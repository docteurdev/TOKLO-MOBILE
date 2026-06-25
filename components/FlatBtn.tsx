import { AppTheme, useAppTheme } from '@/hooks/useAppTheme'
import { Rs } from '@/util/comon'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

type Props = {
  action?: () => void
  bg?: string
}

const FlatBtn = ({action}: Props) => {
   const theme = useAppTheme();
   const styles = React.useMemo(() => createStyles(theme), [theme]);
   const buttonColor = theme.primary;

   const addButtonScale = useSharedValue(1);

   const addButtonAnimatedStyle = useAnimatedStyle(() => {
     return {
       transform: [{ scale: addButtonScale.value }],
     };
   });
 
 

  return (
    <View>
       <Animated.View style={[styles.addButtonContainer, addButtonAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.addButton, {backgroundColor: buttonColor}]}
          onPress={() => {
            addButtonScale.value = withSpring(0.9, {}, () => {
              addButtonScale.value = withSpring(1);
            });
            action?.()

          }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

    </View>
  )
}

export default FlatBtn

const createStyles = (theme: AppTheme) => StyleSheet.create({
   addButtonContainer: {
    position: "absolute",
    bottom: Rs(65),
    right: 24,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.background === '#FFFDF8' ? "#000" : theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

})
