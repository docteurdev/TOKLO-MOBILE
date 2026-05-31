import BackButton from "@/components/form/BackButton";
import CustomButton from "@/components/form/CustomButton";
import FormBanner from "@/components/form/FormBanner";
import FormWrapper, { useFormScroll } from "@/components/form/FormWrapper";
import { Colors } from "@/constants/Colors";
import useNotif from "@/hooks/useNotification";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OtpInput, type OtpInputRef } from "react-native-otp-entry";

const OTP_LENGTH = 5;
const RESEND_SECONDS = 55;

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

const getOtpErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) {
    return "Veuillez réessayer plus tard";
  }

  const message = error.response?.data?.message ?? error.response?.data?.error;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error.response?.status === 400) {
    return "Le code saisi est invalide";
  }

  if (error.response?.status === 404) {
    return "Aucune demande de réinitialisation trouvée";
  }

  return "Veuillez vérifier le code saisi";
};

const ResetOtpInput = ({
  error,
  inputRef,
  touched,
  onBlur,
  onChange,
  onFilled,
}: {
  error?: string;
  inputRef: React.RefObject<OtpInputRef | null>;
  touched: boolean;
  onBlur: () => void;
  onChange: (text: string) => void;
  onFilled: (text: string) => void;
}) => {
  const otpContainerRef = useRef<View>(null);
  const formScroll = useFormScroll();

  return (
    <View ref={otpContainerRef} collapsable={false} style={styles.otpCard}>
      <Text style={styles.otpLabel}>Code de confirmation</Text>
      <Text style={styles.otpHint}>Entrez le code à {OTP_LENGTH} chiffres reçu par SMS.</Text>
      <OtpInput
        ref={inputRef}
        numberOfDigits={OTP_LENGTH}
        onTextChange={(text) => {
          onChange(text.replace(/\D/g, "").slice(0, OTP_LENGTH));
        }}
        onFilled={(text) => {
          onFilled(text.replace(/\D/g, "").slice(0, OTP_LENGTH));
        }}
        onFocus={() => {
          formScroll?.scrollToInput(otpContainerRef);
        }}
        onBlur={onBlur}
        focusColor={Colors.app.primary}
        focusStickBlinkingDuration={500}
        secureTextEntry
        type="numeric"
        textInputProps={{
          keyboardType: "number-pad",
        }}
        theme={{
          pinCodeContainerStyle: {
            backgroundColor: Colors.light.background,
            borderColor: Colors.app.texteLight,
            borderRadius: 10,
            borderWidth: 0.4,
            height: 58,
            width: 58,
          },
          pinCodeTextStyle: {
            color: Colors.app.primary,
          },
        }}
      />
      {touched && error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default function Page() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string | string[] }>();
  const { handleNotification } = useNotif();
  const otpInputRef = useRef<OtpInputRef>(null);
  const [otp, setOtp] = useState("");
  const [isOtpTouched, setIsOtpTouched] = useState(false);
  const [time, setTime] = useState(RESEND_SECONDS);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const phone = useMemo(() => {
    if (Array.isArray(params.phone)) return params.phone[0] ?? "";
    return params.phone ?? "";
  }, [params.phone]);

  const otpError = useMemo(() => {
    if (!otp) return "Entrez le code de confirmation";
    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) {
      return `Le code doit contenir ${OTP_LENGTH} chiffres`;
    }
    return "";
  }, [otp]);
  const isOtpValid = !otpError;

  useEffect(() => {
    if (time <= 0) return;

    const intervalId = setInterval(() => {
      setTime((prevTime) => Math.max(0, prevTime - 1));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [time]);

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      Keyboard.dismiss();
      const response = await apiClient.post<{ message: string }>("/tokloMen/verify-reset-code", {
        phone,
        code: otp,
      });
      return response.data;
    },
    onMutate: () => {
      setErrorMessage("");
      setSuccessMessage("");
    },
    onSuccess: () => {
      handleNotification("success", "Réinitialisation", "Code confirmé");
      router.push({
        pathname: "/reset-password",
        params: { phone, code: otp },
      });
    },
    onError: (error) => {
      const message = getOtpErrorMessage(error);
      setErrorMessage(message);
      handleNotification("error", "Erreur", message);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<{ message: string }>("/tokloMen/forgot-password", { phone });
      return response.data;
    },
    onMutate: () => {
      setErrorMessage("");
      setSuccessMessage("");
    },
    onSuccess: () => {
      setOtp("");
      setIsOtpTouched(false);
      setTime(RESEND_SECONDS);
      otpInputRef.current?.clear();
      const message = "Un nouveau code a été envoyé";
      setSuccessMessage(message);
      handleNotification("success", "Réinitialisation", message);
    },
    onError: (error) => {
      const message = getOtpErrorMessage(error);
      setErrorMessage(message);
      handleNotification("error", "Erreur", message);
    },
  });

  const canSubmit =
    Boolean(phone) &&
    isOtpValid &&
    !verifyOtpMutation.isPending &&
    !resendOtpMutation.isPending;
  const canResend = Boolean(phone) && time === 0 && !resendOtpMutation.isPending;

  return (
    <FormWrapper>
      <BackButton backAction={() => router.back()} />
      <FormBanner
        title="Réinitialiser le mot de passe"
        subtitle={phone ? `Entrez le code reçu au ${phone}` : "Entrez le code de confirmation reçu par SMS"}
      />

      <View style={styles.content}>
        {!phone && (
          <Text style={styles.errorText}>
            Numéro introuvable. Retournez à l&apos;écran précédent.
          </Text>
        )}
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

        <ResetOtpInput
          error={otpError}
          inputRef={otpInputRef}
          touched={isOtpTouched}
          onChange={(text) => {
            setOtp(text);
          }}
          onBlur={() => {
            setIsOtpTouched(true);
          }}
          onFilled={(text) => {
            setOtp(text);
            setIsOtpTouched(true);
          }}
        />

        <View style={styles.codeContainer}>
          {time > 0 ? (
            <>
              <Text style={styles.code}>Renvoyer le code dans</Text>
              <Text style={styles.time}>{` ${time} `}</Text>
              <Text style={styles.code}>s</Text>
            </>
          ) : (
            <TouchableOpacity
              disabled={!canResend}
              onPress={() => resendOtpMutation.mutate()}
            >
              {resendOtpMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.app.primary} />
              ) : (
                <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                  Renvoyer le code
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <CustomButton
          label="Soumettre"
          disabled={canSubmit}
          pressDisabled={!canSubmit}
          loading={verifyOtpMutation.isPending}
          action={() => {
            setIsOtpTouched(true);
            setErrorMessage("");
            setSuccessMessage("");
            if (!canSubmit) return;
            verifyOtpMutation.mutate();
          }}
        />
      </View>
    </FormWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Rs(14),
  },
  otpCard: {
    gap: Rs(8),
  },
  otpLabel: {
    color: Colors.app.texteLight,
    fontSize: SIZES.sm,
    fontWeight: "bold",
  },
  otpHint: {
    color: Colors.app.texteLight,
    fontSize: SIZES.xs,
    marginBottom: Rs(4),
  },
  errorText: {
    color: Colors.app.error,
    fontSize: SIZES.xs,
    marginTop: 6,
  },
  successText: {
    color: Colors.app.success,
    fontSize: SIZES.xs,
    lineHeight: Rs(18),
  },
  codeContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 24,
  },
  code: {
    color: Colors.app.texteLight,
    fontSize: 18,
    textAlign: "center",
  },
  time: {
    color: Colors.app.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  resendText: {
    color: Colors.app.primary,
    fontSize: SIZES.sm,
    fontWeight: "700",
  },
  resendTextDisabled: {
    color: Colors.app.texteLight,
  },
});
