import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { memo } from "react";
import { SIZES } from "@/util/comon";
import { Colors } from "@/constants/Colors";
import { useOptimizedFormikField } from "@/hooks/useOptimizedFormikField";

type FormikOtherInputProps = {
  name: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
}

const FormikOtherInput: React.FC<FormikOtherInputProps> = ({ 
  name, 
  label, 
  placeholder, 
  icon, 
  required = false, 
  keyboardType = "default" 
}) => {
  // Utilisation du hook optimisé
  const { value, onChangeText, onBlur, meta } = useOptimizedFormikField(name, 250);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      </View>
      
      <View style={[
        styles.inputContainer,
        meta.touched && meta.error ? styles.inputError : styles.inputNormal
      ]}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.app.texteLight}
          keyboardType={keyboardType}
        />
      </View>
      
      {meta.touched && meta.error && (
        <Text style={styles.errorText}>{meta.error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: SIZES.sm,
    color: Colors.app.texte,
    fontWeight: '500',
  },
  required: {
    color: Colors.app.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 12,
  },
  inputNormal: {
    borderColor: Colors.app.disabled,
  },
  inputError: {
    borderColor: Colors.app.error,
  },
  iconContainer: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: SIZES.sm,
    color: Colors.app.texte,
  },
  errorText: {
    fontSize: SIZES.xs,
    color: Colors.app.error,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default memo(FormikOtherInput);