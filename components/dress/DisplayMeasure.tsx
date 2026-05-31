import { Colors } from "@/constants/Colors";
import { base } from "@/util/axios";
import { colors, Rs, SIZES } from "@/util/comon";
import { Image, Text, View } from "react-native";

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
   <View
     style={{
       justifyContent: "center",
       alignItems: "center",
       flexDirection: "row",
       backgroundColor: colors.lightOrange,
       margin: Rs(2),
       borderRadius: Rs(6),
       padding: Rs(6),
       minWidth: Rs(70),
       maxWidth: Rs(200),
       height: Rs(80)
     }}
   >
      {imageUrl ? (
        <Image
          source={{ uri:imageUrl }}
          resizeMode="cover"
          style={{ width: Rs(60), height: Rs(60), marginBottom: Rs(2) }}
        />
      ) : (
        <View style={{width: 15, height: 15, backgroundColor: Colors.app.warning, borderRadius: 10}} />
      )}
     <View
     style={{ alignItems: "center", justifyContent: "center"}}
     >

       <Text
         style={{
           marginLeft: 3,
           color: Colors.app.black,
           fontSize: SIZES.xs,
         }}
         numberOfLines={1}
       >
         {title}:
       </Text>
       <Text
         style={{
           marginLeft: 2,
           fontWeight: "bold",
           fontSize: SIZES.sm,
           color: Colors.app.texteLight

         }}
       >
         {value}
       </Text>
     </View>
   </View>
 );
};
