// components/form/BottomSheetInput.tsx
import React, { useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  TextInputProps,
  KeyboardTypeOptions,
} from "react-native";
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { SIZES } from "@/util/comon";

interface Props {
  label?: string;
  placeholder?: string;
  value?: string;
  icon?: React.ReactNode;
  textContentType?: TextInputProps["textContentType"];
  setValue: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  isPassword?: boolean;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

const BottomSheetInput = React.memo(({
  label,
  placeholder,
  value,
  icon,
  textContentType,
  setValue,
  keyboardType,
  autoFocus,
  isPassword,
  error,
  touched,
  required
}: Props) => {
  const [secureInput, setSecureInput] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  const toggleSecureInput = useCallback(() => {
    setSecureInput((prev) => !prev);
  }, []);

  return (
    <View style={{ marginBottom: 10 }}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: Colors.app.error }}>*</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && touched && styles.inputError,
        ]}
      >
        {icon && <View style={styles.iconLeft}>{icon}</View>}

        <BottomSheetTextInput
          value={value}
          style={styles.input}
          onChangeText={setValue}
          placeholder={placeholder}
          keyboardType={keyboardType}
          textContentType={textContentType}
          autoFocus={autoFocus}
          secureTextEntry={secureInput}
          placeholderTextColor={Colors.app.texteLight}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isPassword && (
          <TouchableOpacity style={styles.iconRight} onPress={toggleSecureInput}>
            <Feather
              name={secureInput ? "eye-off" : "eye"}
              size={18}
              color={Colors.app.texteLight}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && touched && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  inputWrapper: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    borderColor: Colors.app.disabled,
    backgroundColor: "white",
  },
  inputFocused: {
    borderColor: Colors.app.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: Colors.app.error,
    borderWidth: 2,
  },
  iconLeft: {
    borderRightWidth: 1,
    borderColor: Colors.app.secondary,
    height: "100%",
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRight: {
    position: "absolute",
    right: 10,
    top: 15,
  },
  input: {
    flex: 1,
    color: Colors.app.texteLight,
    paddingHorizontal: 10,
    fontFamily: "fontRegular",
    height: "100%",
  },
  label: {
    color: Colors.app.texteLight,
    fontSize: SIZES.sm,
    fontFamily: "fontRegular",
    marginBottom: 3,
  },
  error: {
    color: Colors.app.error,
    fontFamily: "fontRegular",
    marginTop: 5,
  },
});

export default BottomSheetInput;