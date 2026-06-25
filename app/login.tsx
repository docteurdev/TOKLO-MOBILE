import { supabase } from "@/lib/supabase";
import { Formik } from "formik";
import React, { useMemo, useState } from "react";
import { AppState, Keyboard, StyleSheet, Text, View } from "react-native";

import CustomButton from "@/components/form/CustomButton";
import FormBanner from "@/components/form/FormBanner";
import FormWrapper, { useFormScroll } from "@/components/form/FormWrapper";
import PhoneInput from "@/components/form/PhoneInput";
import { loginSchema } from "@/constants/formSchemas";
import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import useNotif from "@/hooks/useNotification";
import { ITokloUser, Ttoklo_men } from "@/interfaces/user";
import { useUserStore } from "@/stores/user";
import { apiClient } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from "axios";
import { Link, useRouter } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { InferType } from "yup";


type TypeValues = InferType<typeof loginSchema>;
const OTP_LENGTH = 5;

const normalizeLoginValues = (values: TypeValues): TypeValues => ({
  phone: values.phone?.trim() ?? "",
  password: values.password.replace(/\D/g, "").slice(0, OTP_LENGTH),
});

type LoginOtpInputProps = {
  error?: string;
  touched?: boolean;
  onBlur: () => void;
  onChange: (text: string) => void;
  onFilled: (text: string) => void;
};

const LoginOtpInput = ({ error, touched, onBlur, onChange, onFilled }: LoginOtpInputProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const otpContainerRef = React.useRef<View>(null);
  const formScroll = useFormScroll();

  return (
    <View ref={otpContainerRef} collapsable={false} style={styles.otpCard}>
      <Text style={styles.otpLabel}>
        Code secret <Text style={styles.required}>*</Text>
      </Text>
      <Text style={styles.otpHint}>Entrez votre code numérique à 5 chiffres.</Text>
      <OtpInput
        numberOfDigits={OTP_LENGTH}
        onTextChange={(text) => {
          onChange(text.replace(/\D/g, "").slice(0, OTP_LENGTH));
        }}
        focusColor={theme.primary}
        focusStickBlinkingDuration={500}
        onFocus={() => {
          formScroll?.scrollToInput(otpContainerRef);
        }}
        onBlur={onBlur}
        onFilled={(text) => {
          onFilled(text.replace(/\D/g, "").slice(0, OTP_LENGTH));
        }}
        secureTextEntry
        type="numeric"
        textInputProps={{
          keyboardType: "number-pad",
          textContentType: "oneTimeCode",
          autoComplete: "sms-otp",
        }}
        theme={{
          pinCodeContainerStyle: {
            backgroundColor: theme.card,
            borderColor: error && touched ? theme.danger : theme.border,
            borderWidth: 0.4,
            borderRadius: 10,
            height: 54,
            width: 54,
          },
          pinCodeTextStyle: {
            color: theme.primary,
          },
        }}
      />
      {touched && error && <Text style={styles.errorText}>{error}</Text>}
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

export default function Auth() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedSegment] = useState<"admin" | "user">("admin");

  const { setUser, setToken, setSubscribe, setTokloUser } = useUserStore();
  

  const { handleNotification } = useNotif()

  const router = useRouter();


  async function signInWithPhone(values: TypeValues) {
    Keyboard.dismiss();
    const loginValues = normalizeLoginValues(values);
    try {
      const res = await apiClient.post(
        `/tokloMen/${selectedSegment === "admin" ? "login" : "login-user"}`,
        loginValues,
      );
      
      const tokloman: Ttoklo_men = res.data;

      if (tokloman) {
        handleNotification("success", "Connexion", "Vous êtes bien connecté")
        setToken(tokloman?.token ?? "");
        setUser(tokloman?.toklo_men)
        setSubscribe(tokloman?.toklo_men.subscribe)
        setTokloUser(tokloman?.toklo_user ?? {} as ITokloUser)
        // return console.log(tokloman?.toklo_user);
        router.push("/(app)/(tab)");
        
      }

    } catch (error) {
      if (!isAxiosError(error)) {
        console.error(error);
        handleNotification("error", "Erreur", "Veillez réessayer plus tard");
        return;
      }

      const status = error.response?.status;
      console.log(error);

      if (status === 400) {
        handleNotification("error", "Erreur", "Numéro ou code secret incorrect")
      }
      if (status === 404) {
        handleNotification("error", "Erreur", "Compte introuvable");
        console.log(selectedSegment)
      }
      if (status === 500) {
        handleNotification("error", "Erreur", "Veillez réessayer plus tard")
      }
    }

  }

  
  const {mutate, isPending} = useMutation({
   mutationFn: signInWithPhone,

  })

  

  return (
    <FormWrapper>

     
      <FormBanner
        title="Connectez-vous "
        subtitle="Bon retour ! Veuillez saisir vos informations"
        isLogo
      />

      {/* <Animated.View entering={FadeInDown.delay(600)} style={{ marginTop: Rs(20), marginBottom: Rs(40) }}>

       <SegmentButtons segments={segments}
        activeColor={Colors.app.texteLight}
          // onPress={(segment) => setSelectedSegment(segment)}
          handleChangeSegment={(value: string) => setSelectedSegment(value as "admin" | "user")}
        />
      </Animated.View>
 */}

      <Formik
        validationSchema={loginSchema}
        validateOnMount
        initialValues={{
          phone: "",
          password: "",
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
          setFieldTouched,
          setFieldValue,
          validateField,
        }) => {
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
          <View style={{ gap: 10 }}>
            <PhoneInput
              label="Numéro de téléphone"
              placeholder="0612345678"
              keyboardType="phone-pad"
              value={values.phone}
              handleChange={handleChange("phone")}
              handleOnBlur={handleBlur("phone")}
              error={errors.phone}
              touched={touched.phone}
            />

            <LoginOtpInput
              error={errors.password}
              touched={touched.password}
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                marginVertical: 20,
              }}
            >
             
              <Link href="/pw-forgot">
                <Text
                  style={styles.forgotText}
                >
                  Code oublié ?
                </Text>
              </Link>
            </View>

            <CustomButton
              action={() => handleSubmit()}
              disabled={isValid}
              pressDisabled={!isValid || isPending}
              label="Connexion"
              loading={isPending}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
              }}
            >
            
                <Text
                  style={styles.signUpHint}
                >
                  Vous n&apos;avez pas de compte ?  
               <Link style={styles.signUpLink} href="/sign-up">
                  Inscrivez-vous
              </Link>
                </Text>
            </View>
          </View>
        );
        }}
      </Formik>
    </FormWrapper>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  otpCard: {
    gap: Rs(8),
    marginBottom: Rs(10),
  },
  otpLabel: {
    fontSize: SIZES.sm,
    color: theme.muted,
    marginBottom: Rs(2),
    fontWeight: "bold",
  },
  required: {
    color: theme.danger,
  },
  otpHint: {
    color: theme.muted,
    fontSize: SIZES.xs,
    marginBottom: Rs(4),
  },
  errorText: {
    color: theme.danger,
    fontSize: SIZES.xs,
    marginTop: Rs(6),
  },
  forgotText: {
    color: theme.danger,
    fontSize: SIZES.sm,
  },
  signUpHint: {
    color: theme.muted,
    fontSize: SIZES.sm,
    lineHeight: Rs(20),
  },
  signUpLink: {
    color: theme.primary,
  },
});
