import { Rs } from '@/util/comon'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PRODUCT_COLORS } from './product-theme'

const genders = ['Femme', 'Homme', 'Unisexe']

type Props = {
  value: string
  onChange: (value: string) => void
}

export default function GenderSelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {genders.map((gender) => {
        const isActive = value === gender

        return (
          <Pressable
            key={gender}
            onPress={() => onChange(gender)}
            style={[styles.button, isActive && styles.buttonActive]}
          >
            <Text style={[styles.buttonText, isActive && styles.buttonTextActive]}>{gender}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    minHeight: Rs(35),
    borderRadius: Rs(8),
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.inputBorder,
    backgroundColor: PRODUCT_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    borderColor: PRODUCT_COLORS.gold,
    backgroundColor: PRODUCT_COLORS.softGold,
  },
  buttonText: {
    color: PRODUCT_COLORS.muted,
    fontSize: Rs(10),
    fontWeight: '400',
  },
  buttonTextActive: {
    color: PRODUCT_COLORS.gold,
  },
})
