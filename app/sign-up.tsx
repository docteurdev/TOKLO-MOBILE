import { supabase } from "@/lib/supabase";
import ExpoCheckbox from 'expo-checkbox';
import { Formik } from "formik";
import React, { useState } from "react";
import { AppState, Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import BackButton from "@/components/form/BackButton";
import CustomButton from "@/components/form/CustomButton";
import CustomInput from "@/components/form/CustomInput";
import FormBanner from "@/components/form/FormBanner";
import FormWrapper, { useFormScroll } from "@/components/form/FormWrapper";
import PhoneInput from "@/components/form/PhoneInput";
import { Colors } from "@/constants/Colors";
import { signUpSchema } from "@/constants/formSchemas";
import useNotif from "@/hooks/useNotification";
import { baseURL } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { Link, useRouter } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import Animated, { FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight } from "react-native-reanimated";
import { InferType } from "yup";

type TypeValues = InferType<typeof signUpSchema>;
type SignUpField = keyof TypeValues;
const OTP_LENGTH = 5;

const steps: {
  title: string;
  subtitle: string;
  fields: SignUpField[];
}[] = [
  {
    title: "Profil",
    subtitle: "Vos informations de base",
    fields: ["name", "lastname", "phone"],
  },
  {
    title: "Sécurité",
    subtitle: "Code d'accès et conditions",
    fields: ["password"],
  },
];

const normalizeSignUpValues = (values: TypeValues): TypeValues => ({
  name: values.name.trim(),
  lastname: values.lastname.trim(),
  phone: values.phone.trim(),
  password: values.password.trim(),
});

const getTouchedFields = (fields: SignUpField[]) =>
  fields.reduce(
    (acc, field) => ({ ...acc, [field]: true }),
    {} as Partial<Record<SignUpField, boolean>>,
  );

const getVisibleFieldError = (
  field: SignUpField,
  errors: Partial<Record<SignUpField, string>>,
  touched: Partial<Record<SignUpField, boolean>>,
) => (touched[field] && errors[field] ? errors[field] : undefined);

const getSignUpErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) {
    return "Veuillez réessayer plus tard";
  }

  const message = error.response?.data?.message ?? error.response?.data?.error;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error.response?.status === 409) {
    return "Un compte existe déjà avec ce numéro";
  }

  if (error.response?.status === 400) {
    return "Veuillez vérifier les informations saisies";
  }

  return "Veuillez réessayer plus tard";
};

type SignUpOtpInputProps = {
  error?: string;
  touched?: boolean;
  onBlur: () => void;
  onChange: (text: string) => void;
  onFilled: (text: string) => void;
};

