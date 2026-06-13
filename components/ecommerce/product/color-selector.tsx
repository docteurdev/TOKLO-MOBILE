import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { PlusIcon } from 'react-native-heroicons/solid'
import { PRODUCT_COLORS } from './product-theme'

const productColors = ['#1F1F1F', '#2563EB', '#B91C1C', '#15803D', '#D9C7A2']

type Props = {
  selectedColors: string[]
  onToggle: (color: string) => void
}

export default function ColorSelector({ selectedColors, onToggle }: Props) {
  return (
    <View style={styles.container}>
      {productColors.map((color) => {
        const isActive = selectedColors.includes(color)

        return (
          <Pressable
            key={color}
            onPress={() => onToggle(color)}
            style={[styles.colorShell, isActive && styles.colorShellActive]}
          >
            <View style={[styles.colorDot, { backgroundColor: color }]} />
          </Pressable>
        )
      })}

      <Pressable style={styles.addButton}>
        <PlusIcon size={18} color={PRODUCT_COLORS.gold} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorShell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.inputBorder,
    backgroundColor: PRODUCT_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorShellActive: {
    borderColor: PRODUCT_COLORS.gold,
    borderWidth: 2,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.border,
    backgroundColor: PRODUCT_COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
