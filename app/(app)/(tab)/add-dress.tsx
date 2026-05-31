import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChevronDownIcon,
  ClockIcon,
  InboxIcon,
  MinusCircleIcon,
  PhotoIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon
} from "react-native-heroicons/solid";

import CameraComponent from "@/components/CameraCompo";
import { ThemedText } from "@/components/ThemedText";
import CustomButton from "@/components/form/CustomButton";
import FileSheet from "@/components/takeOrder/FileSheet";
import { Colors } from "@/constants/Colors";
import useDateTimePicker from "@/hooks/useDateTimePicker";
import useUpload from "@/hooks/useUpload";
import { IClient, IDress, TDressPart, TImage } from "@/interfaces/type";
import { Rs, SCREEN_H, SIZES } from "@/util/comon";

import ActiveToklomanCompo from "@/components/ActiveToklomanCompo";
import BottomSheetCompo from "@/components/BottomSheetCompo";
import LastAppointment from "@/components/LastAppointment";
import SubscriptionCompo from "@/components/SubscriptionCompo";
import BackButton from "@/components/form/BackButton";
import OtherInput from "@/components/form/OtherInput";
import OtherInputIncrement from "@/components/form/OtherInputIncrement";
import ClientList from "@/components/takeOrder/ClientList";
import DressType from "@/components/takeOrder/DressType";
import ModifMeasure from "@/components/takeOrder/ModifMeasure";
import useCreateOrder from "@/hooks/mutations/useNewOrder";
import useToklomantSubscribeStatus from "@/hooks/mutations/useToklomantSubscribeStatus";
import useInvoice from "@/hooks/useInvoice";
import { useUserStore } from "@/stores/user";
import { defaultRemindTime } from "@/utils";
import {
  createMeasurementInputKey,
  getDressMeasurementGroups,
  getDressStructureLabel,
  getMeasurementName,
  getMeasurementUrl,
  hasConfiguredMeasurements,
} from "@/utils/dressMeasurements";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Animated, { BounceIn, BounceOut, FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

type Props = object;

type MeasureSubmitValue = {
  value: string;
  url: string;
};

const measurePartSubmitKeys = {
  HAUT: "haut",
  BAS: "bas",
  COMPLET: "complet",
} as const;

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
  dateLabel: string;
  timeLabel: string;
  onDatePress: () => void;
  onTimePress: () => void;
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
            style={{ width: "100%", height: "100%" , borderRadius: 10,}}
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
      <View style={{flexDirection: "row", alignItems: "center"}}>

      <View style={styles.selectedUserLogo}>{icon}</View>
      <Text style={styles.selectedUserText}> {placeholder} </Text>
      </View>
      <Image
        source={require("@/assets/images/measure/separator.png")}
        style={styles.selectedUserSeparator}
      />
      
      <View style={[styles.selectedUserLogo,]}>
        <Image
          source={require("@/assets/images/measure/cauri.png")}
          style={styles.selectedUserCauri}
        />
      </View>

    </TouchableOpacity>
  );
}

function DatePickerCompo({
  dateLabel,
  timeLabel,
  onDatePress,
  onTimePress,
}: DatePickerCompoType) {
  return (
    <View style={styles.datePickerContainer}>
      <TouchableOpacity onPress={onDatePress} style={styles.datePickerButton}>
        <CalendarDaysIcon fill={Colors.app.primary} size={22} />
        <Text numberOfLines={1} style={styles.datePickerText}>
          {dateLabel}
        </Text>
        <ChevronDownIcon fill={Colors.app.primary} size={18} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onTimePress} style={styles.datePickerButton}>
        <ClockIcon fill={Colors.app.primary} size={22} />
        <Text numberOfLines={1} style={styles.datePickerText}>
          {timeLabel}
        </Text>
        <ChevronDownIcon fill={Colors.app.primary} size={18} />
      </TouchableOpacity>
    </View>
  );
}

