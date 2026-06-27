import useUserActiveToklomant from "@/hooks/mutations/userActiveToklomant";
import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import useNotif from "@/hooks/useNotification";
import { Rs, SIZES } from "@/util/comon";
import { isAxiosError } from "axios";
import React, { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "./form/CustomButton";
import PaymentLottieCompo from "./PaymentLottieCompo";

type Props = {
 closeBottomSheet: () => void;
 onActivationSuccess?: () => void;
};

const ActiveToklomanCompo = ({ closeBottomSheet, onActivationSuccess }: Props) => {
 const theme = useAppTheme();
 const styles = useMemo(() => createStyles(theme), [theme]);
 const { mutateAsync: subscribeMutate, isPending: isPendingSubscribe } = useUserActiveToklomant();


 const [showPaymentLottie, setShowPaymentLottie] = React.useState(false);
 const [isActivationSuccess, setIsActivationSuccess] = React.useState(false);

 const { handleNotification } = useNotif();

 const handleActivateTokloman = async () => {
   try {
     await subscribeMutate();
     setShowPaymentLottie(true);
     setIsActivationSuccess(true);
     handleNotification(
       "success",
       "Activation",
       "Votre compte a bien été activé",
     );
     setTimeout(() => {
       onActivationSuccess?.();
     }, 900);
     setTimeout(() => {
       closeBottomSheet();
     }, 1400);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          🎁 Activez votre mois gratuit !
        </Text>
      </View>
      <Text style={styles.description}>
        Ne manquez pas l’occasion !
        Activez dès aujourd’hui votre accès gratuit à Toklo et découvrez toutes nos fonctionnalités 100% offertes.
      </Text>

      {isActivationSuccess && (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Activation réussie</Text>
          <Text style={styles.successText}>
            Votre mois gratuit est maintenant actif.
          </Text>
        </View>
      )}

      <View style={styles.buttonWrap}>
        <CustomButton
          label={isActivationSuccess ? "Compte activé" : "Activer mon compte"}
          action={handleActivateTokloman}
          loading={isPendingSubscribe}
          disabled={true}
          pressDisabled={isActivationSuccess || isPendingSubscribe}
        />
      </View>

      {showPaymentLottie && <PaymentLottieCompo />}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    backgroundColor: theme.card,
    gap: Rs(20),
    padding: Rs(20),
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: theme.text,
    fontSize: SIZES.lg,
    fontWeight: "bold",
  },
  description: {
    color: theme.muted,
    fontSize: SIZES.sm,
    lineHeight: Rs(20),
  },
  buttonWrap: {
    marginHorizontal: 20,
    marginVertical: 6,
  },
  successCard: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
    borderRadius: Rs(10),
    borderWidth: StyleSheet.hairlineWidth,
    padding: Rs(12),
  },
  successTitle: {
    color: theme.success,
    fontSize: SIZES.sm,
    fontWeight: "800",
  },
  successText: {
    color: theme.text,
    fontSize: SIZES.xs,
    lineHeight: Rs(18),
    marginTop: Rs(4),
  },
});

export default memo(ActiveToklomanCompo);
