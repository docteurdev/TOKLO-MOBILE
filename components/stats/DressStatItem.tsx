import { Colors } from '@/constants/Colors';
import { formatXOF, Rs, SIZES } from '@/util/comon';
import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
  withSequence,
  withDelay,
  useAnimatedReaction,
  useAnimatedStyle
} from 'react-native-reanimated';

type TDressStatItem = {
 no: number
 label: string;
 amount: number;
 icon: ReactNode;
 iconBgColor: string;
 percent: string
};


// Create animated text components
const AnimatedText = Animated.createAnimatedComponent(Text);


function DressStatItem({ no, percent, label, amount, icon, iconBgColor }: TDressStatItem) {
 // State values for the display text (updated during animation)
 const [displayAmount, setDisplayAmount] = useState('0');
 const [displayNo, setDisplayNo] = useState('0');
 const [displayPercent, setDisplayPercent] = useState('0%');
 
 // Shared values for animations
 const animatedAmount = useSharedValue(0);
 const animatedNo = useSharedValue(0);
 const animatedPercent = useSharedValue(0);
 const animatedOpacity = useSharedValue(0);
 const animatedScale = useSharedValue(0.9);

 // Update the display values when animated values change
 const updateDisplayAmount = (value: number) => {
   setDisplayAmount(formatXOF(Math.floor(value)));
 };

 const updateDisplayNo = (value: number) => {
   setDisplayNo(Math.floor(value).toString());
 };

 const updateDisplayPercent = (value: number) => {
   setDisplayPercent(`${Math.floor(value)}%`);
 };

 // Start animations when the component mounts or when props change
 useEffect(() => {
   // Reset animated values
   animatedAmount.value = 0;
   animatedNo.value = 0;
   animatedPercent.value = 0;
   
   // Set up animation completion callbacks
   const amountCallback = (finished?: boolean) => {
     if (finished) {
       runOnJS(updateDisplayAmount)(Number(amount));
     }
   };

   const noCallback = (finished?: boolean) => {
     if (finished) {
       runOnJS(updateDisplayNo)(Number(no));
     }
   };

   const percentCallback = (finished?: boolean) => {
     if (finished) {
       runOnJS(updateDisplayPercent)(Number(percent));
     }
   };
   
   // Animate opacity and scale with a small delay
   animatedOpacity.value = withSequence(
     withTiming(0, { duration: 100 }),
     withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
   );
   
   animatedScale.value = withSequence(
     withTiming(0.9, { duration: 100 }),
     withTiming(1, { duration: 400, easing: Easing.out(Easing.back()) })
   );

   // Start with initial display values
   updateDisplayAmount(0);
   updateDisplayNo(0);
   updateDisplayPercent(0);

   // Schedule value updates during animation
   const intervalAmount = setInterval(() => {
     const current = animatedAmount.value;
     const target = Number(amount);
     const increment = Math.max(1, Math.floor((target - current) / 20));
     const next = Math.min(current + increment, target);
     animatedAmount.value = next;
     runOnJS(updateDisplayAmount)(next);
     if (next >= target) clearInterval(intervalAmount);
   }, 30);

   const intervalNo = setInterval(() => {
     const current = animatedNo.value;
     const target = Number(no);
     const increment = Math.max(1, Math.floor((target - current) / 15));
     const next = Math.min(current + increment, target);
     animatedNo.value = next;
     runOnJS(updateDisplayNo)(next);
     if (next >= target) clearInterval(intervalNo);
   }, 40);

   const intervalPercent = setInterval(() => {
     const current = animatedPercent.value;
     const target = Number(percent);
     const increment = Math.max(1, Math.floor((target - current) / 15));
     const next = Math.min(current + increment, target);
     animatedPercent.value = next;
     runOnJS(updateDisplayPercent)(next);
     if (next >= target) clearInterval(intervalPercent);
   }, 40);

   // Clear intervals on cleanup
   return () => {
     clearInterval(intervalAmount);
     clearInterval(intervalNo);
     clearInterval(intervalPercent);
   };
 }, [amount, no, percent]); // Re-run animation when these props change

 // Create animated styles
 const containerAnimatedStyle = useAnimatedStyle(() => {
   return {
     opacity: animatedOpacity.value,
     transform: [{ scale: animatedScale.value }]
   };
 });

 return (
   <Animated.View
    
     style={[
       {
         flexDirection: "row",
         gap: Rs(20),
         justifyContent: "space-between",
         alignItems: "center",
       },
       containerAnimatedStyle
     ]}
   >
     <View style={[styles.iconBgColor, { backgroundColor: iconBgColor }]}>
       {icon}
     </View>

     <View
       style={{
         flex: 1,
         flexDirection: "row",
         justifyContent: "space-between",
       }}
     >
       <View style={{ gap: Rs(10) }}>
         <Text style={{ fontSize: SIZES.md, color: Colors.app.texteLight }}>
           {label}
         </Text>
         <Text style={{ fontSize: SIZES.lg, color: Colors.app.primary }}>
           {displayAmount}
         </Text>
       </View>
       <View style={{ gap: Rs(10) }}>
         <Text style={{ fontSize: SIZES.md, color: Colors.app.texteLight }}>
           {displayNo}
         </Text>
         <Text style={{ fontSize: SIZES.xs, color: Colors.app.primary }}>
           {displayPercent}
         </Text>
       </View>
     </View>
   </Animated.View>
 );
}



const styles = StyleSheet.create({
  year: {
    padding: 10,
    alignItems: "center",
    alignSelf: "center",
    width: Rs(130),
    backgroundColor: "white",
    marginBottom: 20,
    borderRadius: Rs(50),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.app.texteLight,
  },
  iconBgColor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: Rs(40),
    height: Rs(40),
    borderRadius: Rs(20),
    boxShadow: Colors.shadow.card,
  },
  blurContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.1)",
    zIndex: 100,
    right: 0,
    left: 0,
    bottom: 0,
    width: "100%",
    height: Rs(70),
    paddingHorizontal: Rs(20),
    paddingBlock: Rs(10),
  },
});


export default DressStatItem;