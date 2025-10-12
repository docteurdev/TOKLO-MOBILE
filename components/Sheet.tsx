import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/util/comon"
import { TrueSheet } from "@lodev09/react-native-true-sheet"
import { useRef } from "react"
import { Button } from "react-native"
import { View } from "react-native"

type SheetProps = {
  children: React.ReactNode;
  sheet: React.RefObject<TrueSheet>
}

export const Sheet = ({children, sheet}: SheetProps) => {
 

 return (
   <View>
     <TrueSheet
       ref={sheet}
       sizes={['auto','69%', 'large']}
       cornerRadius={24}
       style={{width: SCREEN_WIDTH}}
     >
     
       {children}
     </TrueSheet>
   </View>
 )
}