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
import CustomButton from "@/components/form/CustomButton";
import FileSheet from "@/components/takeOrder/FileSheet";
import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import useDateTimePicker from "@/hooks/useDateTimePicker";
import useUpload from "@/hooks/useUpload";
import { IClient, IDress, TDressPart, TImage } from "@/interfaces/type";
import { Rs, SCREEN_H, SIZES } from "@/util/comon";

import ActiveToklomanCompo from "@/components/ActiveToklomanCompo";
import BottomSheetCompo from "@/components/BottomSheetCompo";
import LastAppointment from "@/components/LastAppointment";
import PaymentResult from "@/components/PaymentResult";
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
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
};

type SelectedCompoType = {
  placeholder: string;
  icon: React.ReactNode;
  open: () => void;
  styles: ReturnType<typeof createStyles>;
};

type DatePickerCompoType = {
  dateLabel: string;
  timeLabel: string;
  onDatePress: () => void;
  onTimePress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
};

function PatternImageCompo({
  label,
  openImagePicker,
  img,
  cleanPhoto,
  styles,
  theme,
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
          <TrashIcon fill={theme.gold} size={27} />
        </AnimatedTouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => openImagePicker()}
        style={styles.patternImage}
      >
        {!img ? (
          <PhotoIcon fill={theme.primary} size={27} />
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

function SelectedCompo({ placeholder, icon, open, styles }: SelectedCompoType) {
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
  styles,
  theme,
}: DatePickerCompoType) {
  return (
    <View style={styles.datePickerContainer}>
      <TouchableOpacity onPress={onDatePress} style={styles.datePickerButton}>
        <CalendarDaysIcon fill={theme.primary} size={22} />
        <Text numberOfLines={1} style={styles.datePickerText}>
          {dateLabel}
        </Text>
        <ChevronDownIcon fill={theme.primary} size={18} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onTimePress} style={styles.datePickerButton}>
        <ClockIcon fill={theme.primary} size={22} />
        <Text numberOfLines={1} style={styles.datePickerText}>
          {timeLabel}
        </Text>
        <ChevronDownIcon fill={theme.primary} size={18} />
      </TouchableOpacity>
    </View>
  );
}

const Page = (props: Props) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  const hasSelectedDeliveryTime =
    selectedHour !== null && selectedMinute !== null;
  const canContinueToMeasurements = Boolean(
    selectedUser && date && selectedDress && hasSelectedDeliveryTime,
  );
  const canSaveOrder = Boolean(quantity.trim() && amount.trim());

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
    [keyboardHeight, styles.measureStepScrollContent],
  );
  const billingScrollContentStyle = useMemo(
    () => [
      styles.billingStepScrollContent,
      { paddingBottom: keyboardHeight + Rs(220) },
    ],
    [keyboardHeight, styles.billingStepScrollContent],
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
  const activationResultBottomSheetRef = useRef<BottomSheetModal>(null);

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

  const formatSelectedTime = (hour: number | null, minute: number | null) => {
  if (hour === null || minute === null) {
    return "";
  }

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};

    const handleSubmit = async () => {
      Keyboard.dismiss();

      if (!hasSelectedDeliveryTime) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }
  
      const formData = new FormData();

      formData.append("quantite", quantity); 
      formData.append("measure", JSON.stringify(measureValuesForSubmit)); 
      formData.append("date_depote", new Date().toLocaleDateString('fr-FR')) 
      formData.append("date_remise", date?.toLocaleDateString('fr-FR') || "" );
      formData.append("deliveryHour", formatSelectedTime(selectedHour,selectedMinute));
      formData.append("amount", amount); 
      formData.append("paiement", paiement); 
      formData.append("description", `${selectedDress?.nom}, ${selectedDress?.genre}`); 
  
      // Calculate solde
      const solde = (
        Number(amount)- Number(paiement)).toString();
      formData.append("solde_cal", solde); 

  
      if(user?.id){formData.append("toklo_menid", user.id.toString())};

      formData.append("status", "ONGOING");

      formData.append("client_id", selectedUser?.id?.toString() ?? ""); 
      formData.append("client_name", selectedUser?.name || ""); 
      formData.append("client_lastname", selectedUser?.lastname || ""); 
      formData.append("client_phone", selectedUser?.telephone || ""); 
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
    if (!canContinueToMeasurements) {
      return;
    }

     scrollViewRef.current?.scrollTo({ y: SCREEN_H, animated: true})

  };

  const presentPaymentStep = async () => {
     scrollViewRef.current?.scrollTo({ y: SCREEN_H * 2, animated: true})
  };

  const presentShooseFileSheet = async () => {
    await bottomSheetModalRef?.current?.present();
    
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

     


      <Animated.View entering={FadeInDown} style={styles.pageContainer} >

        <ScrollView
        ref={scrollViewRef}
          nestedScrollEnabled
          automaticallyAdjustKeyboardInsets
          scrollEnabled={Boolean(canContinueToMeasurements && keyboardHeight === 0)}
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
              icon={<UserIcon fill={theme.primary} size={27} />}
              styles={styles}
            />

            <SelectedCompo
              open={handleSelectDressType}
              placeholder={
                selectedDress
                  ? `${selectedDress.nom} (${selectedDressStructureLabel})`
                  : "Sélectionnez le modèle "
              }
              icon={<InboxIcon fill={theme.primary} size={27} />}
              styles={styles}
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
                styles={styles}
                theme={theme}
              />
              <PatternImageCompo
                label="Modèle "
                img={modelPhoto?.uri || ''}
                cleanPhoto={() => setModelPhoto(null)}
                openImagePicker={() => {
                  setSelectePicType("MODEL");
                  presentShooseFileSheet();
                }}
                styles={styles}
                theme={theme}
              />
            </View>
            <Text style={styles.sectionHeading}>
              Date et heure de livraision
            </Text>
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
              styles={styles}
              theme={theme}
            />
            <DatePicker />

            {/* Date picker */}

            <View style={{ marginTop: 10 }}>
              <CustomButton
                label="Continuez"
                action={() => {
                  if (canContinueToMeasurements) {
                    present();
                  }
                  // router.push('/DressMeasure')
                }}
                disabled={canContinueToMeasurements}
                pressDisabled={!canContinueToMeasurements}
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
          <Text style={styles.stepTitle}>
            {selectedDress?.nom}
          </Text>
          <Text style={styles.stepSubtitle}>
            {selectedDress?.genre}
            {selectedDressStructureLabel ? ` - ${selectedDressStructureLabel}` : ""}
          </Text>
          
          <View style={styles.stepCard}>
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
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? Rs(24) : 0}
              style={styles.measureKeyboardAvoider}
            >
              <ScrollView
                automaticallyAdjustKeyboardInsets
                contentContainerStyle={billingScrollContentStyle}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
              >
                <Text style={styles.stepTitle}>
                  Facturation
                </Text>
                <Text style={styles.stepSubtitle}>
                  Quantité, montant et avance
                </Text>
                <Image
                  source={require('@/assets/images/measure/double-arrow.png')}
                  resizeMode="cover"
                  style={styles.doubleArrow}
                />

                <View style={styles.billingCard}>
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
                      icon={<BanknotesIcon fill={theme.primary} size={27} />}
                      value={amount}
                      setValue={handleAmountChange}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ marginHorizontal: 20 }}>
                    <OtherInput
                      label="Avance"
                      placeholder="Saisissez l'avance"
                      icon={<MinusCircleIcon fill={theme.primary} size={27} />}
                      value={paiement}
                      setValue={handlePaiementChange}
                      keyboardType="numeric"
                    />
                    { Number(paiement) > Number(amount) * Number(quantity) &&                
                      <Animated.Text entering={FadeIn} exiting={FadeOut} style={styles.validationError}>Le montant avancé doit être inférieur au montant de la commande</Animated.Text>
                    }             
                  </View>

                  <View style={{ marginHorizontal: 20, marginVertical: 6 }}>
                    <CustomButton
                      label="Enregistrer"
                      action={() => canSaveOrder ? handleSubmit() : null}
                      loading={isPending}
                      disabled={canSaveOrder}
                      pressDisabled={!canSaveOrder}
                    />
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>

          {/* model and image pick bottomsheet*/}
          <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[200]} >

            <View style={styles.fileSheetContent}>
              <FileSheet
                label="Utiliser votre caméra"
                icon={<CameraIcon fill={theme.primary} size={27} />}
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
                icon={<PhotoIcon fill={theme.primary} size={27} />}
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
                <View style={styles.subscribeIntro} >
                  <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}} >
                  <Text style={styles.subscribeTitle}>
                    Votre abonnement a expiré.
                  </Text>
                  <BackButton backAction={() => subscribeBottomSheet?.current?.dismiss() } icon={<XMarkIcon fill={theme.text} size={Rs(20)} />} />
                  </View>
                  <Text style={styles.subscribeText}> 
                    Pour continuer à profiter de tous nos services et fonctionnalités, veuillez renouveler votre abonnement.
                  </Text>
                </View>
                <SubscriptionCompo redirectURL="(tab)/add-dress" closeBottomSheet={() => subscribeBottomSheet?.current?.dismiss()} />
          </BottomSheetCompo>
             {/* payement bottomsheet */}

             <BottomSheetCompo bottomSheetModalRef={claimeActiveAccountBottomSheet} snapPoints={['40%']} >
               <ActiveToklomanCompo
                closeBottomSheet={() => claimeActiveAccountBottomSheet?.current?.dismiss()}
                onActivationSuccess={() => {
                  claimeActiveAccountBottomSheet?.current?.dismiss();
                  activationResultBottomSheetRef.current?.present();
                }}
               />
              </BottomSheetCompo>
             {/* Activation account */}

      <BottomSheetCompo
        bottomSheetModalRef={activationResultBottomSheetRef}
        snapPoints={['100%']}
      >
        <PaymentResult
          title="Activation"
          subtitle="réussie"
          cardTile="Détail de l'activation"
          amount={0}
          paidAt={new Date().toISOString()}
          paymentMethod="Activation gratuite"
          planName="Mois gratuit Toklo"
          transactionId="Activation gratuite"
          onPrimaryPress={() => {
            activationResultBottomSheetRef.current?.dismiss();
          }}
          onSecondaryPress={() => {
            activationResultBottomSheetRef.current?.dismiss();
          }}
        />
      </BottomSheetCompo>

        </ScrollView>
      </Animated.View>
    </>
  );
};

