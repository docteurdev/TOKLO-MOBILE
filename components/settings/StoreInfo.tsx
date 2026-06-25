import { StoreSchema } from '@/constants/formSchemas';
import useToklomanStore from '@/hooks/mutations/useToklomanStore';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import useLocation from '@/hooks/useLocation';
import useUpload from '@/hooks/useUpload';
import { QueryKeys } from '@/interfaces/queries-key';
import { Toklomen } from '@/interfaces/user';
import { useUserStore } from '@/stores/user';
import { base, baseURL } from '@/util/axios';
import { Rs } from '@/util/comon';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  findNodeHandle,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { MapPinIcon, XMarkIcon } from 'react-native-heroicons/solid';
import * as Yup from 'yup';
import BottomSheetCompo from '../BottomSheetCompo';
import BackButton from '../form/BackButton';
import CustomButton from '../form/CustomButton';
import PhoneInput from '../form/PhoneInput';

type Props = Yup.InferType<typeof StoreSchema>;

type StoreCoordinates = {
  latitude: number;
  longitude: number;
};

type ScrollTargetRef = React.RefObject<TextInput | View | null>;

const parseStoreLocation = (value?: string | object | null): StoreCoordinates | null => {
  if (!value) return null;

  try {
    const locationJSON = typeof value === 'string' ? JSON.parse(value) : value;
    const latitude = Number(locationJSON?.x);
    const longitude = Number(locationJSON?.y);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch (error) {
    console.error('Invalid store location JSON', error);
    return null;
  }
};

const StoreInfo = ({handleClose, isNOtBack}: {handleClose: () => void, isNOtBack?: boolean}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDarkMode = theme.background !== '#FFFDF8';
  const statusBarStyle = isDarkMode ? 'light-content' : 'dark-content';
  const statusBarBackgroundColor = isDarkMode ? theme.background : theme.card;
  const [storeLogoUrl, setStoreLogoUrl] = useState(null);
  const [storeCoverUrl, setStoreCoverUrl] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD - US Dollar');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<StoreCoordinates | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentScrollYRef = useRef(0);
  const keyboardTopRef = useRef(Dimensions.get('window').height);
  const focusedTargetRef = useRef<ScrollTargetRef | null>(null);
  const phoneGroupRef = useRef<View>(null);
  const whatsappGroupRef = useRef<View>(null);
  const locationBottomSheetRef = useRef<BottomSheetModal>(null);
  const [pendingLocation, setPendingLocation] = useState('');
  const [pendingCoordinates, setPendingCoordinates] = useState<StoreCoordinates | null>(null);

  const router = useRouter()
  
  const { isPending, mutate } = useToklomanStore();
  const {user} = useUserStore();
  const {pickImage: picklogo, handleRemoveImg: removeLogo, singleImage: logo} = useUpload(true);
  const {pickImage: pickBanner, handleRemoveImg: removeBanner, singleImage: banner} = useUpload(true);

  const {data, isLoading, error, refetch} = useQuery<Toklomen, Error>({
    queryKey: QueryKeys.tokloman.byToklomanStore,
    queryFn: async (): Promise<Toklomen> => {  // Explicit return type
      try {
        const resp = await axios.get(`${baseURL}/tokloMen/${Number(user?.id)}`);
        return resp.data; // Ensure `resp.data` is returned
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
      }
    },
  });

  const {location, displayindAddress, getAddressFromCoordinates, address} = useLocation();

  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      { paddingBottom: keyboardHeight > 0 ? keyboardHeight + Rs(170) : Rs(80) },
    ],
    [keyboardHeight, styles.scrollContent],
  );

  const locationLabel = useMemo(() => {
    return selectedLocation || (data?.location ? address : displayindAddress) || '';
  }, [address, data?.location, displayindAddress, selectedLocation]);

  const scrollToTarget = useCallback((targetRef: ScrollTargetRef, delay = 120) => {
    focusedTargetRef.current = targetRef;

    setTimeout(() => {
      if (!targetRef.current) return;

      const nodeHandle = findNodeHandle(targetRef.current);
      if (nodeHandle) {
        scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
          nodeHandle,
          Rs(110),
          true,
        );
      }

      targetRef.current.measureInWindow((_x, y, _width, height) => {
        const windowHeight = Dimensions.get('window').height;
        const keyboardTop = keyboardTopRef.current || windowHeight;
        const visibleBottom = Math.min(keyboardTop, windowHeight) - Rs(110);
        const targetBottom = y + height;

        if (targetBottom <= visibleBottom) return;

        scrollViewRef.current?.scrollTo({
          y: Math.max(0, currentScrollYRef.current + targetBottom - visibleBottom),
          animated: true,
        });
      });
    }, delay);
  }, []);

  useEffect(() => {
    const storeCoordinates = parseStoreLocation(data?.location);

    if (storeCoordinates) {
      setSelectedCoordinates(storeCoordinates);
      getAddressFromCoordinates(storeCoordinates.latitude, storeCoordinates.longitude);
    }
  }, [data?.location, getAddressFromCoordinates]);

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(keyboardShowEvent, (event) => {
      keyboardTopRef.current = event.endCoordinates.screenY || Dimensions.get('window').height;
      setKeyboardHeight(event.endCoordinates.height);

      if (focusedTargetRef.current) {
        scrollToTarget(focusedTargetRef.current, Platform.OS === 'ios' ? 80 : 180);
      }
    });
    const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
      focusedTargetRef.current = null;
      keyboardTopRef.current = Dimensions.get('window').height;
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [scrollToTarget]);

  
  
  const currencies = [
    'USD - US Dollar',
    'EUR - Euro',
    'GBP - British Pound',
    'CAD - Canadian Dollar',
    'AUD - Australian Dollar',
    'JPY - Japanese Yen',
  ];

  const renderCurrencyDropdown = () => {
    if (!showCurrencyDropdown) return null;
    
    return (
      <View style={styles.dropdown}>
        {currencies.map((currency, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dropdownItem}
            onPress={() => {
              setSelectedCurrency(currency);
              setShowCurrencyDropdown(false);
            }}
          >
            <Text style={[
              styles.dropdownItemText,
              selectedCurrency === currency && styles.selectedDropdownItem
            ]}>
              {currency}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleOpenLocationSheet = useCallback(() => {
    Keyboard.dismiss();

    const currentCoordinates = location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : null;

    setPendingCoordinates(selectedCoordinates ?? parseStoreLocation(data?.location) ?? currentCoordinates);
    setPendingLocation(locationLabel);
    locationBottomSheetRef.current?.present();
  }, [data?.location, location, locationLabel, selectedCoordinates]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!location) return;

    const currentCoordinates = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setPendingCoordinates(currentCoordinates);
    setPendingLocation(displayindAddress || address || 'Position actuelle détectée');
    getAddressFromCoordinates(currentCoordinates.latitude, currentCoordinates.longitude);
  }, [address, displayindAddress, getAddressFromCoordinates, location]);

  const handleSubmit = (values: Props) => {
    Keyboard.dismiss();
    const formData = new FormData();

    formData.append("store_name", values.store_name);
    formData.append("store_slogan", values?.store_slogan || '');
    formData.append("store_description", values?.store_description || '');
    // formData.append("store_logo", storeLogoUrl);
    // formData.append("store_coverImg", storeCoverUrl);
    formData.append("phone", values.phone || '');
    formData.append("whatsapp", values.whatsapp ?? '');

    const currentCoordinates = location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : null;
    const coordinatesToSave = selectedCoordinates ?? parseStoreLocation(data?.location) ?? currentCoordinates;

    if (coordinatesToSave) {
      formData.append("location", JSON.stringify({
        x: coordinatesToSave.latitude,
        y: coordinatesToSave.longitude,
      }));
    }
    
    if (logo?.uri) {
     formData.append("store", {
       uri: logo.uri,
       name: "logo.png", // Ensure the name is unique
       type: "image/png", // Ensure the type matches the file
     } as any);
   }

   if (banner?.uri) {
     formData.append("store", {
       uri: banner.uri,
       name: "banner.png", // Ensure the name is unique
       type: "image/png", // Ensure the type matches the file
     } as any);
   }
    mutate(formData);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBackgroundColor} />
      
      <View style={styles.header}>
       {!isNOtBack && <BackButton icon={ <XMarkIcon size={20} color={theme.text} /> } backAction={() => router.back()} />}
        <Text style={styles.headerTitle}>Paramètre boutique</Text>
      </View>
      
      <Formik
        initialValues={{ 
          store_name: data?.store_name || data?.lastname + '' + data?.name, 
          phone: data?.phone || '', 
          whatsapp: data?.whatsapp || '',
          store_description: data?.store_description || '',
          store_slogan: data?.store_slogan || '',
          location: selectedLocation || address || displayindAddress || ''
        }}
        validationSchema={StoreSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? Rs(24) : 0}
            style={styles.keyboardAvoider}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollContainer}
              contentContainerStyle={scrollContentStyle}
              automaticallyAdjustKeyboardInsets
              nestedScrollEnabled
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              scrollEventThrottle={16}
              scrollIndicatorInsets={{ bottom: keyboardHeight + Rs(120) }}
              showsVerticalScrollIndicator={false}
              onScroll={(event) => {
                currentScrollYRef.current = event.nativeEvent.contentOffset.y;
              }}
            >
              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Nom de la boutique</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <Text style={styles.fieldDescription}>
                  Il apparaîtra sur votre boutique, factures
                </Text>
                <TextInput
                  style={[styles.input, errors.store_name && touched.store_name ? styles.inputError : null]}
                  value={values.store_name}
                  onChangeText={handleChange('store_name')}
                  onBlur={handleBlur('store_name')}
                />
                {errors.store_name && touched.store_name && (
                  <Text style={styles.errorText}>{errors.store_name}</Text>
                )}
              </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Slogan de la boutique</Text>
                <Text style={styles.required}></Text>
              </View>
              <Text style={styles.fieldDescription}>
                Il apparaîtra sur votre boutique
              </Text>
              <TextInput
                style={[styles.input, errors.store_slogan && touched.store_slogan ? styles.inputError : null]}
                value={values.store_slogan}
                onChangeText={handleChange('store_slogan')}
                onBlur={handleBlur('store_slogan')}
              />
              {errors.store_name && touched.store_slogan && (
                <Text style={styles.errorText}>{errors.store_slogan}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Description </Text>
                <Text style={styles.required}></Text>
              </View>
              <Text style={styles.fieldDescription}>
                Il apparaîtra sur votre boutique
              </Text>
              <TextInput
                style={[styles.input, errors.store_description && touched.store_description ? styles.inputError : null, {height: 150, textAlignVertical: 'top'}]}
                value={values.store_description}
                onChangeText={handleChange('store_description')}
                onBlur={handleBlur('store_description')}
              />
              {errors.store_name && touched.store_description && (
                <Text style={styles.errorText}>{errors.store_description}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Logo</Text>
              <Text style={styles.fieldDescription}>
                Choisissez un logo pour votre boutique
              </Text>
              
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {!logo && data?.store_logo && <Image source={{ uri: base + 'uploads/' + data?.store_logo }} style={styles.avatar} />}
                  
                  {logo && <Image source={{ uri: logo.uri }} style={styles.avatar} /> }

                  {!logo && !data?.store_logo && <Text style={styles.avatarText}> {data?.lastname.charAt(0).toUpperCase()} {data?.name.charAt(0).toUpperCase()} </Text>}
                 
                </View>
                
                <View style={styles.avatarActions}>
                  <TouchableOpacity style={styles.updateButton} onPress={() => {
                    picklogo()
                  }}>
                    <Text style={styles.updateButtonText}>Modifier</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bannière</Text>
              <Text style={styles.fieldDescription}>
                Choisissez une bannière pour votre boutique
              </Text>
              
              <TouchableOpacity
              style={[styles.avatarContainer, {backgroundColor: "transparent"}]}
              onPress={() => {
               pickBanner()
             }}
              >
                <View style={[styles.avatar, {flex: 1, borderRadius: Rs(6), height: 120, overflow: "hidden"}]}> 
                  {!banner && data?.store_coverImg && <Image source={{ uri: base + 'uploads/' + data?.store_coverImg }} resizeMode='cover' style={{width: "100%", height: "100%", }} /> }
                  {banner && <Image source={{ uri: banner.uri }} resizeMode='cover' style={{width: "100%", height: "100%", }} /> }
                  { !banner && !data?.store_coverImg && <Text style={styles.avatarText}>B</Text>}
                
                </View>
                
                {/* <View style={styles.avatarActions}>
                  <TouchableOpacity style={styles.updateButton} onPress={() => {
                    pickBanner()
                  }}>
                    <Text style={styles.updateButtonText}>Modifier</Text>
                  </TouchableOpacity>
                </View> */}
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Localisation</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <Text style={styles.fieldDescription}>
                Choisissez la localisation de votre boutique
              </Text>
              <TouchableOpacity 
                style={[
                  styles.input, 
                  styles.locationInput,
                  errors.location && touched.location ? styles.inputError : null
                ]}
                onPress={handleOpenLocationSheet}
              >
                <MapPinIcon size={24} color={theme.primary} />
               <Text numberOfLines={2} ellipsizeMode="tail" style={styles.locationText}>
                {locationLabel || 'Choisir la localisation'}
               </Text>
              </TouchableOpacity>
              {errors.location && touched.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>

            <View ref={phoneGroupRef} style={styles.formGroup}>
              <Text style={styles.fieldDescription}>
                Il apparaîtra sur votre boutique, factures
              </Text>
              <PhoneInput
                label="Numéro de téléphone"
                placeholder="0712345678"
                keyboardType="phone-pad"
                value={values.phone}
                handleChange={handleChange('phone')}
                handleOnBlur={handleBlur('phone')}
                error={errors.phone}
                touched={touched.phone}
                onFocus={() => scrollToTarget(phoneGroupRef, Platform.OS === 'ios' ? 80 : 180)}
              />
            </View>

            <View ref={whatsappGroupRef} style={styles.formGroup}>
              <Text style={styles.fieldDescription}>
                Il apparaîtra sur votre boutique, factures
              </Text>
              <PhoneInput
                label="Numéro whatsapp"
                placeholder="xx-xx-xx-xx-xx"
                keyboardType="phone-pad"
                value={values.whatsapp}
                handleChange={handleChange('whatsapp')}
                handleOnBlur={handleBlur('whatsapp')}
                error={errors.whatsapp}
                touched={touched.whatsapp}
                onFocus={() => scrollToTarget(whatsappGroupRef, Platform.OS === 'ios' ? 80 : 180)}
              />
            </View>
            
            <View style={styles.formGroup}>
              <CustomButton
               label='Enregistrer'
               action={handleSubmit}
               disabled
               loading={isPending}
              />
            </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <BottomSheetCompo
            bottomSheetModalRef={locationBottomSheetRef}
            snapPoints={[Rs(270)]}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
          >
            <View style={styles.locationSheet}>
              <View style={styles.locationSheetHeader}>
                <Text style={styles.locationSheetTitle}>Modifier la localisation</Text>
                <TouchableOpacity
                  onPress={() => locationBottomSheetRef.current?.dismiss()}
                  style={styles.locationSheetClose}
                >
                  <XMarkIcon color={theme.text} size={18} />
                </TouchableOpacity>
              </View>

              {/* <TouchableOpacity
                disabled={!location}
                onPress={handleUseCurrentLocation}
                style={[
                  styles.locationOption,
                  !location && styles.locationOptionDisabled,
                ]}
              >
                <View style={styles.locationOptionIcon}>
                  <MapPinIcon size={20} color={theme.primary} />
                </View>
                <View style={styles.locationOptionContent}>
                  <Text style={styles.locationOptionTitle}>Utiliser ma position actuelle</Text>
                  <Text numberOfLines={2} style={styles.locationOptionText}>
                    {displayindAddress || (location ? 'Position détectée' : 'Position indisponible')}
                  </Text>
                </View>
              </TouchableOpacity> */}

              <View style={styles.locationPreview}>
                <Text style={styles.locationPreviewLabel}>Aperçu</Text>
                <Text numberOfLines={3} style={styles.locationPreviewText}>
                  {pendingLocation || 'Aucune localisation sélectionnée'}
                </Text>
              </View>

                <CustomButton 
                label='Confirmer' 
                action={() => {
                    if (!pendingCoordinates) return;

                    const nextLocation = pendingLocation || displayindAddress || address || 'Position actuelle détectée';
                    setSelectedCoordinates(pendingCoordinates);
                    setSelectedLocation(nextLocation);
                    setFieldValue('location', nextLocation);
                    locationBottomSheetRef.current?.dismiss();
                  }}
                  disabled
                  
                  />
              
            </View>
          </BottomSheetCompo>
          </>
        )}
      </Formik>
    </View>
  );
};


const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.card,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: "row",
    alignItems: "center",
    gap: Rs(30)
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  inputError: {
   borderColor: theme.danger,
 },
  errorText: {
   color: theme.danger,
   fontSize: 12,
   marginTop: 4,
 },
  tabContainer: {
    flexDirection: 'row',
  },
  selectedTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  selectedTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  scrollContainer: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.muted,
    marginBottom: 8,
  },
  formGroup: {
    backgroundColor: theme.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
  },
  required: {
    color: theme.danger,
    marginLeft: 4,
    fontSize: 16,
  },
  fieldDescription: {
    fontSize: 13,
    color: theme.muted,
    marginTop: 2,
    marginBottom: 8,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    color: theme.text,
    backgroundColor: theme.card,
  },
  locationInput: {
    minHeight: 48,
    height: 'auto',
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  locationText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 17,
    color: theme.text,
  },
  locationSheet: {
    backgroundColor: theme.card,
    paddingHorizontal: Rs(18),
    paddingTop: Rs(6),
    paddingBottom: Rs(24),
    gap: Rs(14),
  },
  locationSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationSheetTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  locationSheetClose: {
    width: Rs(34),
    height: Rs(34),
    borderRadius: Rs(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primaryLight,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(12),
    padding: Rs(14),
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Rs(16),
    backgroundColor: theme.goldLight,
  },
  locationOptionDisabled: {
    opacity: 0.55,
  },
  locationOptionIcon: {
    width: Rs(42),
    height: Rs(42),
    borderRadius: Rs(21),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primaryLight,
  },
  locationOptionContent: {
    flex: 1,
    minWidth: 0,
  },
  locationOptionTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  locationOptionText: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 17,
    marginTop: Rs(2),
  },
  locationPreview: {
    padding: Rs(14),
    borderRadius: Rs(14),
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  locationPreviewLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Rs(5),
    textTransform: 'uppercase',
  },
  locationPreviewText: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
  },
  locationSheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(10),
  },
  locationCancelButton: {
    flex: 1,
    height: Rs(48),
    borderRadius: Rs(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primaryLight,
  },
  locationCancelText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  locationConfirmButton: {
    flex: 1,
    height: Rs(48),
    borderRadius: Rs(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
  },
  locationConfirmButtonDisabled: {
    opacity: 0.5,
  },
  locationConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.gold,
  },
  avatarActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  updateButton: {
    marginRight: 16,
  },
  updateButtonText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {},
  deleteButtonText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  websiteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  httpPrefix: {
    paddingHorizontal: 10,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: theme.primaryLight,
    borderRightWidth: 1,
    borderRightColor: theme.border,
  },
  httpPrefixText: {
    fontSize: 14,
    color: theme.muted,
  },
  websiteInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: theme.text,
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  currencySelectorText: {
    fontSize: 15,
    color: theme.text,
  },
  dropdown: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 6,
    marginTop: 4,
    elevation: 3,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownItemText: {
    fontSize: 15,
    color: theme.text,
  },
  selectedDropdownItem: {
    fontWeight: '600',
    color: theme.primary,
  },
  spacing: {
    height: 40,
  },
});

export default StoreInfo;
