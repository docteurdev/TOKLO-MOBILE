import { Colors } from "@/constants/Colors";
import { Rs, SIZES } from "@/util/comon";
import { Image, Text, View } from "react-native";

export const DisplayMeasure = ({ image, title, value }:{image?: string, title: string, value: string}) => {
 return (
   <View
     style={{
       justifyContent: "center",
       alignItems: "center",
       backgroundColor: Colors.app.disabled,
       margin: Rs(2),
       borderRadius: Rs(6),
       padding: Rs(6),
       minWidth: Rs(70),
       maxWidth: Rs(200),
       height: Rs(60)
     }}
   >
      <View style={{width: 15, height: 15, backgroundColor: Colors.app.warning, borderRadius: 10}} />
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