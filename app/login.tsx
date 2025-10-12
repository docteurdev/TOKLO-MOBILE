import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, AppState, Text, Keyboard } from "react-native";
import { Formik } from "formik";
import { supabase } from "@/lib/supabase";
import Checkbox from "expo-checkbox";

import ModalCompo from "@/components/ModalCompo";
import { Link, useRouter } from "expo-router";
import { useUserStore } from "@/stores/user";
import CustomInput from "@/components/form/CustomInput";
import { loginSchema } from "@/constants/formSchemas";
import { InferType } from "yup";
import FormWrapper from "@/components/form/FormWrapper";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import CustomButton from "@/components/form/CustomButton";
import FormBanner from "@/components/form/FormBanner";
import { Rs, SIZES } from "@/util/comon";
import { useMutation } from '@tanstack/react-query';
import useNotif from "@/hooks/useNotification";
import axios from "axios";
import { baseURL } from "@/util/axios";
import { ITokloUser, IUser, Ttoklo_men } from "@/interfaces/user";
import { SegmentButtons } from "@/components/SegmentButtons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";


type TypeValues = InferType<typeof loginSchema>;

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [selectedSegment, setSelectedSegment] = useState<"admin" | "user">("admin");

  const { setUser, setToken, setNotifyToken, setUserId, setSubscribe, setTokloUser, subscribe } = useUserStore();

  const segments = [
    { label: "Administrateur", value: "admin", key: "admin" },
    { label: "Utilisateur", value: "user", key: "user" },
  ];
  

  const { handleNotification } = useNotif()

  const router = useRouter();


  async function signInWithEmail(values: TypeValues) {
    Keyboard.dismiss();
    
    try {
      const res = await axios.post(baseURL+`/tokloMen/${selectedSegment === "admin" ? "login" : "login-user"}`, values);
      
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
      const status = error?.response?.status;
      console.log(error?.response?.data);
      if (status === 400) {
        handleNotification("error", "Erreur", "Numéro ou mot de passe est incorrect")
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

  
  const {mutate, isError, isPending} = useMutation({
   mutationFn: signInWithEmail,

  })

  

  return (
    <FormWrapper>

     
      <FormBanner
        title="Connectez-vous "
        subtitle="Bon retour ! Veuillez saisir vos informations"
      />

      <Animated.View entering={FadeInDown.delay(600)} style={{ marginTop: Rs(20), marginBottom: Rs(40) }}>

       <SegmentButtons segments={segments}
        activeColor={Colors.app.texteLight}
          // onPress={(segment) => setSelectedSegment(segment)}
          handleChangeSegment={(value: string) => setSelectedSegment(value as "admin" | "user")}
        />
      </Animated.View>


      <Formik
        validationSchema={loginSchema}
        // validateOnChange={true}
        initialValues={{
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
              label="Numéro de téléphone"
              placeholder="0612345678"
              keyboardType="phone-pad"
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
                  style={{ color: Colors.app.error, fontSize: SIZES.sm }}
                >
                  Mot de passe oublié ?
                </Text>
              </Link>
            </View>

            <CustomButton action={() => handleSubmit()} disabled={isValid }  label="Connexion" loading={isPending} />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
              }}
            >
            
                <Text
                  style={{ color: Colors.app.texteLight, fontSize: SIZES.sm, lineHeight: Rs(20)}}
                >
                  Vous n'avez pas de compte ?  
               <Link style={{color: Colors.app.primary, }} href="/sign-up">
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
