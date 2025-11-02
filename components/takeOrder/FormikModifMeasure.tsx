import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { memo } from "react";
import { Feather} from "@expo/vector-icons";
import { Rs, SCREEN_WIDTH, SIZES } from "@/util/comon";
import { Colors } from "@/constants/Colors";
import { useOptimizedFormikField } from "@/hooks/useOptimizedFormikField";

type FormikModifMeasureProps = {
  name: string;
  title: string;
  image?: string;
}

const FormikModifMeasure: React.FC<FormikModifMeasureProps> = ({ name, title, image }) => {
  // Utilisation du hook optimisé avec un délai très court pour les mesures
  const { value, onChangeText, onBlur, meta } = useOptimizedFormikField(name, 150);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.app.secondary,
        margin: SCREEN_WIDTH * 0.01,
        borderRadius: 8,
        padding: 4,
        width: SCREEN_WIDTH * 0.4,
        height: Rs(50),
        boxShadow: Colors.shadow.card,
      }}
    >
      <View
       style={{
        width: "70%"
       }}
      >
        <Text
          style={{
            marginLeft: 6,
            marginTop: -3,
            fontFamily: "fontMedium",
            fontSize: 12,
            color: Colors.app.texteLight
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <TextInput
          style={[
            {
              marginLeft: 6,
              fontFamily: "fontRegular",
              backgroundColor: "white",
              textAlign: "center",
              borderRadius: 8,
              color: Colors.app.texteLight,
              fontSize: SIZES.sm - 2,
              paddingHorizontal: 6,
              borderWidth: 1,
              height: '60%',
            },
            {
              borderColor: meta.touched && meta.error ? Colors.app.error : Colors.app.disabled,
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={Colors.app.texteLight}
        />
        {meta.touched && meta.error && (
          <Text style={styles.errorText}>{meta.error}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    fontSize: 10,
    color: Colors.app.error,
    marginLeft: 6,
    marginTop: 2,
  }
});

export default memo(FormikModifMeasure);