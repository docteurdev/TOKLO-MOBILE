import BackButton from "@/components/form/BackButton";
import CustomButton from "@/components/form/CustomButton";
import CustomInput from "@/components/form/CustomInput";
import FormBanner from "@/components/form/FormBanner";
import FormWrapper from "@/components/form/FormWrapper";
import { Colors } from "@/constants/Colors";
import { resetPasswordSchema } from "@/constants/formSchemas";
import useNotif from "@/hooks/useNotification";
import { apiClient } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";
import { InferType } from "yup";

type ResetPasswordValues = InferType<typeof resetPasswordSchema>;
type ResetPasswordResponse = {
  message: string;
};

const getResetPasswordErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) {
    return "Veuillez réessayer plus tard";
  }

  const message = error.response?.data?.message ?? error.response?.data?.error;
    console.log(message)

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error.response?.status === 400) {
    return "Le lien de réinitialisation est invalide ou expiré";
  }

  return "Impossible de réinitialiser le mot de passe";
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string | string[];
    phone?: string | string[];
  }>();
  const { handleNotification } = useNotif();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const phone = useMemo(() => {
    const value = params.phone;
    if (Array.isArray(value)) return (value[0] ?? "").trim();
    return (value ?? "").trim();
  }, [params.phone]);

  const code = useMemo(() => {
    const value = params.code;
    if (Array.isArray(value)) return (value[0] ?? "").trim();
    return (value ?? "").trim();
  }, [params.code]);

  const missingResetParamsMessage = "Code de réinitialisation invalide ou expiré.";

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const resetPasswordMutation = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      Keyboard.dismiss();
      const response = await apiClient.post<ResetPasswordResponse>(
        "/tokloMen/reset-password",
        {
          phone,
          code,
          newPassword: values.newPassword,
        },
      );
      return response.data;
    },
    onMutate: () => {
      setErrorMessage("");
      setSuccessMessage("");
    },
    onSuccess: () => {
      const message = "Mot de passe mis à jour avec succès.";
      setSuccessMessage(message);
      handleNotification("success", "Réinitialisation", message);

      redirectTimeoutRef.current = setTimeout(() => {
        router.replace("/login");
      }, 1000);
    },
    onError: (error) => {
      const message = getResetPasswordErrorMessage(error);
      setErrorMessage(message);
      handleNotification("error", "Erreur", message);
    },
  });

  return (
    <FormWrapper>
      <BackButton backAction={() => router.back()} />
      <FormBanner
        title="Nouveau mot de passe"
        subtitle="Choisissez un nouveau mot de passe pour votre compte"
      />

      <Formik
        validationSchema={resetPasswordSchema}
        validateOnMount
        initialValues={{
          newPassword: "",
          confirmPassword: "",
        }}
        onSubmit={(values: ResetPasswordValues) => {
          if (!phone || !code) {
            setErrorMessage(missingResetParamsMessage);
            return;
          }

          resetPasswordMutation.mutate(values);
        }}
      >
        {({
          handleBlur,
          handleChange,
          values,
          errors,
          touched,
          handleSubmit,
          isValid,
        }) => {
          const canSubmit = Boolean(phone && code) && isValid && !resetPasswordMutation.isPending;

          return (
            <View style={styles.content}>
              {(!phone || !code) && <Text style={styles.errorText}>{missingResetParamsMessage}</Text>}
              {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
              {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

              <CustomInput
                label="Nouveau mot de passe"
                placeholder="Entrez votre nouveau mot de passe"
                value={values.newPassword}
                handleChange={handleChange("newPassword")}
                handleOnBlur={handleBlur("newPassword")}
                error={errors.newPassword}
                touched={touched.newPassword}
                isPassword
              />

              <CustomInput
                label="Confirmation"
                placeholder="Confirmez votre mot de passe"
                value={values.confirmPassword}
                handleChange={handleChange("confirmPassword")}
                handleOnBlur={handleBlur("confirmPassword")}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                isPassword
              />

              <CustomButton
                label="Réinitialiser"
                action={() => handleSubmit()}
                loading={resetPasswordMutation.isPending}
                disabled={canSubmit}
                pressDisabled={!canSubmit}
              />
            </View>
          );
        }}
      </Formik>
    </FormWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Rs(10),
    marginTop: Rs(50),
  },
  errorText: {
    color: Colors.app.error,
    fontSize: SIZES.xs,
    lineHeight: Rs(18),
  },
  successText: {
    color: Colors.app.success,
    fontSize: SIZES.xs,
    lineHeight: Rs(18),
  },
});
