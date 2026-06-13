import { MinusIcon, PlusIcon } from 'react-native-heroicons/solid'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PRODUCT_COLORS } from './product-theme'

type Props = {
  value: number
  onChange: (value: number) => void
}

export default function StockInput({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.control} onPress={() => onChange(Math.max(0, value - 1))}>
        <MinusIcon size={18} color={PRODUCT_COLORS.gold} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable style={styles.control} onPress={() => onChange(value + 1)}>
        <PlusIcon size={18} color={PRODUCT_COLORS.gold} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.inputBorder,
    backgroundColor: PRODUCT_COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  control: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PRODUCT_COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: PRODUCT_COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
})
