import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, AppState, Text, Keyboard } from "react-native";
import { Formik } from "formik";
import { supabase } from "@/lib/supabase";
import Checkbox from 'expo-checkbox';

import ModalCompo from "@/components/ModalCompo";
import { Link, useRouter } from "expo-router";
import { useUserStore } from "@/stores/user";
import CustomInput from "@/components/form/CustomInput";
import { signUpSchema } from "@/constants/formSchemas";
import { InferType } from "yup";
import FormWrapper from "@/components/form/FormWrapper";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import CustomButton from "@/components/form/CustomButton";
import FormBanner from "@/components/form/FormBanner";
import { SIZES } from "@/util/comon";
import BackButton from "@/components/form/BackButton";
import { useMutation } from "@tanstack/react-query";
import useNotif from "@/hooks/useNotification";
import { axiosConfig, baseURL } from "@/util/axios";
import axios from "axios";

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
               <CustomInput
                label="Numéro de téléphone"
                placeholder="0612345678"
                keyboardType="numeric"
                value={values.phone}
                handleChange={handleChange("phone")}
                handleOnBlur={handleBlur("phone")}
                error={errors.phone}
                touched={touched.phone}
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
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20}}>
                <Checkbox
                
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? Colors.app.primary : undefined}
              />
                <Link  href="/cgu">
                  <Text style={{color: Colors.app.texteLight, fontSize: SIZES.sm}}>Acceptez les conditions d'utilisation</Text>
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
});
