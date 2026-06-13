import { Rs } from '@/util/comon'
import React, { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { PRODUCT_COLORS } from './product-theme'

type Props = {
  children: ReactNode
  icon?: ReactNode
  title: string
}

export default function FormSectionCard({ children, icon, title }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text style={styles.title}>{title}</Text>
      </View>

      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Rs(10),
    backgroundColor: PRODUCT_COLORS.card,
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.border,
    padding: Rs(10),
    marginBottom: 18,
    shadowColor: PRODUCT_COLORS.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Rs(12),
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRODUCT_COLORS.cream,
  },
  title: {
    flex: 1,
    color: PRODUCT_COLORS.text,
    fontSize: Rs(15),
    fontWeight: '800',
  },
})
