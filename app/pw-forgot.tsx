import { supabase } from "@/lib/supabase";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
import { AppState, Keyboard, StyleSheet, Text, View } from "react-native";

import BottomSheetCompo from "@/components/BottomSheetCompo";
import BackButton from "@/components/form/BackButton";
import CustomButton from "@/components/form/CustomButton";
import FormBanner from "@/components/form/FormBanner";
import FormWrapper from "@/components/form/FormWrapper";
import PhoneInput from "@/components/form/PhoneInput";
import { Colors } from "@/constants/Colors";
import { pwForgotSchema } from "@/constants/formSchemas";
import useNotif from "@/hooks/useNotification";
import { apiClient } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { InferType } from "yup";

type TypeValues = InferType<typeof pwForgotSchema>;
type ForgotPasswordResponse = {
  message: string;
};

const genericSuccessMessage =
  "Si ce numéro existe, les instructions de réinitialisation ont été envoyées.";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Page() {
  const { handleNotification } = useNotif();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");
  const claimeActiveAccountBottomSheet = useRef<BottomSheetModal>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: TypeValues) => {
      Keyboard.dismiss();
      const response = await apiClient.post<ForgotPasswordResponse>(
        "/tokloMen/forgot-password",
        values,
      );
      return response.data;
    },
    onMutate: () => {
      setSuccessMessage("");
    },
    onSuccess: (_data, values) => {
      setSuccessMessage(genericSuccessMessage);
      handleNotification("success", "Réinitialisation", genericSuccessMessage);
      router.push({
        pathname: "/otp",
        params: { phone: values.phone },
      });
    },
    onError: () => {
      handleNotification("error", "Erreur", "Veuillez réessayer plus tard");
    },
  });

  return (
    <FormWrapper>
      <BackButton backAction={() => router.back()} />
      <FormBanner
        title="Mot de passe oublié"
        subtitle="Entrez votre numéro de téléphone pour recevoir le code de réinitialisation de mot de passe"
      />

      <Formik
        validationSchema={pwForgotSchema}
        validateOnMount={true}
        initialValues={{
          phone: "",
        }}
        onSubmit={(values: TypeValues) => mutate(values)}
      >
        {({
          handleBlur,
          handleChange,
          values,
          errors,
          touched,
          handleSubmit,
          isValid,
        }) => (
          <View style={{ marginTop: Rs(50), gap: 10 }}>
            <PhoneInput
              label="Numéro de téléphone"
              placeholder="06 12 34 56 78"
              keyboardType="phone-pad"
              value={values.phone}
              handleChange={handleChange("phone")}
              handleOnBlur={handleBlur("phone")}
              error={errors.phone}
              touched={touched.phone}
            />

            <CustomButton
              label="Soumettre"
              action={() => handleSubmit()}
              loading={isPending}
              disabled={isValid}
              pressDisabled={!isValid || isPending}
            />

            {successMessage && (
              <Text style={styles.successText}>{successMessage}</Text>
            )}
          </View>
        )}
      </Formik>
      <BottomSheetCompo bottomSheetModalRef={claimeActiveAccountBottomSheet} snapPoints={['40%']} >
         <Text></Text>
      </BottomSheetCompo>

    </FormWrapper>
  );
}

const styles = StyleSheet.create({
  successText: {
    color: Colors.app.success,
    fontSize: SIZES.xs,
    lineHeight: Rs(18),
    marginTop: Rs(8),
  },
});
