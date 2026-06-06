import { Colors } from "@/constants/Colors";
import { base } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import React, { memo, useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { PhotoIcon } from "react-native-heroicons/solid";

type TmodifMeasure = {
  image?: string;
  title?: string;
  value: string;
  onChangeValue: (name: string, value: string) => void;
  measurementKey?: string;
  onFocus?: () => void;
}

const resolveImageUrl = (url?: string) => {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const cleanUrl = url.replace(/^\/+/, "");
  const uploadPath =
    cleanUrl.startsWith("uploads/") || cleanUrl.includes("/")
      ? cleanUrl
      : `uploads/${cleanUrl}`;

  return `${base}${uploadPath}`;
};

const ModifMeasure = ({ image, title, value, onChangeValue, measurementKey, onFocus }: TmodifMeasure) => {
  const imageUrl = resolveImageUrl(image);
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(imageUrl) && !hasImageError;

  return (
    <View
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            resizeMode="cover"
            style={styles.image}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <PhotoIcon fill={Colors.app.primary} size={Rs(26)} />
        )}
      </View>

      <View
       style={styles.content}
      >
        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => onChangeValue(measurementKey || '', text)}
          onFocus={onFocus}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.app.secondary,
    borderRadius: 8,
    padding: Rs(6),
    width: "48%",
    height: Rs(66),
    boxShadow: Colors.shadow.card,
    position: "relative",
  },
  imageContainer: {
    position: "absolute",
    left: Rs(6),
    top: Rs(13),
    width: Rs(48),
    height: Rs(48),
    borderRadius: Rs(20),
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  },
  content: {
    position: "absolute",
    left: Rs(54),
    right: Rs(6),
    top: Rs(7),
    bottom: Rs(6),
  },
  title: {
    marginLeft: 6,
    marginTop: -3,
    fontFamily: "fontMedium",
    fontSize: 12,
    color: Colors.app.texteLight,
  },
  input: {
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
    height: Rs(35),
  },
});

export default memo(ModifMeasure);
