import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { PRODUCT_COLORS } from './product-theme'

type Props = {
  currentStep?: number
}

const steps = ['Informations', 'Détails', 'Images', 'Publication']

export function ProductStepper({ currentStep = 0 }: Props) {
  const safeStep = Math.min(Math.max(currentStep, 0), steps.length - 1)

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === safeStep
        const isCompleted = index < safeStep
        const stepColor = isActive || isCompleted ? PRODUCT_COLORS.gold : PRODUCT_COLORS.border

        return (
          <React.Fragment key={step}>
            <View style={styles.step}>
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor: isActive || isCompleted ? PRODUCT_COLORS.gold : PRODUCT_COLORS.card,
                    borderColor: stepColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.indicatorText,
                    { color: isActive || isCompleted ? PRODUCT_COLORS.card : PRODUCT_COLORS.muted },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>

              <Text style={[styles.label, { color: stepColor }]} numberOfLines={1}>
                {step}
              </Text>
            </View>

            {index < steps.length - 1 && (
              <View
                style={[
                  styles.separator,
                  { borderTopColor: isCompleted ? PRODUCT_COLORS.gold : PRODUCT_COLORS.border },
                ]}
              />
            )}
          </React.Fragment>
        )
      })}
    </View>
  )
}

export default ProductStepper

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 18,
    paddingBottom: 24,
  },
  step: {
    width: 72,
    alignItems: 'center',
  },
  indicator: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: {
    fontSize: 13,
    fontWeight: '800',
  },
  label: {
    width: '100%',
    marginTop: 8,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  separator: {
    flex: 1,
    marginTop: 19,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
})
