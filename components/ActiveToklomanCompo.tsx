import { StyleSheet, Text, View } from "react-native";
import React, { memo, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import CustomButton from "./form/CustomButton";
import { Rs, SIZES } from "@/util/comon";
import userActiveToklomant from "@/hooks/mutations/userActiveToklomant";
import PaymentLottieCompo from "./PaymentLottieCompo";
import { useUserStore } from "@/stores/user";
import useNotif from "@/hooks/useNotification";
import axios from "axios";

type Props = {
 closeBottomSheet: () => void;
};

const ActiveToklomanCompo = ({ closeBottomSheet }: Props) => {
 const { mutate: subscribeMutate, isPending: isPendingSubscribe, isSuccess } = userActiveToklomant(closeBottomSheet);


 const [showPaymentLottie, setShowPaymentLottie] = React.useState(false);

 const {user, subscribe} = useUserStore();
 const { handleNotification } = useNotif();

 // useEffect(() => {
   
 //    alert(isSuccess)
 //   return () => {
     
 //   }
 // }, [isSuccess])
 


 return (
    <View style={{ padding: Rs(20), gap: Rs(20) }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: Colors.app.texte,
            fontSize: SIZES.lg,
            fontWeight: "bold",
          }}
        >
          🎁 Activez votre mois gratuit !
        </Text>
        {/* <BackButton backAction={() => subscribeBottomSheet?.current?.dismiss() } icon={<XMarkIcon fill={Colors.app.texte} size={Rs(20)} />} /> */}
      </View>
      <Text style={{ color: Colors.app.texteLight }}>
        Profitez d'1 mois d'utilisation gratuite de Toklo! Activez votre offre
        dès maintenant et découvrez toutes nos fonctionnalités sans aucun frais.
      </Text>

      <View style={{ marginHorizontal: 20, marginVertical: 6 }}>
        <CustomButton
          label="Activer mon compte"
          action={() => {
           subscribeMutate(undefined,  {
               onSuccess: () => {
                setShowPaymentLottie(true)
                 setTimeout(() => {
                   closeBottomSheet()
                 }, 6000)
                 handleNotification("success", "Activation", "Votre compte a bien été activé")
               },
               onError: (error) => {
                 if(axios.isAxiosError(error)) {
                   console.error("Order submission error:", error.response?.status);
                   handleNotification("error", "Activation", "Une erreur est survenue lors de l'activation de votre compte, veuillez réessayer");
                   
                   
                 }
                 console.error("Order submission error:", error);
               },
           })
          }}
          loading={isPendingSubscribe}
          disabled={true}
        />
      </View>

      {showPaymentLottie && <PaymentLottieCompo />}
    </View>
  );
};

export default memo(ActiveToklomanCompo);

const styles = StyleSheet.create({});
