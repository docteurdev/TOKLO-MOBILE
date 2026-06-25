import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { Rs, SIZES } from '@/util/comon';
import { Feather } from '@expo/vector-icons';
import * as React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { useFormScroll } from './FormWrapper';

interface Props extends TextInputProps {
  label?: string;
  iconL?: string;
  iconR?: string;
  isDescr?: boolean;
  isPassword?: boolean;
  handleChange: (text: string) => void;
  handleOnBlur: (e: any) => void;
  value?: string;
  error?: string;
  touched?: boolean;
  placeholder?: string;
}

const CustomInput = ({ isDescr, label, value, handleOnBlur, handleChange, error, touched, keyboardType, isPassword, placeholder }: Props) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [isPw, setIsPw] = React.useState(isPassword);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);
  const formScroll = useFormScroll();

  return (
    <View style={{ position: 'relative', width: "100%", height: 83, marginBottom: 10 }}>
      <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
      <TextInput
        ref={inputRef}
        keyboardType={keyboardType}
        secureTextEntry={isPw}
        multiline={isDescr ? true : false}
        placeholder={placeholder ?? "Entrez ..."}
        placeholderTextColor={theme.muted}
        value={value}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && touched && styles.inputError
        ]}
        onChangeText={handleChange}
        onBlur={(e) => {
          setIsFocused(false);
          handleOnBlur(e);
        }}
        onFocus={() => {
          setIsFocused(true);
          formScroll?.scrollToInput(inputRef);
        }}
      />
      {isPassword && (
        <TouchableOpacity style={{ position: 'absolute', right: Rs(10), top: Rs(40), zIndex: 50 }} onPress={() => { setIsPw(!isPw) }}>
          <Feather name='eye' size={20} color={theme.muted} />
        </TouchableOpacity>
      )}
      {error && touched && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  label: {
    fontSize: SIZES.sm,
    color: theme.muted,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  required: {
    color: theme.danger,
  },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: SIZES.xs,
    color: theme.text,
    padding: 10,
    height: 50,
  },
  inputFocused: {
    borderColor: theme.primary,
    borderWidth: 1,
  },
  inputError: {
    borderColor: theme.danger,
    borderWidth: 1,
  },
  errorText: {
    color: theme.danger,
    fontSize: SIZES.xs,
  }
});

export default CustomInput;