const Page = (props: Props) => {
  const [isShowModal, setisShowModal] = useState(false);
  const [isDressTypeShowModal, setisDressTypeShowModal] = useState(false);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {user, notify_token} = useUserStore()

  const {
    date,
    showDatepicker,
    showTimepicker,
    selectedHour,
    selectedMinute,
    DatePicker,
  } = useDateTimePicker();

  const { pickImage } = useUpload(true);
  const {handleInvoice} = useInvoice()

  const [fabricphoto, setFabricPhoto] = useState<TImage | null>(null);
  const [modelPhoto, setModelPhoto] = useState<TImage | null>(null);

  const [selectePicType, setSelectePicType] = useState<
    "FABRIC" | "MODEL" | null
  >(null);

  const [selectedUser, setSelectedUser] = useState<IClient | null>(null);
  const [selectedDress, setSelectedDress] = useState<IDress | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const measureScrollViewRef = useRef<ScrollView>(null);
  const activeMeasurementKeyRef = useRef<string | null>(null);

  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeMeasurementPart, setActiveMeasurementPart] =
    useState<TDressPart | null>(null);

  const [quantity, setquantity] = useState<string>("1");
  const [amount, setamount] = useState<string>("");
  const [paiement, setpaiement] = useState<string>("");

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

  const selectedDressStructureLabel = useMemo(() => {
    return selectedDress ? getDressStructureLabel(selectedDress) : "";
  }, [selectedDress]);

  const measurementGroups = useMemo(() => {
    return getDressMeasurementGroups(selectedDress);
  }, [selectedDress]);

  const hasMeasurements = useMemo(() => {
    return hasConfiguredMeasurements(measurementGroups);
  }, [measurementGroups]);

  const visibleMeasurementGroups = useMemo(() => {
    return measurementGroups.filter((group) =>
      group.categories.some((categoryBlock) => categoryBlock.measurements.length > 0),
    );
  }, [measurementGroups]);

  const activeMeasurementGroup = useMemo(() => {
    return (
      visibleMeasurementGroups.find((group) => group.part === activeMeasurementPart) ??
      visibleMeasurementGroups[0] ??
      measurementGroups[0]
    );
  }, [activeMeasurementPart, measurementGroups, visibleMeasurementGroups]);

  const activeMeasurementCount = useMemo(() => {
    return (
      activeMeasurementGroup?.categories.reduce(
        (total, categoryBlock) => total + categoryBlock.measurements.length,
        0,
      ) ?? 0
    );
  }, [activeMeasurementGroup]);

  const measurementInputOffsets = useMemo(() => {
    const offsets: { [key: string]: number } = {};
    let currentOffset = Rs(70);

    if (visibleMeasurementGroups.length > 1) {
      currentOffset += Rs(52);
    }

    if (!activeMeasurementGroup) {
      return offsets;
    }

    [activeMeasurementGroup].forEach((group) => {
      currentOffset += Rs(40);

      group.categories.forEach((categoryBlock) => {
        if (categoryBlock.measurements.length === 0) {
          return;
        }

        const showCategoryTitle =
          selectedDress?.type === "COMPOSE" || group.categories.length > 1;

        if (showCategoryTitle) {
          currentOffset += Rs(28);
        }

        categoryBlock.measurements.forEach((measurement, index) => {
          const inputKey = createMeasurementInputKey(
            group.part,
            categoryBlock.category,
            measurement,
            index,
          );
          offsets[inputKey] = currentOffset + Math.floor(index / 2) * Rs(58);
        });

        currentOffset += Math.ceil(categoryBlock.measurements.length / 2) * Rs(58);
      });
    });

    return offsets;
  }, [activeMeasurementGroup, selectedDress?.type, visibleMeasurementGroups.length]);

  const measureScrollContentStyle = useMemo(
    () => [
      styles.measureStepScrollContent,
      { paddingBottom: keyboardHeight + Rs(260) },
    ],
    [keyboardHeight],
  );

  const scrollToMeasurement = useCallback(
    (measurementKey: string, animated = true) => {
      const y = Math.max(0, (measurementInputOffsets[measurementKey] ?? 0) - Rs(24));

      measureScrollViewRef.current?.scrollTo({ y, animated });
    },
    [measurementInputOffsets],
  );

  const measureValuesForSubmit = useMemo(() => {
    const values: Record<string, Record<string, MeasureSubmitValue>> = {};

    measurementGroups.forEach((group) => {
      const partKey = measurePartSubmitKeys[group.part];

      group.categories.forEach((categoryBlock) => {
        categoryBlock.measurements.forEach((measurement, index) => {
          const inputKey = createMeasurementInputKey(
            group.part,
            categoryBlock.category,
            measurement,
            index,
          );
          const value = inputValues[inputKey];

          if (value) {
            const measurementName = getMeasurementName(measurement);

            if (!values[partKey]) {
              values[partKey] = {};
            }

            values[partKey][measurementName] = {
              value,
              url: getMeasurementUrl(measurement),
            };
          }
        });
      });
    });

    return values;
  }, [inputValues, measurementGroups]);

  const subscribeBottomSheet = useRef<BottomSheetModal>(null);
  const claimeActiveAccountBottomSheet = useRef<BottomSheetModal>(null);

  const { mutate, isPending } = useCreateOrder({
    closeBottomSheet,
    subscribeBottomSheet: () => subscribeBottomSheet.current?.present(),
    claimActiveFreeTime: () => claimeActiveAccountBottomSheet.current?.present(),
    handleInvoice: () => handleInvoice(invoiceData),
  });

  const { mutate: checkSubscribeStatus } = useToklomantSubscribeStatus(() =>
    claimeActiveAccountBottomSheet.current?.present(),
  );

  useEffect(() => {
    if (user?.id) {
      checkSubscribeStatus();
    }
  }, [checkSubscribeStatus, user?.id]);

  useEffect(() => {
    const nextActivePart =
      visibleMeasurementGroups[0]?.part ?? measurementGroups[0]?.part ?? null;

    setActiveMeasurementPart((currentPart) => {
      if (
        currentPart &&
        measurementGroups.some((group) => group.part === currentPart)
      ) {
        return currentPart;
      }

      return nextActivePart;
    });
  }, [measurementGroups, visibleMeasurementGroups]);

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(keyboardShowEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);

      if (activeMeasurementKeyRef.current) {
        setTimeout(() => {
          if (activeMeasurementKeyRef.current) {
            scrollToMeasurement(activeMeasurementKeyRef.current);
          }
        }, 180);
      }
    });
    const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
      activeMeasurementKeyRef.current = null;
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [scrollToMeasurement]);

  const handleMeasurementFocus = useCallback(
    (measurementKey: string) => {
      activeMeasurementKeyRef.current = measurementKey;

      setTimeout(() => {
        scrollToMeasurement(measurementKey);
      }, 120);

      setTimeout(() => {
        scrollToMeasurement(measurementKey);
      }, 360);
    },
    [scrollToMeasurement],
  );

  const handleInputChange = useCallback((typemesurename: string, value: string) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [typemesurename]: value,
    }));
  }, []);

  const handleQuantityChange = useCallback((value: string) => {
    setquantity(value);
  }, []);

  const handleAmountChange = useCallback((value: string) => {
    setamount(value);
  }, []);

  const handlePaiementChange = useCallback((value: string) => {
    setpaiement(value);
  }, []);

    const handleSubmit = async () => {
      Keyboard.dismiss();
  
      const formData = new FormData();

      formData.append("quantite", quantity); 
      formData.append("measure", JSON.stringify(measureValuesForSubmit)); 
      formData.append("date_depote", new Date().toLocaleDateString('fr-FR')) 
      formData.append("date_remise", date?.toLocaleDateString('fr-FR') || "" );
      formData.append("deliveryHour", `${selectedHour}:${selectedMinute}`);
      formData.append("amount", amount); 
      formData.append("paiement", paiement); 
      formData.append("description", `${selectedDress?.nom}, ${selectedDress?.genre}`); 
  
      // Calculate solde
      const solde = (
        Number(amount) * Number(quantity) -
        Number(paiement)
      ).toString();
      formData.append("solde_cal", solde); 

  
      // Append required fields
      if(user?.id){formData.append("toklo_menid", user.id.toString())};

      formData.append("status", "ONGOING");
       // Ensure this is a valid number (converted to string)
      formData.append("client_id", selectedUser?.id?.toString() ?? ""); // Ensure this is a valid number (converted to string)
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
        } as unknown as Blob);
      }
  
      if (modelPhoto?.uri) {
        formData.append("photos", {
          uri: modelPhoto.uri,
          name: "model.png", // Ensure the name is unique
          type: "image/png", // Ensure the type matches the file
        } as unknown as Blob);
      }
  
      mutate(formData);
    };
  

  const present = async () => {
     scrollViewRef.current?.scrollTo({ y: SCREEN_H, animated: true})

  };

  const presentPaymentStep = async () => {
     scrollViewRef.current?.scrollTo({ y: SCREEN_H * 2, animated: true})
  };

  const presentShooseFileSheet = async () => {
    // await chooseFileSheet.current?.present();
    await bottomSheetModalRef?.current?.present();
    console.log("horray! sheet has been presented 💩");
  };

  // Dismiss the sheet ✅
  function closeBottomSheet (){
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
    setInputValues({});
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
          nestedScrollEnabled
          automaticallyAdjustKeyboardInsets
          scrollEnabled={Boolean(selectedUser && date && selectedDress && keyboardHeight === 0)}
          showsVerticalScrollIndicator={false}
          snapToInterval={keyboardHeight > 0 ? undefined : SCREEN_H}
          decelerationRate="fast" 
          keyboardShouldPersistTaps="handled"

          style={{ flex: 1 }}
        >
          <View style={[styles.screen, ]}>
            {/* First screen content */}

            <LastAppointment />

            <View style={{paddingHorizontal: Rs(20)}}>
            
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
                  ? `${selectedDress.nom} (${selectedDressStructureLabel})`
                  : "Sélectionnez le modèle "
              }
              icon={<InboxIcon fill={Colors.app.primary} size={27} />}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 10,
                gap: Rs(12)
              }}
            >
              <PatternImageCompo
                label="Tissu"
                img={fabricphoto?.uri || ''}
                cleanPhoto={() => setFabricPhoto(null)}
                openImagePicker={() => {
                  setSelectePicType("FABRIC");
                  presentShooseFileSheet();
                }}
              />
              <PatternImageCompo
                label="Modèle "
                img={modelPhoto?.uri || ''}
                cleanPhoto={() => setModelPhoto(null)}
                openImagePicker={() => {
                  setSelectePicType("MODEL");
                  presentShooseFileSheet();
                }}
              />
            </View>
            <ThemedText style={{ fontSize: SIZES.sm, fontWeight: "bold" }}>
              Date et heure de livraision
            </ThemedText>
            {/* Date picker */}
            <DatePickerCompo
              dateLabel={
                date
                  ? date.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Date"
              }
              timeLabel={
                selectedHour !== null && selectedMinute !== null
                  ? `${selectedHour.toString().padStart(2, "0")}:${selectedMinute
                      .toString()
                      .padStart(2, "0")}`
                  : "Heure"
              }
              onDatePress={showDatepicker}
              onTimePress={showTimepicker}
            />
            <DatePicker />

            {/* Date picker */}

            <View style={{ marginTop: 10 }}>
              <CustomButton
                label="Continuez"
                action={() => {
                  if (selectedUser && date && selectedDress) {
                    present();
                  }
                  // router.push('/DressMeasure')
                }}
                disabled={selectedUser && date && selectedHour && selectedMinute && selectedDress ? true : false}
              />
            </View>
          
           </View>
           
          </View>

          <View style={[styles.screen, {  padding: Rs(16) }]}>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? Rs(24) : 0}
        style={styles.measureKeyboardAvoider}
      >
        <ScrollView
          ref={measureScrollViewRef}
          nestedScrollEnabled
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={measureScrollContentStyle}
          scrollIndicatorInsets={{ bottom: Rs(140) }}
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
            {selectedDressStructureLabel ? ` - ${selectedDressStructureLabel}` : ""}
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
            <View style={styles.measureSectionsContainer}>
              {!hasMeasurements && (
                <Text style={styles.measureEmptyText}>
                  Aucune mesure configurée
                </Text>
              )}

              {hasMeasurements && visibleMeasurementGroups.length > 1 && (
                <View style={styles.measureTabs}>
                  {visibleMeasurementGroups.map((group) => {
                    const isActive = group.part === activeMeasurementGroup?.part;

                    return (
                      <TouchableOpacity
                        key={group.part}
                        activeOpacity={0.85}
                        onPress={() => {
                          Keyboard.dismiss();
                          measureScrollViewRef.current?.scrollTo({ y: 0, animated: true });
                          setActiveMeasurementPart(group.part);
                        }}
                        style={[
                          styles.measureTab,
                          isActive && styles.measureTabActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.measureTabText,
                            isActive && styles.measureTabTextActive,
                          ]}
                        >
                          {group.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {hasMeasurements && activeMeasurementGroup && (
                <View key={activeMeasurementGroup.part} style={styles.measureSection}>
                  {visibleMeasurementGroups.length <= 1 && (
                    <Text style={styles.measureSectionTitle}>
                      {activeMeasurementGroup.label}
                    </Text>
                  )}

                  {activeMeasurementCount === 0 ? (
                    <Text style={styles.measureEmptyText}>
                      Aucune mesure pour{" "}
                      {activeMeasurementGroup.part === "COMPLET"
                        ? "le vêtement complet"
                        : `le ${activeMeasurementGroup.label.toLowerCase()}`}
                    </Text>
                  ) : (
                    activeMeasurementGroup.categories.map((categoryBlock) => {
                      if (categoryBlock.measurements.length === 0) {
                        return null;
                      }

                      const showCategoryTitle =
                        selectedDress?.type === "COMPOSE" ||
                        activeMeasurementGroup.categories.length > 1;

                      return (
                        <View
                          key={`${activeMeasurementGroup.part}-${categoryBlock.category.id}`}
                          style={styles.measureCategory}
                        >
                          {showCategoryTitle && (
                            <Text style={styles.measureCategoryTitle}>
                              {categoryBlock.category.nom}
                            </Text>
                          )}

                          <View style={styles.measureGrid}>
                            {categoryBlock.measurements.map((item, i) => {
                              const measurementKey = createMeasurementInputKey(
                                activeMeasurementGroup.part,
                                categoryBlock.category,
                                item,
                                i,
                              );

                              return (
                                <ModifMeasure
                                  key={measurementKey}
                                  image={getMeasurementUrl(item)}
                                  title={getMeasurementName(item)}
                                  value={inputValues[measurementKey] || ""}
                                  onChangeValue={handleInputChange}
                                  measurementKey={measurementKey}
                                  onFocus={() => handleMeasurementFocus(measurementKey)}
                                />
                              );
                            })}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
            {/* compta */}

            <View style={{ marginHorizontal: 20, marginVertical: 16 }}>
              <CustomButton
                label="Continuer"
                action={() => presentPaymentStep()}
                disabled={true}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>


          </View>

          <View style={[styles.screen, {  padding: Rs(16) }]}>
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
                    textAlign: "center",
                  }}
                >
                  Facturation
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
                  Quantité, montant et avance
                </ThemedText>
                <Image
                  source={require('@/assets/images/measure/double-arrow.png')}
                  resizeMode="cover"
                  style={styles.doubleArrow}
                />

                <View
                  style={{
                    flex: 1,
                    backgroundColor: "white",
                    borderRadius: 20,
                    boxShadow: Colors.shadow.card,
                    paddingTop: Rs(10),
                    paddingBottom: Rs(12),
                  }}
                >
                  <View style={{ marginHorizontal: 20 }}>
                    <OtherInputIncrement
                      required
                      label="Quantité"
                      placeholder="Ajoutez la quantité"
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
                      label="Enregister"
                      action={() => quantity && amount ? handleSubmit() : null}
                      loading={isPending}
                      disabled={quantity || amount? true : false}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>

          {/* model and image pick bottomsheet*/}
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
                  if (selectedImage && !Array.isArray(selectedImage)) {
                    const nextImage: TImage = {
                      uri: selectedImage.uri,
                      fileName: selectedImage.fileName ?? "image.png",
                      mineType: selectedImage.mineType ?? "image/png",
                    };

                    if (selectePicType === "FABRIC") {
                      setFabricPhoto(nextImage);
                    } else {
                      setModelPhoto(nextImage);
                    }
                  }
                }}
              />
            </View>
          </BottomSheetCompo>
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
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginVertical: 10,
    paddingBottom: 22,
    width: "100%"
  },
  selectedUserSeparator: {
    position: "absolute",
    bottom: -2,
    alignSelf: "center",
    width: "100%",
    height: 25,
    resizeMode: "cover",
    zIndex: 2,
  },
  screen: {
    height: SCREEN_H,
    width: "100%",
    // padding: Rs(16),
  },

  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: Rs(6),
  },
  datePickerButton: {
    flex: 1,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.app.disabled,
    backgroundColor: "white",
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  datePickerText: {
    flex: 1,
    fontSize: SIZES.sm - 2,
    color: Colors.app.texteLight,
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
  selectedUserCauri: {
    width: 70,
    height: 70,
    resizeMode: "contain",
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
  },
  doubleArrow:{
    width: "88%",
    height: Rs(26),
    alignSelf: "center",
    marginTop: Rs(-8),
    marginBottom: Rs(8),
  },
  measureStepScrollContent: {
    flexGrow: 1,
    paddingBottom: Rs(220),
  },
  measureKeyboardAvoider: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
  },
  measureSectionsContainer: {
    paddingHorizontal: Rs(12),
    paddingVertical: Rs(8),
    gap: Rs(14),
  },
  measureTabs: {
    flexDirection: "row",
    gap: Rs(8),
    backgroundColor: Colors.app.secondary,
    borderRadius: 8,
    padding: Rs(4),
  },
  measureTab: {
    flex: 1,
    height: Rs(38),
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  measureTabActive: {
    backgroundColor: Colors.app.primary,
  },
  measureTabText: {
    fontSize: SIZES.sm - 1,
    fontWeight: "600",
    color: Colors.app.texteLight,
  },
  measureTabTextActive: {
    color: "white",
  },
  measureSection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.app.disabled,
    paddingBottom: Rs(12),
  },
  measureSectionTitle: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: Colors.app.texte,
    marginBottom: Rs(8),
  },
  measureCategory: {
    marginTop: Rs(4),
  },
  measureCategoryTitle: {
    fontSize: SIZES.xs,
    fontWeight: "600",
    color: Colors.app.primary,
    marginLeft: Rs(4),
    marginBottom: Rs(4),
  },
  measureGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: Rs(8),
  },
  measureEmptyText: {
    fontSize: SIZES.xs,
    color: Colors.app.texteLight,
    paddingVertical: Rs(8),
    textAlign: "center",
  },
});
