import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import { base } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

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

export const DisplayMeasure = ({ image, title, value }:{image?: string, title: string, value: string}) => {
 const theme = useAppTheme();
 const styles = React.useMemo(() => createStyles(theme), [theme]);
 const imageUrl = resolveImageUrl(image);

 return (
   <View style={styles.container}>
     <View style={styles.imageContainer}>
       {imageUrl ? (
        <Image
          source={{ uri:imageUrl }}
          resizeMode="cover"
          style={styles.image}
        />
      ) : (
        <View style={styles.imageFallback} />
      )}
     </View>

     <View style={styles.content}>

       <Text
         style={styles.title}
         numberOfLines={1}
       >
         {title}:
       </Text>
       <Text
         style={styles.value}
         numberOfLines={1}
       >
         {value}
       </Text>
     </View>
   </View>
 );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: theme.primaryLight,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    margin: Rs(2),
    borderRadius: Rs(6),
    padding: Rs(6),
    paddingLeft: Rs(68),
    minWidth: Rs(70),
    maxWidth: Rs(200),
    height: Rs(80),
    position: "relative",
    overflow: "hidden",
  },
  imageContainer: {
    position: "absolute",
    left: Rs(6),
    top: Rs(10),
    width: Rs(60),
    height: Rs(60),
    borderRadius: Rs(8),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    width: Rs(15),
    height: Rs(15),
    backgroundColor: theme.gold,
    borderRadius: Rs(10),
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: theme.text,
    fontSize: SIZES.xs,
  },
  value: {
    fontWeight: "bold",
    fontSize: SIZES.sm,
    color: theme.muted,
  },
});
