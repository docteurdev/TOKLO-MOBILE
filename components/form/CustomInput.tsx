import { Colors } from '@/constants/Colors';
import { Rs, SIZES } from '@/util/comon';
import * as React from 'react';
import { TextInputProps, TextInput, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'

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
  const [isPw, setIsPw] = React.useState(isPassword);
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={{ position: 'relative', width: "100%", height: 83, marginBottom: 10 }}>
      <Text style={styles.label}>{label} <Text style={{ color: Colors.app.error }}>*</Text></Text>
      <TextInput
        keyboardType={keyboardType}
        secureTextEntry={isPw}
        multiline={isDescr ? true : false}
        placeholder={placeholder ?? "Entrez ..."}
        placeholderTextColor={Colors.app.texteLight}
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
        onFocus={() => setIsFocused(true)}
      />
      {isPassword && (
        <TouchableOpacity style={{ position: 'absolute', right: Rs(10), top: Rs(45), zIndex: 50 }} onPress={() => { setIsPw(!isPw) }}>
          <Feather name='eye' size={20} color={Colors.app.texteLight} />
        </TouchableOpacity>
      )}
      {error && touched && <Text style={{ color: Colors.app.error, fontSize: SIZES.xs }}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: SIZES.sm,
    color: Colors.app.texteLight,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.app.texteLight,
    borderRadius: SIZES.xs,
    padding: 10,
    height: 50,
  },
  inputFocused: {
    borderColor: Colors.app.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: Colors.app.error,
    borderWidth: 2,
  }
});

export default CustomInput;