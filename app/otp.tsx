import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, AppState, Text, Keyboard } from "react-native";
import { Formik } from "formik";
import { supabase } from "@/lib/supabase";
import Checkbox from 'expo-checkbox';

import ModalCompo from "@/components/ModalCompo";
import { Link, useRouter } from "expo-router";
import { useUserStore } from "@/stores/user";

import { OtpInput } from "react-native-otp-entry";


import { pwForgotSchema } from "@/constants/formSchemas";
import { InferType } from "yup";
import FormWrapper from "@/components/form/FormWrapper";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import CustomButton from "@/components/form/CustomButton";
import FormBanner from "@/components/form/FormBanner";
import { SIZES } from "@/util/comon";
import BackButton from "@/components/form/BackButton";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { baseURL } from "@/util/axios";
import useNotif from "@/hooks/useNotification";

type TypeValues = InferType<typeof pwForgotSchema>;

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Page () {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setValid] = useState(false);

  const { setUser, setToken, setNotifyToken, setUserId } = useUserStore();

  const router = useRouter();

      const { handleNotification } = useNotif()
  

  const [time, setTime] = useState(55);
useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const {mutate, isError, isPending} = useMutation({
    mutationFn: handleSubmit,
 
   })


async function handleSubmit (){
  Keyboard.dismiss();
     
     try {
       const res = await axios.post(baseURL+'/tokloMen/forgot-password', otp);
       
      
 
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

 

  return (
      <FormWrapper>
        <BackButton backAction={() => router.back()} />
        <FormBanner
          title="Rénitialiser le mot de passe"
          subtitle="Entrez le code de confirmation envoyé au ....90"
        />

       
            <View style={{ gap: 10 }}>
              
              <OtpInput 
              numberOfDigits={4}
              onTextChange={(text) => console.log(text)} 
              focusColor={Colors.app.primary}
              focusStickBlinkingDuration={500}
              onFilled={(text) => {
                setOtp(text)
                setValid(true)
              }}
              theme={{
                pinCodeContainerStyle: {
                  backgroundColor:  Colors.light.background,
                  borderColor:  Colors.app.texteLight,
                  borderWidth: .4,
                  borderRadius: 10,
                  height: 58,
                  width: 58,
                },
                pinCodeTextStyle: {
                  color:  Colors.app.primary,
                }
              }}
              />
          <View style={styles.codeContainer}>
            <Text style={[styles.code]}>Renvoyer le code dans</Text>
            <Text style={styles.time}>{`  ${time}  `}</Text>
            <Text style={[styles.code]}>s</Text>
          </View>
              

              <CustomButton
               label="Soumettre"
               disabled={isValid}
               loading={isPending}
               action={() => handleSubmit()}
              />
            </View>
        
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
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    justifyContent: "center"
  },
  code: {
    fontSize: 18,
    fontFamily: "medium",
    color: Colors.app.texteLight,
    textAlign: "center"
  },
  time: {
    fontFamily: "medium",
    fontSize: 18,
    color: Colors.app.primary,
  },
});
