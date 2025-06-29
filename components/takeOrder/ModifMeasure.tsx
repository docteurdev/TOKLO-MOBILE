import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import React, { memo, useState } from "react";
import { Feather} from "@expo/vector-icons";
import { Rs, SCREEN_WIDTH, SIZES } from "@/util/comon";
import { Colors } from "@/constants/Colors";

type TmodifMeasure = {
  onChangeValue: (name: string, value: string) => void;

}

const ModifMeasure = ({ image, title, value,onChangeValue,  }) => {

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.app.secondary,
        // borderWidth: StyleSheet.hairlineWidth,
        margin: SCREEN_WIDTH * 0.01,
        borderRadius: 8,
        padding: 4,
        width: SCREEN_WIDTH * 0.4,
        height: Rs(50),
        boxShadow: Colors.shadow.card,

      }}
    >
     {/* {image? <Image
        source={image}
        resizeMode="cover"
        style={{
          width: 35,
          height: 35,
          borderRadius: 50,
        }}
      /> : <View style={{width: 35, height: 35, backgroundColor: 'white', borderRadius: 18, justifyContent: "center", alignItems: "center"}}>
              <Feather name="image" size={18} color={Colors.app.primary} />
           </View>
         } */}

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
            //textAlign: "center"
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <TextInput
          style={{
            marginLeft: 6,
            fontFamily: "fontRegular",
            backgroundColor: "white",
            textAlign: "center",
            borderRadius: 8,
            color: Colors.app.texteLight,
            fontSize: SIZES.sm - 2,
            paddingHorizontal: 6,
            borderWidth: 1,
            borderColor: Colors.app.disabled,
            height: '60%',
          }}
          value={value}
          onChangeText={onChangeValue}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});
export default memo(ModifMeasure);
