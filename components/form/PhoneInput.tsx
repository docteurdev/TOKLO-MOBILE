import { Colors } from '@/constants/Colors';
import { getPhoneCountryByValue, PhoneCountry, setPhoneCountries } from '@/constants/phoneCountries';
import { baseURL } from '@/util/axios';
import { Rs, SIZES } from '@/util/comon';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as React from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { useFormScroll } from './FormWrapper';

interface Props extends TextInputProps {
  label?: string;
  iconL?: string;
  iconR?: string;
  isDescr?: boolean;
  isPassword?: boolean;
  handleChange: (text: string) => void;
  handleOnBlur: (e: any) => void;
  value?: string;
  error?: string;
  touched?: boolean;
  placeholder?: string;
}

const normalizeCountriesResponse = (data: unknown): PhoneCountry[] => {
  if (Array.isArray(data)) return data as PhoneCountry[];

  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: PhoneCountry[] }).data;
  }

  return [];
};

const PhoneInput = ({ isDescr, label, value, handleOnBlur, handleChange, error, touched, keyboardType, isPassword, placeholder, onFocus }: Props) => {
  const [isPw, setIsPw] = React.useState(isPassword);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isCountryModalVisible, setIsCountryModalVisible] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<PhoneCountry | null>(null);
  const inputRef = React.useRef<TextInput>(null);
  const formScroll = useFormScroll();
  const {
    data: countries = [],
    isLoading: isCountriesLoading,
    isError: isCountriesError,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axios.get(baseURL + "/countries");
      return normalizeCountriesResponse(response.data);
    },
  });

  React.useEffect(() => {
    setPhoneCountries(countries);
  }, [countries]);

  React.useEffect(() => {
    if (countries.length === 0) return;

    const valueCountry = getPhoneCountryByValue(value, countries);

    if (valueCountry && valueCountry.code !== selectedCountry?.code) {
      setSelectedCountry(valueCountry);
      return;
    }

    if (!selectedCountry) {
      setSelectedCountry(countries.find((country) => country.id === 1) ?? countries[0]);
    }
  }, [countries, selectedCountry, value]);

  const phoneWithoutDialCode = React.useMemo(() => {
    if (!value || !selectedCountry) return "";

    return value.startsWith(selectedCountry.dialCode)
      ? value.slice(selectedCountry.dialCode.length)
      : value;
  }, [selectedCountry, value]);

  const handlePhoneChange = (text: string) => {
    if (!selectedCountry) return;

    const phone = text.replace(/\D/g, "").slice(0, selectedCountry.phoneLength);
    handleChange(`${selectedCountry.dialCode}${phone}`);
  };

  const handleSelectCountry = (country: PhoneCountry) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
    handleChange(`${country.dialCode}${phoneWithoutDialCode.replace(/\D/g, "").slice(0, country.phoneLength)}`);
  };

  return (
    <View style={{ position: 'relative', width: "100%", height: 83, marginBottom: 10 }}>
      <Text style={styles.label}>{label} <Text style={{ color: Colors.app.error }}>*</Text></Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && touched && styles.inputError
        ]}
      >
        <Pressable
          disabled={countries.length === 0}
          onPress={() => setIsCountryModalVisible(true)}
          style={styles.countrySelector}
        >
          {selectedCountry ? (
            <Image source={{ uri: selectedCountry.flag }} style={styles.flag} />
          ) : (
            <ActivityIndicator size="small" color={Colors.app.primary} />
          )}
          <Feather name="chevron-down" size={16} color={Colors.app.texteLight} />
        </Pressable>
        <TextInput
          ref={inputRef}
          keyboardType={keyboardType ?? "phone-pad"}
          secureTextEntry={isPw}
          multiline={isDescr ? true : false}
          placeholder={placeholder ?? "Entrez ..."}
          placeholderTextColor={Colors.app.texteLight}
          value={phoneWithoutDialCode}
          editable={Boolean(selectedCountry) && !isCountriesLoading}
          maxLength={selectedCountry?.phoneLength}
          style={styles.input}
          onChangeText={handlePhoneChange}
          onBlur={(e) => {
            setIsFocused(false);
            handleOnBlur(e);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            formScroll?.scrollToInput(inputRef);
            onFocus?.(event);
          }}
        />
      </View>
      {isPassword && (
        <TouchableOpacity style={{ position: 'absolute', right: Rs(10), top: Rs(40), zIndex: 50 }} onPress={() => { setIsPw(!isPw) }}>
          <Feather name='eye' size={20} color={Colors.app.texteLight} />
        </TouchableOpacity>
      )}
      {isCountriesError && (
        <Text style={{ color: Colors.app.error, fontSize: SIZES.xs }}>
          Impossible de charger les pays
        </Text>
      )}
      {error && touched && <Text style={{ color: Colors.app.error, fontSize: SIZES.xs }}>{error}</Text>}
      <Modal
        animationType="fade"
        transparent
        visible={isCountryModalVisible}
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsCountryModalVisible(false)}>
          <View style={styles.countryModal}>
            <Text style={styles.modalTitle}>Choisissez un pays</Text>
            <FlatList
              data={countries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.countryItem}
                  onPress={() => handleSelectCountry(item)}
                >
                  <Image source={{ uri: item.flag }} style={styles.countryFlag} />
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>
                    {item.dialCode}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: SIZES.sm,
    color: Colors.app.texteLight,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.app.disabled,
    borderRadius: SIZES.xs,
    height: 50,
    overflow: 'hidden',
  },
  countrySelector: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: Colors.app.disabled,
    backgroundColor: Colors.app.secondary,
  },
  flag: {
    width: 24,
    height: 16,
    borderRadius: 2,
  },
  dialCode: {
    fontSize: SIZES.sm,
    color: Colors.app.texteLight,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    color: Colors.app.texteLight,
    fontSize: SIZES.sm,
  },
  inputFocused: {
    borderColor: Colors.app.primary,
    borderWidth: 1,
  },
  inputError: {
    borderColor: Colors.app.error,
    borderWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: Rs(20),
  },
  countryModal: {
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Rs(12),
  },
  modalTitle: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: Colors.app.texteLight,
    marginBottom: Rs(10),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Rs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.app.disabled,
  },
  countryFlag: {
    width: 32,
    height: 22,
    borderRadius: 3,
    marginRight: Rs(12),
  },
  countryName: {
    flex: 1,
    color: Colors.app.texteLight,
    fontSize: SIZES.sm,
  },
  countryDialCode: {
    color: Colors.app.primary,
    fontWeight: '700',
    fontSize: SIZES.sm,
  },
});

export default PhoneInput;
