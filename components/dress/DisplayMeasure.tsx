import { Colors } from "@/constants/Colors";
import { base } from "@/util/axios";
import { colors, Rs, SIZES } from "@/util/comon";
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

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: colors.lightOrange,
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
    backgroundColor: Colors.app.warning,
    borderRadius: Rs(10),
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: Colors.app.black,
    fontSize: SIZES.xs,
  },
  value: {
    fontWeight: "bold",
    fontSize: SIZES.sm,
    color: Colors.app.texteLight,
  },
});
