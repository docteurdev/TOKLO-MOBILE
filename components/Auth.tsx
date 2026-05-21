import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, AppState, Text } from "react-native";
import { Formik } from "formik";
import { supabase } from "@/lib/supabase";
import Checkbox from "expo-checkbox";

import ModalCompo from "./ModalCompo";
import { Link, useRouter } from "expo-router";
import { useUserStore } from "@/stores/user";
import CustomInput from "./form/CustomInput";
import { loginSchema } from "@/constants/formSchemas";
import { InferType } from "yup";
import FormWrapper from "./form/FormWrapper";
import ScreenWrapper from "./ScreenWrapper";
import { Colors } from "@/constants/Colors";
import CustomButton from "./form/CustomButton";
import FormBanner from "./form/FormBanner";
import { SIZES } from "@/util/comon";
import BackButton from "./form/BackButton";

type TypeValues = InferType<typeof loginSchema>;

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecked, setChecked] = useState(false);

  const { setUser, setToken, setNotifyToken, setUserId } = useUserStore();

  const router = useRouter();

  useEffect(() => {
    //router.push('/login')
  }, []);

  async function signInWithEmail({ email, password }: TypeValues) {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (data) {
      console.log({ 2: data.user });
      setUserId(data?.user?.id ?? "");
      setToken(data?.session?.access_token ?? "");
      return router.push("/(app)");
    }

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <FormWrapper>
     
      <FormBanner
        title="Connectez-vous à votre compte"
        subtitle="Bon retour ! Veuillez saisir vos informations"
      />

      <Formik
        validationSchema={loginSchema}
        initialValues={{
          email: "",
          password: "",
        }}
        onSubmit={(values: TypeValues, { resetForm }) =>
          signInWithEmail(values)
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
        }) => (
          <View style={{ gap: 10 }}>
            <CustomInput
              label="Adresse email"
              placeholder="email@address.com"
              value={values.email}
              handleChange={handleChange("email")}
              handleOnBlur={handleBlur("email")}
              error={errors.email}
              touched={touched.email}
            />

            <CustomInput
              label="Mot de passe"
              placeholder="******"
              isPassword
              value={values.password}
              handleChange={handleChange("password")}
              handleOnBlur={handleBlur("password")}
              error={errors.password}
              touched={touched.password}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 20,
              }}
            >
              <Checkbox
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? Colors.app.primary : undefined}
              />
              <Link href="/pw-forgot">
                <Text
                  style={{ color: Colors.app.texteLight, fontSize: SIZES.sm }}
                >
                  Mot de passe oublié ?
                </Text>
              </Link>
            </View>

            <CustomButton label="Connexion" />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
              }}
            >
            
                <Text
                  style={{ color: Colors.app.texteLight, fontSize: SIZES.sm }}
                >
                  Vous n'avez pas de compte ?  
               <Link style={{color: Colors.app.primary}} href="/sign-up">
                  Inscrivez-vous
              </Link>
                </Text>
            </View>
          </View>
        )}
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
});
