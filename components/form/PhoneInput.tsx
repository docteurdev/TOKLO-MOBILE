import { Colors } from '@/constants/Colors';
import { Rs, SIZES } from '@/util/comon';
import { Feather } from '@expo/vector-icons';
import * as React from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

type Country = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

const COUNTRIES: Country[] = [
  { name: "Côte d'Ivoire", code: "CI", dialCode: "+225", flag: "https://flagcdn.com/w80/ci.png" },
  { name: "Bénin", code: "BJ", dialCode: "+229", flag: "https://flagcdn.com/w80/bj.png" },
  { name: "Burkina Faso", code: "BF", dialCode: "+226", flag: "https://flagcdn.com/w80/bf.png" },
  { name: "Cameroun", code: "CM", dialCode: "+237", flag: "https://flagcdn.com/w80/cm.png" },
  { name: "Mali", code: "ML", dialCode: "+223", flag: "https://flagcdn.com/w80/ml.png" },
  { name: "Sénégal", code: "SN", dialCode: "+221", flag: "https://flagcdn.com/w80/sn.png" },
  { name: "Togo", code: "TG", dialCode: "+228", flag: "https://flagcdn.com/w80/tg.png" },
  { name: "Guinée", code: "GN", dialCode: "+224", flag: "https://flagcdn.com/w80/gn.png" },
  { name: "France", code: "FR", dialCode: "+33", flag: "https://flagcdn.com/w80/fr.png" },
];

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

const PhoneInput = ({ isDescr, label, value, handleOnBlur, handleChange, error, touched, keyboardType, isPassword, placeholder }: Props) => {
  const [isPw, setIsPw] = React.useState(isPassword);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isCountryModalVisible, setIsCountryModalVisible] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState(COUNTRIES[0]);

  const phoneWithoutDialCode = React.useMemo(() => {
    if (!value) return "";

    return value.startsWith(selectedCountry.dialCode)
      ? value.slice(selectedCountry.dialCode.length)
      : value;
  }, [selectedCountry.dialCode, value]);

  const handlePhoneChange = (text: string) => {
    const phone = text.replace(/\D/g, "");
    handleChange(`${selectedCountry.dialCode}${phone}`);
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
    handleChange(`${country.dialCode}${phoneWithoutDialCode.replace(/\D/g, "")}`);
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
          onPress={() => setIsCountryModalVisible(true)}
          style={styles.countrySelector}
        >
          <Image source={{ uri: selectedCountry.flag }} style={styles.flag} />
          {/* <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text> */}
          <Feather name="chevron-down" size={16} color={Colors.app.texteLight} />
        </Pressable>
        <TextInput
          keyboardType={keyboardType ?? "phone-pad"}
          secureTextEntry={isPw}
          multiline={isDescr ? true : false}
          placeholder={placeholder ?? "Entrez ..."}
          placeholderTextColor={Colors.app.texteLight}
          value={phoneWithoutDialCode}
          style={styles.input}
          onChangeText={handlePhoneChange}
          onBlur={(e) => {
            setIsFocused(false);
            handleOnBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
        />
      </View>
      {isPassword && (
        <TouchableOpacity style={{ position: 'absolute', right: Rs(10), top: Rs(40), zIndex: 50 }} onPress={() => { setIsPw(!isPw) }}>
          <Feather name='eye' size={20} color={Colors.app.texteLight} />
        </TouchableOpacity>
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
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.countryItem}
                  onPress={() => handleSelectCountry(item)}
                >
                  <Image source={{ uri: item.flag }} style={styles.countryFlag} />
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>{item.dialCode}</Text>
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
    borderColor: Colors.app.texteLight,
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
    borderWidth: 2,
  },
  inputError: {
    borderColor: Colors.app.error,
    borderWidth: 2,
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