export default Page;

const createStyles = (theme: AppTheme) => StyleSheet.create({
  pageContainer: {
    backgroundColor: theme.background,
    flex: 1,
  },
  sectionHeading: {
    color: theme.text,
    fontSize: SIZES.sm,
    fontWeight: "bold",
  },
  stepTitle: {
    color: theme.text,
    fontSize: SIZES.sm,
    fontWeight: "bold",
    textAlign: "center",
  },
  stepSubtitle: {
    color: theme.primary,
    fontSize: SIZES.xs,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
  },
  stepCard: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: theme.background === "#FFFDF8"
      ? "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.06)"
      : "0px 5px 18px rgba(0, 0, 0, 0.28)",
    flex: 1,
  },
  billingCard: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: theme.background === "#FFFDF8"
      ? "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.06)"
      : "0px 5px 18px rgba(0, 0, 0, 0.28)",
    flex: 1,
    paddingBottom: Rs(12),
    paddingTop: Rs(10),
  },
  validationError: {
    color: theme.danger,
    fontSize: SIZES.xs,
  },
  fileSheetContent: {
    backgroundColor: theme.card,
    height: 200,
    padding: 20,
  },
  subscribeIntro: {
    backgroundColor: theme.card,
    gap: Rs(20),
    padding: Rs(20),
  },
  subscribeTitle: {
    color: theme.text,
    fontSize: SIZES.lg,
    fontWeight: "bold",
  },
  subscribeText: {
    color: theme.danger,
  },
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
    backgroundColor: theme.background,
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
    borderColor: theme.border,
    backgroundColor: theme.card,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  datePickerText: {
    flex: 1,
    fontSize: SIZES.sm - 2,
    color: theme.muted,
  },
  selectedUserText: {
    fontSize: SIZES.sm - 2,
    color: theme.muted,
  },
  selectedUserLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.primaryLight,
  },
  selectedUserCauri: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },

  patternImageContainer: {
    width: 170,
    height: 160,
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    padding: 10,
    boxShadow: theme.background === "#FFFDF8"
      ? "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.06)"
      : "0px 5px 18px rgba(0, 0, 0, 0.28)",
    position: "relative",
  },
  patternImageText: {
    fontSize: SIZES.sm - 2,
    color: theme.muted,
    marginBottom: 6,
  },
  patternImage: {
    width: "100%",
    height: 112,
    backgroundColor: theme.primaryLight,
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
  billingStepScrollContent: {
    flexGrow: 1,
    paddingBottom: Rs(180),
  },
  measureKeyboardAvoider: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: theme.background,
  },
  measureSectionsContainer: {
    paddingHorizontal: Rs(12),
    paddingVertical: Rs(8),
    gap: Rs(14),
  },
  measureTabs: {
    flexDirection: "row",
    gap: Rs(8),
    backgroundColor: theme.primaryLight,
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
    backgroundColor: theme.primary,
  },
  measureTabText: {
    fontSize: SIZES.sm - 1,
    fontWeight: "600",
    color: theme.muted,
  },
  measureTabTextActive: {
    color: "white",
  },
  measureSection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    paddingBottom: Rs(12),
  },
  measureSectionTitle: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: theme.text,
    marginBottom: Rs(8),
  },
  measureCategory: {
    marginTop: Rs(4),
  },
  measureCategoryTitle: {
    fontSize: SIZES.xs,
    fontWeight: "600",
    color: theme.primary,
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
    color: theme.muted,
    paddingVertical: Rs(8),
    textAlign: "center",
  },
});
