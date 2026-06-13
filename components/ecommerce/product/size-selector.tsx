import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PlusIcon } from 'react-native-heroicons/solid'
import { PRODUCT_COLORS } from './product-theme'

const sizes = ['S', 'M', 'L', 'XL', 'XXL']

type Props = {
  selectedSizes: string[]
  onToggle: (size: string) => void
}

export default function SizeSelector({ selectedSizes, onToggle }: Props) {
  return (
    <View style={styles.container}>
      {sizes.map((size) => {
        const isActive = selectedSizes.includes(size)

        return (
          <Pressable
            key={size}
            onPress={() => onToggle(size)}
            style={[styles.sizeButton, isActive && styles.sizeButtonActive]}
          >
            <Text style={[styles.sizeText, isActive && styles.sizeTextActive]}>{size}</Text>
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
  sizeButton: {
    minWidth: 40,
    height: 35,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.inputBorder,
    backgroundColor: PRODUCT_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sizeButtonActive: {
    borderColor: PRODUCT_COLORS.gold,
    backgroundColor: PRODUCT_COLORS.gold,
  },
  sizeText: {
    color: PRODUCT_COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  sizeTextActive: {
    color: PRODUCT_COLORS.card,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.border,
    backgroundColor: PRODUCT_COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
