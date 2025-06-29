import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { SIZES } from '@/util/comon'

type Props = {
  isPending: boolean;
  handlePress: () => void;
  label: string
}

const BlowingBtn = ({ isPending , handlePress, label}: Props) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 })
  }

  return (
    <View>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View style={[animatedStyle]}>
          <LinearGradient
            colors={[Colors.app.primary, '#5E50EE']}
            start={[0, 0]}
            end={[1, 0]}
            style={styles.saveButton}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name="save-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={styles.saveButtonText}> {label} </Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

export default BlowingBtn

const styles = StyleSheet.create({
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#7367F0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
})
