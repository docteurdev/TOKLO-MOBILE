import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PRODUCT_COLORS } from './product-theme'

export default function ProductFooterActions() {
  return (
    <View style={styles.footer}>
      <Pressable style={styles.draftButton}>
        <Text style={styles.draftText}>Enregistrer en brouillon</Text>
      </Pressable>
      <Pressable style={styles.continueButton}>
        <Text style={styles.continueText}>Continuer →</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
    paddingBottom: 18,
  },
  draftButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRODUCT_COLORS.card,
    paddingHorizontal: 12,
  },
  draftText: {
    color: PRODUCT_COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  continueButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRODUCT_COLORS.gold,
    paddingHorizontal: 12,
    shadowColor: PRODUCT_COLORS.gold,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  continueText: {
    color: PRODUCT_COLORS.card,
    fontSize: 14,
    fontWeight: '900',
  },
})
