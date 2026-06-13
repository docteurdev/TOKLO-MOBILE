import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { PRODUCT_COLORS } from './product-theme'

type Props = {
  value: boolean
  onChange: (value: boolean) => void
}

export default function ProductCustomSwitch({ value, onChange }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.switch, value && styles.switchActive]}
    >
      <View style={[styles.thumb, value && styles.thumbActive]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  switch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    padding: 3,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: PRODUCT_COLORS.gold,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRODUCT_COLORS.card,
    shadowColor: PRODUCT_COLORS.text,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumbActive: {
    transform: [{ translateX: 22 }],
  },
})
