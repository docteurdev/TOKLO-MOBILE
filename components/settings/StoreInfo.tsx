import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MapPinIcon, XMarkIcon } from 'react-native-heroicons/solid';
import { Colors } from '@/constants/Colors';
import BlowingBtn from '../form/BlowingBtn';
import { axiosConfigFile, base, baseURL } from '@/util/axios';
import axios from 'axios';
import useToklomanStore from '@/hooks/mutations/useToklomanStore';
import { StoreSchema } from '@/constants/formSchemas';
import { useQuery } from '@tanstack/react-query';
import { Toklomen } from '@/interfaces/user';
import { QueryKeys } from '@/interfaces/queries-key';
import { useUserStore } from '@/stores/user';
import useUpload from '@/hooks/useUpload';
import { Image } from 'react-native';
import { Rs } from '@/util/comon';
import useLocation from '@/hooks/useLocation';
import BackButton from '../form/BackButton';

// Validation schema using Yup
type Props = Yup.InferType<typeof StoreSchema>;

const StoreInfo = ({handleClose, isNOtBack}: {handleClose: () => void, isNOtBack?: boolean}) => {
  const [storeLogoUrl, setStoreLogoUrl] = useState(null);
  const [storeCoverUrl, setStoreCoverUrl] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD - US Dollar');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const { isPending, mutate } = useToklomanStore();
  const {user} = useUserStore();
  const {pickImage: picklogo, handleRemoveImg: removeLogo, singleImage: logo} = useUpload(true);
  const {pickImage: pickBanner, handleRemoveImg: removeBanner, singleImage: banner} = useUpload(true);

  const {data, isLoading, error, refetch} = useQuery<Toklomen, Error>({
    queryKey: QueryKeys.tokloman.byToklomanStore,
    queryFn: async (): Promise<Toklomen> => {  // Explicit return type
      try {
        const resp = await axios.get(`${baseURL}/tokloMen/${Number(user?.id)}`);
          //  console.log("tokloMen°°°°°°", resp.data)
        return resp.data; // Ensure `resp.data` is returned
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
      }
    },
  });

  const {location, displayindAddress, getAddressFromCoordinates, address} = useLocation();

  const [currentAddress, setCurrentAddress] = useState('');

  useEffect(() => {
    const locationJson = JSON.parse(data?.location || '{}');
    
    if(locationJson?.x && locationJson?.y){
      getAddressFromCoordinates(locationJson?.x, locationJson?.y);
      
    }
    
  }, [data?.location]);

  
  
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

  const handleSubmit = (values: Props) => {
    Keyboard.dismiss();
    const formData = new FormData();

    formData.append("store_name", values.store_name);
    formData.append("store_slogan", values?.store_slogan || '');
    formData.append("store_description", values?.store_description || '');
    // formData.append("store_logo", storeLogoUrl);
    // formData.append("store_coverImg", storeCoverUrl);
    formData.append("phone", values.phone);
    formData.append("whatsapp", values.whatsapp);

    // Convert the object to a JSON string

    formData.append("location", JSON.stringify({x: location?.coords.latitude  ,
      y: location?.coords.longitude}));
    
    if (logo?.uri) {
     formData.append("store", {
       uri: logo.uri,
       name: "logo.png", // Ensure the name is unique
       type: "image/png", // Ensure the type matches the file
     });
   }

   if (banner?.uri) {
     formData.append("store", {
       uri: banner.uri,
       name: "banner.png", // Ensure the name is unique
       type: "image/png", // Ensure the type matches the file
     });
   }
    mutate(formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paramètre boutique</Text>
       {!isNOtBack && <BackButton icon={ <XMarkIcon size={20} color={Colors.app.black} /> } backAction={handleClose} />}
      </View>
      
      <Formik
        initialValues={{ 
          store_name: data?.store_name || data?.lastname + '' + data?.name, 
          phone: data?.phone || '', 
          whatsapp: data?.whatsapp || '',
          store_description: data?.store_description || '',
          store_slogan: data?.store_slogan || '',
          location: selectedLocation
        }}
        validationSchema={StoreSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps >
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
              style={[styles.avatarContainer, {backgroundColor: "none"}]}
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
                  {flexDirection: "row", alignItems: "center", gap: 10},
                  errors.location && touched.location ? styles.inputError : null
                ]}
                onPress={() => {
                  // Open location selector
                  // For now, just setting a value
                  // setFieldValue('location', displayindAddress);
                  setSelectedLocation(displayindAddress);
                }}
              >
                <MapPinIcon size={24} color={Colors.app.primary} />
               {data?.location && <Text>{ displayindAddress }</Text>}
                {!data?.location && location && <Text>{address}</Text>}
              </TouchableOpacity>
              {errors.location && touched.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Numéro de téléphone</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <Text style={styles.fieldDescription}>
                Il apparaîtra sur votre boutique, factures
              </Text>
              <TextInput
                style={[styles.input, errors.phone && touched.phone ? styles.inputError : null]}
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                keyboardType="phone-pad"
              />
              {errors.phone && touched.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Numéro whatsapp</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <Text style={styles.fieldDescription}>
                Il apparaîtra sur votre boutique, factures
              </Text>
              <TextInput
                style={[styles.input, errors.whatsapp && touched.whatsapp ? styles.inputError : null]}
                value={values.whatsapp}
                onChangeText={handleChange('whatsapp')}
                onBlur={handleBlur('whatsapp')}
                keyboardType="phone-pad"
              />
              {errors.whatsapp && touched.whatsapp && (
                <Text style={styles.errorText}>{errors.whatsapp}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <BlowingBtn 
                isPending={isPending} 
                handlePress={handleSubmit} 
                label="Enregistrer" 
              />
            </View>
          </ScrollView>
        )}
      </Formik>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202020',
    marginBottom: 12,
  },
  inputError: {
   borderColor: '#e41919',
 },
  errorText: {
   color: '#e41919',
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
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  formGroup: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  required: {
    color: '#e41919',
    marginLeft: 4,
    fontSize: 16,
  },
  fieldDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    marginBottom: 8,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
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
    backgroundColor: '#f8d7da',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#e83e8c',
  },
  avatarActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  updateButton: {
    marginRight: 16,
  },
  updateButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {},
  deleteButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  websiteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 6,
    overflow: 'hidden',
  },
  httpPrefix: {
    paddingHorizontal: 10,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#f7f8fa',
    borderRightWidth: 1,
    borderRightColor: '#e1e4e8',
  },
  httpPrefixText: {
    fontSize: 14,
    color: '#666',
  },
  websiteInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  currencySelectorText: {
    fontSize: 15,
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 6,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  selectedDropdownItem: {
    fontWeight: '600',
    color: '#2563eb',
  },
  spacing: {
    height: 40,
  },
});

export default StoreInfo;