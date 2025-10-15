import {
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  PhotoIcon,
  UserIcon,
  InboxIcon,
  CalendarDaysIcon,
  CameraIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  Square3Stack3DIcon,
  MinusCircleIcon,
  BanknotesIcon,
  XMarkIcon,
} from "react-native-heroicons/solid";

import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import { Rs, SCREEN_H, SIZES } from "@/util/comon";
import { Colors } from "@/constants/Colors";
import ListModal from "@/components/ListModal";
import CustomButton from "@/components/form/CustomButton";
import { Sheet } from "@/components/Sheet";
import Measure from "@/components/takeOrder/Measure";
// import { TrueSheet } from "@lodev09/react-native-true-sheet";
import useDateTimePicker from "@/hooks/useDateTimePicker";
import useUpload from "@/hooks/useUpload";
import CameraComponent from "@/components/CameraCompo";
import Cinetpay from "@/components/Cinetpay";
import CinetPaySDK from "@/components/CinetpaySdk";
import FileSheet from "@/components/takeOrder/FileSheet";
import { IClient, IDress, TImage, TInvoice } from "@/interfaces/type";

import Animated, { BounceIn, BounceOut, FadeIn, FadeInDown, FadeOut, FadeOutDown } from "react-native-reanimated";
import CustomInput from "@/components/form/CustomInput";
import OtherInput from "@/components/form/OtherInput";
import UserItem from "@/components/user/UserItem";
import ClientList from "@/components/takeOrder/ClientList";
import DressType from "@/components/takeOrder/DressType";
import BottomSheetCompo from "@/components/BottomSheetCompo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import ModifMeasure from "@/components/takeOrder/ModifMeasure";
import useCreateOrder from "@/hooks/mutations/useNewOrder";
import LastAppointment from "@/components/LastAppointment";
import { Tabs } from "expo-router";
import Drawer from "expo-router/drawer";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/stores/user";
import { defaultRemindTime } from "@/utils";
import PaymentLottieCompo from "@/components/PaymentLottieCompo";
import SubscriptionCompo from "@/components/SubscriptionCompo";
import BackButton from "@/components/form/BackButton";
import userActiveToklomant from "@/hooks/mutations/userActiveToklomant";
import ActiveToklomanCompo from "@/components/ActiveToklomanCompo";
import useInvoice from "@/hooks/useInvoice";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

type Props = {};

interface CinetPayRef {
  checkout: (callback: () => void) => void;
}

type PatternImageCompoType = {
  label: string;
  img: string;
  openImagePicker: () => void;
  cleanPhoto: () => void;
};

type SelectedCompoType = {
  placeholder: string;
  icon: React.ReactNode;
  open: () => void;
};

type DatePickerCompoType = {
  label: string;
  datePicker: () => void;
};

