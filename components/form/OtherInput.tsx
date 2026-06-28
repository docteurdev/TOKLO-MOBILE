import React, { memo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
} from 'react-native';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';

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
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

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
          placeholderTextColor={theme.muted}
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: theme.muted,
  },
  required: {
    color: theme.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.background,
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: theme.text,
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
