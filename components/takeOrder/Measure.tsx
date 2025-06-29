import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Keyboard,
} from "react-native";
import React, { memo, useState } from "react";
import { FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";

import { BanknotesIcon } from "react-native-heroicons/solid";
import { Square3Stack3DIcon } from "react-native-heroicons/solid";
import { MinusCircleIcon } from "react-native-heroicons/solid";

import OtherInput from "@/components/form/OtherInput";
import ModifMeasure from "@/components/takeOrder/ModifMeasure";
import { Colors } from "@/constants/Colors";
import { SCREEN_WIDTH, SIZES } from "@/util/comon";
import { CategorieMesure, IClient, TImage } from "@/interfaces/type";
import { ThemedText } from "../ThemedText";
import CustomButton from "../form/CustomButton";
import { axiosConfigFile } from "@/util/axios";
import axios from "axios";
import useNotif from "@/hooks/useNotification";
import useCreateOrder from "@/hooks/mutations/useNewOrder";

type Props = {
  setshowMModal?: () => void;
  dressMeasures: string[];
  inputValues: {};
  fabricphoto: TImage | null;
  modelPhoto: TImage | null;
  checkedBeforeSend?: () => void;
  closeBottomSheet: () => void;
  // vetement: string;
  selectedData?: CategorieMesure[];
  selectedClient: IClient | null;
  deliveryDate: Date | null;
  deliveryHoure: string
  dressName: string;
  genre: string;
};

const Measurement = ({
  deliveryDate,
  deliveryHoure,
  fabricphoto,
  modelPhoto,
  // vetement,
  dressName,
  genre,
  selectedData,
  selectedClient,
  closeBottomSheet
}: Props) => {
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  const [quantity, setquantity] = useState<string>("1");
  const [amount, setamount] = useState<string>("0");
  const [paiement, setpaiement] = useState<string>("0");


  const { mutate, isPending } = useCreateOrder(closeBottomSheet);


  // Gestionnaire de changement pour les champs de saisie
  const handleInputChange = (typemesurename: string, value: string) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [typemesurename]: value,
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async () => {

    Keyboard.dismiss();

    const formData = new FormData();

    console.log("Valeurs soumises :", inputValues, fabricphoto, modelPhoto);

    // Append text fields
    formData.append("quantite", quantity); // Ensure quantity is a valid string
    formData.append("measure", JSON.stringify(inputValues)); // Convert Measure object to JSON string
    formData.append("date_depote", new Date().toISOString().split("T")[0]); // Use ISO date format (YYYY-MM-DD)
    formData.append(
      "date_remise",
      deliveryDate?.toISOString().split("T")[0] || ""
    ); // Replace with actual value or handle empty case
    formData.append("deliveryHour", deliveryHoure); 
    formData.append("amount", amount); // Ensure amount is a valid string
    formData.append("paiement", paiement); // Ensure paiement is a valid string
    formData.append("description", `${dressName}, ${genre}`); // Replace with actual value

    // Calculate solde
    const solde = (
      Number(amount) * Number(quantity) -
      Number(paiement)
    ).toString();
    formData.append("solde_cal", solde); // Append calculated solde

    // Append required fields
    formData.append("toklo_menid", "1");
    formData.append("status", "ONGOING");
     // Ensure this is a valid number (converted to string)
    formData.append("client_id", "1"); // Ensure this is a valid number (converted to string)
    formData.append("client_name", selectedClient?.name || ""); // Ensure this is a valid number (converted to string)
    formData.append("client_lastname", selectedClient?.lastname || ""); // Ensure this is a valid number (converted to string)
    formData.append("client_phone", selectedClient?.telephone || ""); // Ensure this is a valid number (converted to string)

    // Append photos (files)
    if (fabricphoto?.uri) {
      formData.append("photos", {
        uri: fabricphoto.uri,
        name: "fabric.png", // Ensure the name is unique
        type: "image/png", // Ensure the type matches the file
      });
    }

    if (modelPhoto?.uri) {
      formData.append("photos", {
        uri: modelPhoto.uri,
        name: "model.png", // Ensure the name is unique
        type: "image/png", // Ensure the type matches the file
      });
    }

    mutate(formData);
    // try {
    //   const resp = await axiosConfigFile.post("/orders", formData);
    //   console.log("resp", resp.data);
    // } catch (error) {
    //   console.log("error", error);
    // }
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText
            style={{
              fontSize: SIZES.sm,
              fontWeight: "bold",
              marginTop: 20,
              textAlign: "center",
            }}
          >
            {dressName}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: SIZES.xs,
              fontWeight: "medium",
              marginTop: 0,
              textAlign: "center",
              color: Colors.app.primary,
            }}
          >
            {genre}
          </ThemedText>

          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              // borderColor: Colors.app.disabled,
              // borderWidth: StyleSheet.hairlineWidth,
              borderRadius: 20,
              boxShadow: Colors.shadow.card,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
            >
              {/* <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 25,
                margin: 4,
                width: 40,
                height: 40,
                backgroundColor: "white",
                borderWidth: 2,
                borderColor: Colors.app.primary,
                zIndex: 20
              }}
              onPress={() => setshowMModal()}
            >
              <Ionicons
                name="close-outline"
                size={SCREEN_WIDTH * 0.07}
                color={Colors.app.primary}
              />
            </TouchableOpacity> */}
            </View>

            {/* show current measure */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                flexWrap: "wrap",
              }}
            >
              {/* {dressMeasures?.map((item, i) => ( */}
              {selectedData?.map((item, i) => {
                return (
                  <ModifMeasure
                    key={i.toString()}
                    image={""}
                    title={item?.typemesure?.nom}
                    value={inputValues[item.typemesure?.nom] || ""}
                    onChangeValue={(text: string) =>
                      handleInputChange(item.typemesure?.nom, text)
                    }
                  />
                );
              })}

              {/* ))} */}
            </View>
            {/* compta */}

            <>
              <View
                style={{
                  marginHorizontal: 6,
                  marginVertical: 16,
                  backgroundColor: "white",
                  height: 2,
                }}
              />
              <View style={{ marginHorizontal: 20 }}>
                <OtherInput
                  required
                  label="Quantité"
                  placeholder="Ajoutez la quantité"
                  icon={
                    <Square3Stack3DIcon fill={Colors.app.primary} size={27} />
                  }
                  value={quantity}
                  setValue={setquantity}
                  keyboardType="numeric"
                />
                
              </View>
              <View style={{ marginHorizontal: 20 }}>
                <OtherInput
                  required
                  label="Montant"
                  placeholder="Saisissez le montant"
                  icon={<BanknotesIcon fill={Colors.app.primary} size={27} />}
                  value={amount}
                  setValue={setamount}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ marginHorizontal: 20 }}>
                <OtherInput
                  label="Avance"
                  placeholder="Saisissez l'avance"
                  icon={<MinusCircleIcon fill={Colors.app.primary} size={27} />}
                  value={paiement}
                  setValue={setpaiement}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ marginHorizontal: 20, marginVertical: 6 }}>
                <CustomButton
                  label="Continuer"
                  action={() => handleSubmit()}
                  loading={isPending}
                  disabled={true}
                />
              </View>
            </>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default memo(Measurement);

const styles = StyleSheet.create({});
