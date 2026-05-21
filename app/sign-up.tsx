import { supabase } from "@/lib/supabase";
import Checkbox from 'expo-checkbox';
import { Formik } from "formik";
import React, { useState } from "react";
import { AppState, Keyboard, StyleSheet, Text, View } from "react-native";

import BackButton from "@/components/form/BackButton";
import CustomButton from "@/components/form/CustomButton";
import CustomInput from "@/components/form/CustomInput";
import FormBanner from "@/components/form/FormBanner";
import FormWrapper from "@/components/form/FormWrapper";
import PhoneInput from "@/components/form/PhoneInput";
import { Colors } from "@/constants/Colors";
import { signUpSchema } from "@/constants/formSchemas";
import useNotif from "@/hooks/useNotification";
import { useUserStore } from "@/stores/user";
import { baseURL } from "@/util/axios";
import { SIZES } from "@/util/comon";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useRouter } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { InferType } from "yup";

type TypeValues = InferType<typeof signUpSchema>;

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Page () {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecked, setChecked] = useState(false);

  const { setUser, setToken, setNotifyToken, setUserId } = useUserStore();

  const router = useRouter();
  const { handleNotification } = useNotif()

 const {mutate, isPending, error} = useMutation({
  mutationFn: signUpWithEmail,
 })


  async function signUpWithEmail(values: TypeValues) {
    setLoading(true);
    Keyboard.dismiss();
    try {
      const res = await axios.post(baseURL+'/tokloMen/register', values);
      console.log(res);

      if (res) {
        handleNotification("success", "Inscription", "Vous êtes bien inscrit")
        router.push("/login");
      }

      console.log(res);

    } catch (error) {
      console.log(error);
    }

    
    if (error){
      
      handleNotification("error", "Erreur","Veuillez vérifier vos informations")
    }
  }

  return (
      <FormWrapper>
        <BackButton backAction={() => router.back()} />
        <FormBanner
          title="Créer un compte"
          subtitle=""
        />

        <Formik
          validationSchema={signUpSchema}
          initialValues={{
            name: "",
            lastname: "",
            phone: "",
            password: "",
          }}
          onSubmit={(values: TypeValues, { resetForm }) =>
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
          }) => (
            <View style={{ gap: 10 }}>
              <CustomInput
                label="Nom "
                placeholder="Ngowa"
                value={values.name}
                handleChange={handleChange("name")}
                handleOnBlur={handleBlur("name")}
                error={errors.name}
                touched={touched.name}
              />

              <CustomInput
                label="Prénom(s)"
                placeholder="Edith yah"
                keyboardType="default"
                value={values.lastname}
                handleChange={handleChange("lastname")}
                handleOnBlur={handleBlur("lastname")}
                error={errors.lastname}
                touched={touched.lastname}
               
              />
               <PhoneInput
                label="Numéro de téléphone"
                placeholder="0612345678"
                keyboardType="numeric"
                value={values.phone}
                handleChange={handleChange("phone")}
                handleOnBlur={handleBlur("phone")}
                error={errors.phone}
                touched={touched.phone}
              />


              <View>
                <Text style={styles.otpLabel}>Mot de passe</Text>
                <OtpInput
                  numberOfDigits={5}
                  onTextChange={(text) => {
                    void setFieldValue("password", text.replace(/\D/g, ""));
                  }}
                  focusColor={Colors.app.primary}
                  focusStickBlinkingDuration={500}
                  onBlur={() => {
                    void setFieldTouched("password", true);
                  }}
                  onFilled={(text) => {
                    void setFieldValue("password", text.replace(/\D/g, ""));
                    void setFieldTouched("password", true);
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
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20}}>
                <Checkbox
                
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? Colors.app.primary : undefined}
              />
                <Link  href="/cgu">
                  <Text style={{color: Colors.app.texteLight, fontSize: SIZES.sm}}>Acceptez les conditions d&apos;utilisation</Text>
                </Link>
              </View>

              <CustomButton
               label="Connexion"
               action={() => handleSubmit()}
               loading={isPending}
               disabled={isValid && isChecked}
              />
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
});