function PatternImageCompo({
  label,
  openImagePicker,
  img,
  cleanPhoto,
}: PatternImageCompoType) {
  return (
    <View style={styles.patternImageContainer}>
      <Text style={styles.patternImageText}> {label} </Text>
      {img && (
        <AnimatedTouchableOpacity
          entering={BounceIn}
          exiting={BounceOut}
          onPress={cleanPhoto}
          style={styles.trashIcon}
        >
          <TrashIcon fill={Colors.app.warning} size={27} />
        </AnimatedTouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => openImagePicker()}
        style={styles.patternImage}
      >
        {!img ? (
          <PhotoIcon fill={Colors.app.primary} size={27} />
        ) : (
          <Image
            source={{ uri: img }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

function SelectedCompo({ placeholder, icon, open }: SelectedCompoType) {
  return (
    <TouchableOpacity
      onPress={() => open()}
      style={styles.selectedUserContainer}
    >
      <View style={styles.selectedUserLogo}>{icon}</View>
      <Text style={styles.selectedUserText}> {placeholder} </Text>
    </TouchableOpacity>
  );
}

function DatePickerCompo({ label, datePicker }: DatePickerCompoType) {
  return (
    <TouchableOpacity
      onPress={() => datePicker()}
      style={styles.datePickerContainer}
    >
      <Text style={styles.selectedUserText}> {label} </Text>
      <View style={[styles.selectedUserLogo]}>
        <CalendarDaysIcon fill={Colors.app.primary} size={27} />
      </View>
    </TouchableOpacity>
  );
}

const Page = (props: Props) => {
  const [isShowModal, setisShowModal] = useState(false);
  const [isDressTypeShowModal, setisDressTypeShowModal] = useState(false);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);

  const router = useRouter();


  // const sheet = useRef<TrueSheet>(null);
  // const chooseFileSheet = useRef<TrueSheet>(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {user, notify_token, subscribe} = useUserStore()

  const {
    date,
    showDatepicker,
    formattedDateTime,
    selectedHour,
    selectedMinute,
    DatePicker,
  } = useDateTimePicker();

  const { pickImage, handleRemoveImg, singleImage } = useUpload(true);
  const {handleInvoice} = useInvoice()

  const cinetpayRef = useRef<CinetPayRef>(null);

  const [fabricphoto, setFabricPhoto] = useState<TImage | null>(null);
  const [modelPhoto, setModelPhoto] = useState<TImage | null>(null);

  const [selectePicType, setSelectePicType] = useState<
    "FABRIC" | "MODEL" | null
  >(null);

  const [selectedUser, setSelectedUser] = useState<IClient | null>(null);
  const [selectedDress, setSelectedDress] = useState<IDress | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const [name, setName] = useState('');

  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  const [quantity, setquantity] = useState<string>("1");
  const [amount, setamount] = useState<string>("");
  const [paiement, setpaiement] = useState<string>("");

  // Memoized invoice calculation to avoid recalculation on every render
  const invoiceData = useMemo(() => {
    const total = Number(amount) * Number(quantity);
    return {
      storeName: user?.store_name ?? "",
      sotreSlogan: user?.store_slogan ?? "",
      storeAddress: "123 Avenue de la Mode, 75008 Paris",
      storePhone: user?.phone ?? "",
      clientFullName: selectedUser?.name +" " + selectedUser?.lastname,
      clientPhone: selectedUser?.telephone?? '',
      invoiceNumber: "FACT-2025-1234",
      invoiceDate: new Date().toLocaleDateString('fr-FR'),
      staus: "",
      dressName: selectedDress?.nom?? "",
      quantite: quantity?? "",
      price: Number(amount),
      totalPrice: total,
      paiement: Number(paiement),
      biTotal: total - Number(paiement)
    };
  }, [amount, quantity, paiement, selectedDress?.nom, selectedUser?.name, selectedUser?.lastname, selectedUser?.telephone, user?.store_name, user?.store_slogan, user?.phone]);

  const subscribeBottomSheet = useRef<BottomSheetModal>(null);
  const claimeActiveAccountBottomSheet = useRef<BottomSheetModal>(null);

  const { mutate, isPending } = useCreateOrder(closeBottomSheet,
      () => subscribeBottomSheet.current?.present(),
      () => handleInvoice(invoiceData));

  useEffect(() => {
    if(!subscribe) claimeActiveAccountBottomSheet.current?.present();

  }, [!subscribe]);

  // Debounced input change handler with useCallback to prevent recreation
  const handleInputChange = useCallback((typemesurename: string, value: string) => {
    const timeoutId = setTimeout(() => {
      setInputValues((prevValues) => ({
        ...prevValues,
        [typemesurename]: value,
      }));
    }, 150); // 150ms debounce delay

    return () => clearTimeout(timeoutId);
  }, []);

  // Optimized setters with useCallback and debouncing to prevent recreation and excessive re-renders
  const handleQuantityChange = useCallback((value: string) => {
    const timeoutId = setTimeout(() => {
      setquantity(value);
    }, 150); // 150ms debounce delay
    return () => clearTimeout(timeoutId);
  }, []);

  const handleAmountChange = useCallback((value: string) => {
    const timeoutId = setTimeout(() => {
      setamount(value);
    }, 150); // 150ms debounce delay
    return () => clearTimeout(timeoutId);
  }, []);

  const handlePaiementChange = useCallback((value: string) => {
    const timeoutId = setTimeout(() => {
      setpaiement(value);
    }, 150); // 150ms debounce delay
    return () => clearTimeout(timeoutId);
  }, []);

    const handleSubmit = async () => {

      if(!subscribe) return claimeActiveAccountBottomSheet.current?.present();
  
      Keyboard.dismiss();
  
      const formData = new FormData();
  
      
      
  
      // Append text fields
      formData.append("quantite", quantity); // Ensure quantity is a valid string
      formData.append("measure", JSON.stringify(inputValues)); // Convert Measure object to JSON string
      formData.append("date_depote", new Date().toLocaleDateString('fr-FR')) // Use ISO date format (YYYY-MM-DD)
      formData.append(
        "date_remise",
        date?.toLocaleDateString('fr-FR') || ""
      ); // Replace with actual value or handle empty case
      formData.append("deliveryHour", `${selectedHour}: ${selectedMinute}`); 
      formData.append("amount", amount); // Ensure amount is a valid string
      formData.append("paiement", paiement); // Ensure paiement is a valid string
      formData.append("description", `${selectedDress?.nom}, ${selectedDress?.genre}`); // Replace with actual value
  
      // Calculate solde
      const solde = (
        Number(amount) * Number(quantity) -
        Number(paiement)
      ).toString();
      formData.append("solde_cal", solde); // Append calculated solde

  
      // Append required fields
      if(user?.id){formData.append("toklo_menid", user.id)};

      formData.append("status", "ONGOING");
       // Ensure this is a valid number (converted to string)
      formData.append("client_id", selectedUser?.id); // Ensure this is a valid number (converted to string)
      formData.append("client_name", selectedUser?.name || ""); // Ensure this is a valid number (converted to string)
      formData.append("client_lastname", selectedUser?.lastname || ""); // Ensure this is a valid number (converted to string)
      formData.append("client_phone", selectedUser?.telephone || ""); // Ensure this is a valid number (converted to string)
      formData.append("notifToken", notify_token || " ");

      formData.append("notif_monrning", user?.notif_monrning || defaultRemindTime.notif_monrning);
      formData.append("notif_midday", user?.notif_midday ? user?.notif_midday : defaultRemindTime.notif_midday );
      formData.append("notif_evening", user?.notif_evening? user?.notif_evening : defaultRemindTime.notif_evening );

      // reminde days
      formData.append("notif_remind_days", user?.notif_remind_days?  user?.notif_remind_days?.toString() : defaultRemindTime.notif_remind_days.toString() );

      formData.append("notif_remind_seven", user?.notif_remind_seven?  user?.notif_remind_seven?.toString() : '' );
      formData.append("notif_remind_three", user?.notif_remind_three?  user?.notif_remind_three?.toString() : '' );
      formData.append("notif_remind_two", user?.notif_remind_two?  user?.notif_remind_two?.toString() : '' );
      formData.append("notif_remind_one", user?.notif_remind_one?  user?.notif_remind_one?.toString() : '' );
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
    };
  

  // Function to handle post-payment actions
  const handlePostPayment = () => {
    // Add your post-payment logic here
    console.log("Payment successful, updating database...");
  };

  // Function to initiate payment
  const handlePaymentClick = () => {
    cinetpayRef.current?.checkout(handlePostPayment);
  };

  // Present the sheet ✅
  const present = async () => {
    // await bottomSheetModalRef.current?.present();
    //  await sheet.current?.present()
    // console.log('horray! sheet has been presented 💩')
     scrollViewRef.current?.scrollTo({ y: SCREEN_H, animated: true})

  };

  const presentShooseFileSheet = async () => {
    // await chooseFileSheet.current?.present();
    await bottomSheetModalRef?.current?.present();
    console.log("horray! sheet has been presented 💩");
  };

  // Dismiss the sheet ✅
  function closeBottomSheet (){
    // setSelectedUser(null)
    // setSelectedDress(null)
    // bottomSheetModalRef.current?.dismiss();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true})


  };

  function handleSelectUser() {
    setisShowModal(true);
  }

  function handleSelectDressType() {
    setisDressTypeShowModal(true);
  }

  function handleChosenUser(user: IClient) {
    setSelectedUser(user);
    setisShowModal(false);
  }

  function handleChosenDress(dress: IDress) {
    console.log(dress);
    setSelectedDress(dress);
    setisDressTypeShowModal(false);
  }

  return (
    <>
     {isShowModal && <ClientList
        isShowModal={isShowModal}
        closeModal={() => setisShowModal(false)}
        setSelectedUser={handleChosenUser}
      />}

     {isDressTypeShowModal && <DressType
        isShowModal={isDressTypeShowModal}
        closeModal={() => setisDressTypeShowModal(false)}
        setSelectedDress={handleChosenDress}
      />}

    {isOpeningCamera &&  <Modal
        style={{ flex: 1 }}
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpeningCamera(false)}
        visible={isOpeningCamera}
      >
        <CameraComponent
          setPhoto={
            selectePicType === "FABRIC" ? setFabricPhoto : setModelPhoto
          }
          closeCamera={async () => {
            // await chooseFileSheet.current?.dismiss();
            bottomSheetModalRef.current?.dismiss()
            setIsOpeningCamera(false);
          }}
        />
      </Modal>}

     


      <Animated.View entering={FadeInDown} style={{flex: 1, backgroundColor: "white"}} >
       
         {/* {!subscribe && <PaymentLottieCompo />} */}


        <ScrollView
        ref={scrollViewRef}
          scrollEnabled={selectedUser && date && selectedDress ? true : false}
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_H} // Optional: for snapping to each screen
          decelerationRate="fast" // Optional: for smoother snapping
          keyboardShouldPersistTaps="handled"

          style={{ flex: 1 }}
        >
          <View style={[styles.screen, ]}>
            {/* First screen content */}

            <LastAppointment 
              appointment={{
                id: 123,
                quantite: "2 costumes",
                tissus: "Super 120 Bleu Marine",
                status: "IN_PROGRESS",
                measure: {
                  taille: "42",
                  epaules: "48cm",
                  manches: "64cm",
                  poitrine: "102cm"
                },
                date_depote: "15/03/2025",
                date_remise: "25/03/2025",
                deliveryHour: "14:30",
                amount: "125000",
                paiement: "AVANCE",
                description: "Costume de mariage avec doublure personnalisée et boutons dorés",
                photos: "costume_photo1.jpg",
                solde_cal: "75000",
                client_name: "Konan",
                client_phone: "+22507893456",
                client_lastname: "Kouamé",
                toklo_menid: 5,
                client_id: 42,
                updatedat: "2025-03-10T10:15:30.123Z"
                }} 
              onPress={() => {}}
            />

            <View style={{padding: Rs(20)}}>

            
            {/* <ThemedText style={{ fontSize: SIZES.sm, fontWeight: "bold" }}>
              Ajoutez le client
            </ThemedText> */}
            <SelectedCompo
              open={handleSelectUser}
              placeholder={
                selectedUser
                  ? `${selectedUser.name} ${selectedUser.lastname}`
                  : "Sélectionnez le client"
              }
              icon={<UserIcon fill={Colors.app.primary} size={27} />}
            />

            <SelectedCompo
              open={handleSelectDressType}
              placeholder={
                selectedDress
                  ? `${selectedDress.nom} (${selectedDress.genre})`
                  : "Sélectionnez le modèle "
              }
              icon={<InboxIcon fill={Colors.app.primary} size={27} />}
            />

            {/* <ThemedText style={{ fontSize: SIZES.sm, fontWeight: "bold" }}>
              Images
            </ThemedText> */}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 20,
              }}
            >
              <PatternImageCompo
                label="Tissu"
                img={fabricphoto?.uri}
                cleanPhoto={() => setFabricPhoto(null)}
                openImagePicker={() => {
                  setSelectePicType("FABRIC");
                  presentShooseFileSheet();
                }}
              />
              <PatternImageCompo
                label="Modèle "
                img={modelPhoto?.uri}
                cleanPhoto={() => setModelPhoto(null)}
                openImagePicker={() => {
                  setSelectePicType("MODEL");
                  presentShooseFileSheet();
                }}
              />
            </View>
            {/* <ThemedText style={{ fontSize: SIZES.sm, fontWeight: "bold" }}>
              Date de livraision
            </ThemedText> */}
            {/* Date picker */}
            <DatePickerCompo
              label={
                date
                  ? date.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }) +
                    ` à  ${ selectedHour ? selectedHour : '..'}H: ${ selectedMinute ? selectedMinute : '..'
                    }`
                  : "Sélectionnez la date de livraison"
              }
              datePicker={() => {
                showDatepicker();
                // if(date){
                //   console.log(date)
                //   showTimepicker()
                // }
              }}
            />
            <DatePicker />

            {/* Date picker */}

            <View style={{ marginTop: 10 }}>
              <CustomButton
                label="Continuez"
                action={() => {
                  selectedUser && date && selectedDress ? present() : {};
                  // router.push('/DressMeasure')
                }}
                disabled={selectedUser && date && selectedDress ? true : false}
              />
            </View>
          
           </View>
           
          </View>

          <View style={[styles.screen, {  padding: Rs(16) }]}>
            {/* bottomsheets */}
            {/* <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={['90%']} > */}

            {/* <Measure
              fabricphoto={fabricphoto}
              modelPhoto={modelPhoto}
              selectedClient={selectedUser}
              deliveryDate={date}
              deliveryHoure={`${selectedHour}: ${selectedMinute}`}
              closeBottomSheet={() => closeBottomSheet()}
              selectedData={selectedDress?.categoriemesure || []}
              dressName={selectedDress?.nom || ""}
              genre={selectedDress?.genre || ""}
             /> */}
            {/* </BottomSheetCompo> */}
            {/* <Sheet sheet={sheet}>
            </Sheet> */}

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
              // marginTop: 20,
              textAlign: "center",
            }}
          >
            {selectedDress?.nom}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: SIZES.xs,
              fontWeight: "medium",
              marginBottom: 20,
              textAlign: "center",
              color: Colors.app.primary,
            }}
          >
            {selectedDress?.genre}
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
              {selectedDress?.categoriemesure.map((item, i) => {
                return (
                  <ModifMeasure
                    key={i.toString()}
                    image={""}
                    title={item?.typemesure?.nom}
                    value={inputValues[item.typemesure?.nom] || ""}
                    onChangeValue={handleInputChange}
                    measurementKey={item.typemesure?.nom}
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
                  setValue={handleQuantityChange}
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
                  setValue={handleAmountChange}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ marginHorizontal: 20 }}>
                <OtherInput
                  label="Avance"
                  placeholder="Saisissez l'avance"
                  icon={<MinusCircleIcon fill={Colors.app.primary} size={27} />}
                  value={paiement}
                  setValue={handlePaiementChange}
                  keyboardType="numeric"
                />
                { Number(paiement) > Number(amount) * Number(quantity) &&                
                  <Animated.Text entering={FadeIn} exiting={FadeOut} style={{fontSize: SIZES.xs, color: Colors.app.error}} >Le montant avancé doit être inférieur au montant de la commande</Animated.Text>
                }             
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

          {/* <Sheet sheet={chooseFileSheet}> */}
          <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[200]} >

            <View style={{ height: 200, padding: 20 }}>
              <FileSheet
                label="Utiliser votre caméra"
                icon={<CameraIcon fill={Colors.app.primary} size={27} />}
                action={() => {
                  setIsOpeningCamera(true);

                  if (selectePicType === "FABRIC") {
                    setFabricPhoto(fabricphoto);
                  } else {
                    setModelPhoto(modelPhoto);
                  }
                }}
              />
              <FileSheet
                label="Utiliser votre galerie"
                icon={<PhotoIcon fill={Colors.app.primary} size={27} />}
                action={async () => {
                  bottomSheetModalRef?.current?.dismiss();
                  const selectedImage = await pickImage();
                  if (selectedImage) {
                    if (selectePicType === "FABRIC") {
                      setFabricPhoto(selectedImage);
                    } else {
                      setModelPhoto(selectedImage);
                    }
                  }
                }}
              />
            </View>
          </BottomSheetCompo>
          {/* </Sheet> */}

          {/* payement bottomsheet */}

          <BottomSheetCompo bottomSheetModalRef={subscribeBottomSheet} snapPoints={["100%"]} >
                <View style={{padding: Rs(20), gap: Rs(20)}} >
                  <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}} >
                  <Text style={{color: Colors.app.texte, fontSize: SIZES.lg, fontWeight: "bold"}} >
                    Votre abonnement a expiré.
                  </Text>
                  <BackButton backAction={() => subscribeBottomSheet?.current?.dismiss() } icon={<XMarkIcon fill={Colors.app.texte} size={Rs(20)} />} />
                  </View>
                  <Text style={{color: Colors.app.available.unav_txt}}> 
                    Pour continuer à profiter de tous nos services et fonctionnalités, veuillez renouveler votre abonnement.
                  </Text>
                </View>
                <SubscriptionCompo redirectURL="(tab)/add-dress" closeBottomSheet={() => subscribeBottomSheet?.current?.dismiss()} />
          </BottomSheetCompo>
             {/* payement bottomsheet */}

             <BottomSheetCompo bottomSheetModalRef={claimeActiveAccountBottomSheet} snapPoints={['40%']} >
               <ActiveToklomanCompo closeBottomSheet={() => claimeActiveAccountBottomSheet?.current?.dismiss()} />
              </BottomSheetCompo>
             {/* payement bottomsheet */}

        </ScrollView>
      </Animated.View>
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  selectedUserContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.app.disabled,
    paddingBottom: 10,
  },
  screen: {
    height: SCREEN_H,
    width: "100%",
    // padding: Rs(16),
  },

  datePickerContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.app.texteLight,
    backgroundColor: "white",
    borderRadius: 6,
    padding: 10,
  },
  selectedUserText: {
    fontSize: SIZES.sm - 2,
    color: Colors.app.texteLight,
  },
  selectedUserLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.app.secondary,
  },

  patternImageContainer: {
    width: 170,
    height: 160,
    backgroundColor: "white",
    borderRadius: 6,
    padding: 10,
    boxShadow: Colors.shadow.card,
    position: "relative",
  },
  patternImageText: {
    fontSize: SIZES.sm - 2,
    color: Colors.app.texteLight,
    marginBottom: 6,
  },
  patternImage: {
    width: "100%",
    height: 112,
    backgroundColor: Colors.app.secondary,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  trashIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 5,
    top: Rs(0),
    zIndex: 100,
    //  backgroundColor: "red",
  },
});
