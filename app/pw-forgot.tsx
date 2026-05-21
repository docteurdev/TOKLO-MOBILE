import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, AppState, Text } from "react-native";
import { Formik } from "formik";
import { supabase } from "@/lib/supabase";
import Checkbox from 'expo-checkbox';

import ModalCompo from "@/components/ModalCompo";
import { Link, useRouter } from "expo-router";
import { useUserStore } from "@/stores/user";
import CustomInput from "@/components/form/CustomInput";
import { pwForgotSchema } from "@/constants/formSchemas";
import { InferType } from "yup";
import FormWrapper from "@/components/form/FormWrapper";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import CustomButton from "@/components/form/CustomButton";
import FormBanner from "@/components/form/FormBanner";
import { SIZES } from "@/util/comon";
import BackButton from "@/components/form/BackButton";
import { Keyboard } from "react-native";
import axios from "axios";
import { baseURL } from "@/util/axios";
import useNotif from "@/hooks/useNotification";
import { useMutation } from "@tanstack/react-query";

type TypeValues = InferType<typeof pwForgotSchema>;

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Page () {
 

  const { setUser, setToken, setNotifyToken, setUserId } = useUserStore();

    const { handleNotification } = useNotif()
  

  const router = useRouter();

 async function signInWithEmail(values: TypeValues) {
     Keyboard.dismiss();
     
     try {
       const res = await axios.post(baseURL+'/tokloMen/forgot-password', values);
       
      
 
       if (res?.data) {
         handleNotification("success", "Réinitialisation ", "Le code de réinitialisation est envoyé ")
         
         router.push("/otp");
         
       }
 
     } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        handleNotification("error", "Erreur", "Ce utilisateur n'existe pas")
      }else{
        handleNotification("error", "Erreur", "Veuillez vérifier vos informations")
      }
       

     }
 
   }
 
   
   const {mutate, isError, isPending} = useMutation({
    mutationFn: signInWithEmail,
 
   })

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
               disabled={isValid }
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
