import { Colors } from "@/constants/Colors";
import useUserActiveToklomant from "@/hooks/mutations/userActiveToklomant";
import useNotif from "@/hooks/useNotification";
import { Rs, SIZES } from "@/util/comon";
import { isAxiosError } from "axios";
import React, { memo } from "react";
import { Text, View } from "react-native";
import CustomButton from "./form/CustomButton";
import PaymentLottieCompo from "./PaymentLottieCompo";

type Props = {
 closeBottomSheet: () => void;
};

const ActiveToklomanCompo = ({ closeBottomSheet }: Props) => {
 const { mutateAsync: subscribeMutate, isPending: isPendingSubscribe } = useUserActiveToklomant();


 const [showPaymentLottie, setShowPaymentLottie] = React.useState(false);

 const { handleNotification } = useNotif();

 const handleActivateTokloman = async () => {
   try {
     await subscribeMutate();
     setShowPaymentLottie(true);
     handleNotification(
       "success",
       "Activation",
       "Votre compte a bien été activé",
     );
     setTimeout(() => {
       closeBottomSheet();
     }, 6000);
   } catch (error) {
     if (isAxiosError(error)) {
       console.error("Activation error:", {
         status: error.response?.status,
         data: error.response?.data,
       });
     } else {
       console.error("Activation error:", error);
     }

     handleNotification(
       "error",
       "Activation",
       "Une erreur est survenue lors de l'activation de votre compte, veuillez réessayer",
     );
   }
 };


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
        Ne manquez pas l’occasion ! 🚀
        Activez dès aujourd’hui votre accès gratuit à Toklo et découvrez toutes nos fonctionnalités 100% offertes.
      </Text>

      <View style={{ marginHorizontal: 20, marginVertical: 6 }}>
        <CustomButton
          label="Activer mon compte"
          action={handleActivateTokloman}
          loading={isPendingSubscribe}
          disabled={true}
        />
      </View>

      {showPaymentLottie && <PaymentLottieCompo />}
    </View>
  );
};

export default memo(ActiveToklomanCompo);