const SignUpOtpInput = ({ error, touched, onBlur, onChange, onFilled }: SignUpOtpInputProps) => {
  const otpContainerRef = React.useRef<View>(null);
  const formScroll = useFormScroll();

  return (
    <View ref={otpContainerRef} collapsable={false} style={styles.otpCard}>
      <Text style={styles.otpLabel}>Code secret</Text>
      <Text style={styles.otpHint}>Choisissez un code numérique à 5 chiffres.</Text>
      <OtpInput
        numberOfDigits={5}
        onTextChange={(text) => {
          onChange(text.replace(/\D/g, ""));
        }}
        focusColor={Colors.app.primary}
        focusStickBlinkingDuration={500}
        onFocus={() => {
          formScroll?.scrollToInput(otpContainerRef);
        }}
        onBlur={onBlur}
        onFilled={(text) => {
          onFilled(text.replace(/\D/g, ""));
        }}
        secureTextEntry
        type="numeric"
        textInputProps={{
          keyboardType: "number-pad",
        }}
        theme={{
          pinCodeContainerStyle: {
            backgroundColor: Colors.light.background,
            borderColor: Colors.app.texteLight,
            borderWidth: 0.4,
            borderRadius: 10,
            height: 58,
            width: 58,
          },
          pinCodeTextStyle: {
            color: Colors.app.primary,
          },
        }}
      />
      {touched && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Page () {
  const [isChecked, setChecked] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepDirection, setStepDirection] = useState<"forward" | "backward">("forward");

  const router = useRouter();
  const { handleNotification } = useNotif()

 const {mutate, isPending} = useMutation({
  mutationFn: signUpWithEmail,
  onError: (error) => {
    handleNotification("error", "Erreur", getSignUpErrorMessage(error))
  },
 })


  async function signUpWithEmail(values: TypeValues) {
    Keyboard.dismiss();
    await axios.post(baseURL+'/tokloMen/register', normalizeSignUpValues(values));
    handleNotification("success", "Inscription", "Vous êtes bien inscrit")
    router.push("/login");
  }

  return (
      <FormWrapper>
        <BackButton backAction={() => router.back()} />
        <FormBanner
          title="Créer un compte"
          subtitle=""
        />

        <View style={styles.hero}>
          <Text style={styles.heroKicker}>Toklo</Text>
          <Text style={styles.heroTitle}>Créer votre compte</Text>
          <Text style={styles.heroSubtitle}>
            Renseignez vos informations pour configurer votre espace tailleur.
          </Text>
        </View>

        <Formik
          validationSchema={signUpSchema}
          validateOnMount
          initialValues={{
            name: "",
            lastname: "",
            phone: "",
            password: "",
          }}
          onSubmit={(values: TypeValues) =>
            mutate(values)
          }
        >
          {({
            handleBlur,
            handleChange,
            values,
            errors,
            touched,
            handleSubmit,
            isValid,
            setFieldTouched,
            setFieldValue,
            validateField,
            validateForm,
            setTouched,
          }) => {
            const currentStepFields = steps[currentStep].fields;
            const nameError = getVisibleFieldError("name", errors, touched);
            const lastnameError = getVisibleFieldError("lastname", errors, touched);
            const phoneError = getVisibleFieldError("phone", errors, touched);
            const passwordError = getVisibleFieldError("password", errors, touched);
            const isCurrentStepFilled = currentStepFields.every((field) => {
              const value = values[field];
              return typeof value === "string" && value.trim().length > 0;
            });
            const hasCurrentStepError = currentStepFields.some((field) => Boolean(errors[field]));
            const isOtpValid = new RegExp(`^\\d{${OTP_LENGTH}}$`).test(values.password);
            const canContinue = isCurrentStepFilled && !hasCurrentStepError && !isPending;
            const canCreateAccount = isValid && isOtpValid && isChecked && !isPending;
            const canUsePrimaryAction = currentStep === steps.length - 1 ? canCreateAccount : canContinue;
            const updatePassword = (text: string, shouldTouch = false) => {
              const password = text.replace(/\D/g, "").slice(0, OTP_LENGTH);

              void setFieldValue("password", password, true).then(() => {
                if (shouldTouch || touched.password) {
                  void setFieldTouched("password", true, false);
                }

                void validateField("password");
              });
            };

            return (
            <View style={styles.formContainer}>
              <View style={styles.progressPanel}>
                <View style={styles.progressTop}>
                  <View>
                    <Text style={styles.progressEyebrow}>
                      Étape {currentStep + 1} sur {steps.length}
                    </Text>
                    <Text style={styles.progressTitle}>{steps[currentStep].title}</Text>
                  </View>
                  <Text style={styles.progressPercent}>
                    {currentStep === 0 ? "50%" : "100%"}
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: currentStep === 0 ? "50%" : "100%" },
                    ]}
                  />
                </View>

                <View style={styles.progressLabels}>
                  {steps.map((step, index) => (
                    <Text
                      key={step.title}
                      style={[
                        styles.progressLabel,
                        index === currentStep && styles.progressLabelActive,
                      ]}
                    >
                      {step.title}
                    </Text>
                  ))}
                </View>
              </View>

              {currentStep === 0 && (
                <Animated.View
                  key="profile-step"
                  entering={stepDirection === "forward" ? FadeInRight.duration(220) : FadeInLeft.duration(220)}
                  exiting={stepDirection === "forward" ? FadeOutLeft.duration(160) : FadeOutRight.duration(160)}
                  style={styles.stepContent}
                >
                  <CustomInput
                    label="Nom "
                    placeholder="Ngowa"
                    value={values.name}
                    handleChange={(text) => {
                      handleChange("name")(text.replace(/\s{2,}/g, " "));
                    }}
                    handleOnBlur={handleBlur("name")}
                    error={nameError}
                    touched={Boolean(nameError)}
                  />

                  <CustomInput
                    label="Prénom(s)"
                    placeholder="Edith yah"
                    keyboardType="default"
                    value={values.lastname}
                    handleChange={(text) => {
                      handleChange("lastname")(text.replace(/\s{2,}/g, " "));
                    }}
                    handleOnBlur={handleBlur("lastname")}
                    error={lastnameError}
                    touched={Boolean(lastnameError)}
                  />

                  <PhoneInput
                    label="Numéro de téléphone"
                    placeholder="0612345678"
                    keyboardType="numeric"
                    value={values.phone}
                    handleChange={handleChange("phone")}
                    handleOnBlur={handleBlur("phone")}
                    error={phoneError}
                    touched={Boolean(phoneError)}
                  />
                </Animated.View>
              )}

              {currentStep === 1 && (
                <Animated.View
                  key="security-step"
                  entering={stepDirection === "forward" ? FadeInRight.duration(220) : FadeInLeft.duration(220)}
                  exiting={stepDirection === "forward" ? FadeOutLeft.duration(160) : FadeOutRight.duration(160)}
                  style={styles.stepContent}
                >
                  <SignUpOtpInput
                    error={passwordError}
                    touched={Boolean(passwordError)}
                    onChange={(text) => {
                      updatePassword(text);
                    }}
                    onBlur={() => {
                      void setFieldTouched("password", true, true);
                    }}
                    onFilled={(text) => {
                      updatePassword(text, true);
                    }}
                  />

                  <View style={styles.termsContainer}>
                    <ExpoCheckbox
                      value={isChecked}
                      onValueChange={setChecked}
                      color={isChecked ? Colors.app.primary : undefined}
                    />
                    <Link href="/cgu" style={styles.termsLink}>
                      <Text style={styles.termsText}>J&apos;accepte les conditions d&apos;utilisation</Text>
                    </Link>
                  </View>
                </Animated.View>
              )}

              <View style={styles.actions}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setStepDirection("backward");
                      setCurrentStep((step) => Math.max(0, step - 1));
                    }}
                    style={styles.secondaryButton}
                  >
                    <Feather name="arrow-left" size={Rs(18)} color={Colors.app.primary} />
                    <Text style={styles.secondaryButtonText}>Retour</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.primaryAction}>
                  <CustomButton
                    label={currentStep === steps.length - 1 ? "Créer le compte" : "Continuer"}
                    action={async () => {
                      if (isPending || !canUsePrimaryAction) return;

                      if (currentStep < steps.length - 1) {
                        const formErrors = await validateForm();
                        const stepFields = steps[currentStep].fields;
                        const nextTouched = getTouchedFields(stepFields);

                        setTouched({ ...touched, ...nextTouched });

                        const hasStepError = stepFields.some((field) => Boolean(formErrors[field]));

                        if (!hasStepError) {
                          setStepDirection("forward");
                          setCurrentStep((step) => Math.min(steps.length - 1, step + 1));
                        }

                        return;
                      }

                      const formErrors = await validateForm();
                      setTouched(getTouchedFields(steps.flatMap((step) => step.fields)));

                      if (Object.keys(formErrors).length > 0) {
                        return;
                      }

                      if (!isChecked) {
                        handleNotification(
                          "error",
                          "Conditions",
                          "Veuillez accepter les conditions d'utilisation",
                        );
                        return;
                      }

                      handleSubmit();
                    }}
                    loading={isPending}
                    disabled={canUsePrimaryAction}
                    pressDisabled={!canUsePrimaryAction}
                  />
                </View>
              </View>
            </View>
          );
          }}
        </Formik>
      </FormWrapper>
    
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  otpLabel: {
    fontSize: SIZES.sm,
    color: Colors.app.texteLight,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.app.error,
    fontSize: SIZES.xs,
    marginTop: 6,
  },
  formContainer: {
    gap: Rs(18),
  },
  hero: {
    marginTop: Rs(12),
    marginBottom: Rs(8),
  },
  heroKicker: {
    color: Colors.app.primary,
    fontSize: SIZES.xs,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: Rs(6),
  },
  heroTitle: {
    color: Colors.app.texte,
    fontSize: SIZES.xl + 5,
    fontWeight: "900",
  },
  heroSubtitle: {
    color: Colors.app.texteLight,
    fontSize: SIZES.sm,
    lineHeight: Rs(22),
    marginTop: Rs(8),
  },
  progressPanel: {
    gap: Rs(10),
    marginTop: Rs(4),
    marginBottom: Rs(2),
  },
  progressTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  progressEyebrow: {
    color: Colors.app.texteLight,
    fontSize: SIZES.xs,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  progressTitle: {
    color: Colors.app.texte,
    fontSize: SIZES.lg,
    fontWeight: "800",
    marginTop: Rs(3),
  },
  progressPercent: {
    color: Colors.app.primary,
    fontSize: SIZES.sm,
    fontWeight: "800",
  },
  progressTrack: {
    height: Rs(6),
    borderRadius: Rs(6),
    backgroundColor: Colors.app.disabled,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Rs(6),
    backgroundColor: Colors.app.primary,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: Colors.app.texteLight,
    fontSize: SIZES.xs,
    fontWeight: "600",
  },
  progressLabelActive: {
    color: Colors.app.primary,
  },
  stepContent: {
    gap: Rs(8),
  },
  otpCard: {
    gap: Rs(8),
  },
  otpHint: {
    color: Colors.app.texteLight,
    fontSize: SIZES.xs,
    marginBottom: Rs(4),
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(10),
    marginTop: Rs(10),
  },
  termsLink: {
    flex: 1,
  },
  termsText: {
    color: Colors.app.texteLight,
    fontSize: SIZES.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Rs(12),
    marginTop: Rs(8),
  },
  secondaryButton: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: Rs(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.app.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Rs(8),
  },
  secondaryButtonText: {
    color: Colors.app.primary,
    fontSize: SIZES.sm,
    fontWeight: "700",
  },
  primaryAction: {
    flex: 1,
  },
});
