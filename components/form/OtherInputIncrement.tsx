import { Colors } from '@/constants/Colors';
import React, { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View
} from 'react-native';

interface OtherInputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  value: string;
  setValue: (text: string) => void;
  min?: number;
  max?: number;
  step?: number;
}

const OtherInputIncrement: React.FC<OtherInputProps> = memo(({
  label,
  required,
  icon: _icon,
  value,
  setValue,
  min = 1,
  max,
  step = 1,
  ...props
}) => {
  const currentValue = Number(value);
  const canDecrement = !Number.isFinite(currentValue) || currentValue > min;
  const canIncrement = max === undefined || !Number.isFinite(currentValue) || currentValue < max;

  const updateValue = (direction: 'increment' | 'decrement') => {
    const numericValue = Number.isFinite(currentValue) ? currentValue : min;
    const nextValue =
      direction === 'increment' ? numericValue + step : numericValue - step;
    const limitedValue = Math.min(Math.max(nextValue, min), max ?? nextValue);

    setValue(String(limitedValue));
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <Pressable
          disabled={!canDecrement}
          onPress={() => updateValue('decrement')}
          style={({ pressed }) => [
            styles.actionButton,
            styles.leftActionButton,
            !canDecrement && styles.disabledButton,
            pressed && canDecrement && styles.pressedButton,
          ]}
        >
          <Text style={[styles.actionText, !canDecrement && styles.disabledText]}>-</Text>
        </Pressable>
        <TextInput
          style={[
            styles.input,
          ]}
          value={value}
          onChangeText={setValue}
          placeholderTextColor={Colors.app.disabled}
          numberOfLines={1}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        <Pressable
          disabled={!canIncrement}
          onPress={() => updateValue('increment')}
          style={({ pressed }) => [
            styles.actionButton,
            styles.rightActionButton,
            !canIncrement && styles.disabledButton,
            pressed && canIncrement && styles.pressedButton,
          ]}
        >
          <Text style={[styles.actionText, !canIncrement && styles.disabledText]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
});

OtherInputIncrement.displayName = 'OtherInputIncrement';

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: Colors.app.texteLight,
  },
  required: {
    color: 'red',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.app.disabled,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  actionButton: {
    width: 56,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.app.secondary,
  },
  leftActionButton: {
    borderRightWidth: 1,
    borderRightColor: Colors.app.disabled,
  },
  rightActionButton: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.app.disabled,
  },
  pressedButton: {
    backgroundColor: Colors.app.light,
  },
  disabledButton: {
    opacity: 0.45,
  },
  actionText: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    color: Colors.app.primary,
  },
  disabledText: {
    color: Colors.app.disabled,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.app.texteLight,
    textAlign: "center",
    fontWeight: "700"
  },
  // Platform specific optimizations
  iosInput: {
    padding: 8,
  },
  androidInput: {
    paddingVertical: 4,
  },
});

export default OtherInputIncrement;
