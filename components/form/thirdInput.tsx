import React, { ReactNode, useState } from 'react';
import {
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

interface CustomTextInputProps extends TextInputProps {
  leftIcon?:  ReactNode; //React.ComponentType<IconProps>;
  rightIcon?: ReactNode; // React.ComponentType<IconProps>;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  iconSize?: number;
  iconColor?: string;
  isPassword?: boolean;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconPress,
  onLeftIconPress,
  containerStyle,
  inputStyle,
  iconSize = 24,
  iconColor = '#666',
  isPassword = false,
  secureTextEntry,
  ...restProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {LeftIcon && (
        <TouchableOpacity
          onPress={onLeftIconPress}
          style={styles.iconContainer}
          disabled={!onLeftIconPress}
        >
         {LeftIcon}
        </TouchableOpacity>
      )}

      <TextInput
        style={[
          styles.input,
          // inputStyle,
          LeftIcon && styles.inputWithLeftIcon,
          (RightIcon || isPassword) && styles.inputWithRightIcon,
        ]}
        secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
        {...restProps}
      />

      {(RightIcon || isPassword) && (
        <TouchableOpacity
          onPress={isPassword ? togglePasswordVisibility : onRightIconPress}
          style={styles.iconContainer}
          disabled={!onRightIconPress && !isPassword}
        >
          {RightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 12,
  },
  inputWithRightIcon: {
    paddingRight: 12,
  },
  iconContainer: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Usage Example:
/*
import { MaterialIcons } from '@expo/vector-icons';

<CustomTextInput
  placeholder="Enter password"
  leftIcon={props => <MaterialIcons name="lock" {...props} />}
  rightIcon={props => <MaterialIcons name={isPasswordVisible ? "visibility" : "visibility-off"} {...props} />}
  isPassword
  onChangeText={text => console.log(text)}
/>
*/