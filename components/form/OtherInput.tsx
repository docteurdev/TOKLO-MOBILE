import React, { memo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface OtherInputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  value: string;
  setValue: (text: string) => void;
}

const OtherInput: React.FC<OtherInputProps> = memo(({
  label,
  required,
  icon,
  value,
  setValue,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View style={styles.inputContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            // Platform.select({
            //   ios: styles.iosInput,
            //   android: styles.androidInput,
            // }),
          ]}
          value={value}
          onChangeText={setValue}
          placeholderTextColor={Colors.app.disabled}
          numberOfLines={1}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
      </View>
    </View>
  );
});

OtherInput.displayName = 'OtherInput';

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
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.app.texteLight,
  },
  // Platform specific optimizations
  iosInput: {
    padding: 8,
  },
  androidInput: {
    paddingVertical: 4,
  },
});

export default OtherInput;