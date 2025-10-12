import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  action?: () => void
  bg?: string
}

const FlatBtn = ({action, bg='#4F46E5'}: Props) => {

   const addButtonScale = useSharedValue(1);

   const  router = useRouter();

   const addButtonAnimatedStyle = useAnimatedStyle(() => {
     return {
       transform: [{ scale: addButtonScale.value }],
     };
   });
 
 

  return (
    <View>
       <Animated.View style={[styles.addButtonContainer, addButtonAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.addButton, {backgroundColor: bg}]}
          onPress={() => {
            addButtonScale.value = withSpring(0.9, {}, () => {
              addButtonScale.value = withSpring(1);
            });
            action?.()

          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

    </View>
  )
}

export default FlatBtn

const styles = StyleSheet.create({
   addButtonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

})