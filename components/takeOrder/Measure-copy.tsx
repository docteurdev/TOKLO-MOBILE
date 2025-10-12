import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";

import { BanknotesIcon } from "react-native-heroicons/solid";
import { Square3Stack3DIcon } from "react-native-heroicons/solid";
import { MinusCircleIcon } from "react-native-heroicons/solid";

import OtherInput from "@/components/form/OtherInput";
// import ModifMeasure from "@/components/takeOrder/ModifMeasure";
import { Colors } from "@/constants/Colors";
import { SCREEN_WIDTH, SIZES } from "@/util/comon";
import { CategorieMesure, IClient, TImage } from "@/interfaces/type";
import { ThemedText } from "../ThemedText";
import CustomButton from "../form/CustomButton";
import { axiosConfigFile } from "@/util/axios";
import axios from "axios";
import useNotif from "@/hooks/useNotification";
import useCreateOrder from "@/hooks/mutations/useNewOrder";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import BottomSheetInput from "../form/BottomSheetInput";
import { TextInput } from "react-native";

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

// ModifMeasure.tsx (update this component)

const ModifMeasure = ({ image, title, value, onChangeValue }) => {
  return (
    <View >
      <Text >{title}</Text>
      <BottomSheetTextInput
        value={value}
        onChangeText={onChangeValue}
        keyboardType="numeric"
        style={{borderWidth: 1, borderColor: 'black', borderRadius: 10, padding: 10}}
        placeholder={`Entrer ${title}`}
      />
    </View>
  );
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

 // Measurement.tsx
return (
  <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1, backgroundColor: Colors.app.secondary }}>
        <ThemedText style={styles.titleText}>
          {dressName}
        </ThemedText>
        <ThemedText style={styles.subtitleText}>
          {genre}
        </ThemedText>

        <View style={styles.contentCard}>
          {/* Your existing content */}
          <View style={styles.measuresContainer}>
            {selectedData?.map((item, i) => (
              <ModifMeasure
                key={i.toString()}
                image={""}
                title={item?.typemesure?.nom}
                value={inputValues[item.typemesure?.nom] || ""}
                onChangeValue={(text: string) =>
                  handleInputChange(item.typemesure?.nom, text)
                }
              />
            ))}
          </View>

          {/* <View style={styles.divider} /> */}

          <View style={styles.inputsContainer}>
            <TextInput
              value={quantity}
              keyboardType="numeric"
              onChangeText={setquantity}
              placeholder="Ajoutez la quantité"
              style={styles.input}
            />

            <TextInput
              value={amount}
              keyboardType="numeric"
              onChangeText={setamount}
              placeholder="Montant"
              style={styles.input}
            />

            <TextInput
              value={paiement}
              keyboardType="numeric"
              onChangeText={setpaiement}
              placeholder="Avance"
              style={styles.input}
            />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              label="Continuer"
              action={handleSubmit}
              loading={isPending}
              disabled={true}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
)};

export default Measurement;


const styles = StyleSheet.create({
  titleText: {
    fontSize: SIZES.sm,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: SIZES.xs,
    fontWeight: "medium",
    marginTop: 0,
    textAlign: "center",
    color: Colors.app.primary,
  },
  contentCard: {
    flex: 1,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
  },
  measuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  divider: {
    marginHorizontal: 6,
    marginVertical: 16,
    backgroundColor: "white",
    height: 2,
  },
  inputsContainer: {
    gap: 16,
    marginHorizontal: 20,
  },
  input: {
    color: Colors.app.primary,
    fontSize: SIZES.sm,
    fontWeight: "bold",
    textAlign: "center",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
});
