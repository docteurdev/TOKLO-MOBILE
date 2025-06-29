import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, Modal, TouchableWithoutFeedback, FlatList, TextInput } from 'react-native'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";

import { router } from 'expo-router';
import { useRouter } from 'expo-router';
import OtherInput from '@/components/form/OtherInput';
import { Square3Stack3DIcon, UserIcon } from 'react-native-heroicons/solid';
import { useUserStore } from '@/stores/user';
import { Rs, SCREEN_H, SCREEN_W, SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';
import ThirdInput, { CustomTextInput } from '@/components/form/thirdInput';


const isTestMode = true

const initialState = {
  inputValues: {
    fullName: isTestMode ? 'John Doe' : '',
    email: isTestMode ? 'example@gmail.com' : '',
    nickname: isTestMode ? "" : "",
    phoneNumber: ''
  },
  inputValidities: {
    fullName: false,
    email: false,
    nickname: false,
    phoneNumber: false,
  },
  formIsValid: false,
}

const data = [
 { label: 'Expert Comptable', value: 'accountant' },
 { label: 'Architecte Bâtiment', value: 'architect' },
 { label: 'Médecin Généraliste', value: 'doctor' },
 { label: 'Avocat', value: 'lawyer' },
 { label: 'Ingénieur Logiciel', value: 'software_engineer' },
 { label: 'Chef Cuisinier', value: 'chef' }
];


const Page = ({  }) => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState();
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);

  const [name, setName] = useState('');


  const router = useRouter()
  const {setUser} = useUserStore();


  const today = new Date();
  

  const [startedDate, setStartedDate] = useState("12/12/2023");

  const handleOnPressStartDate = () => {
    setOpenStartDatePicker(!openStartDatePicker);
  };

  
  useEffect(() => {
    if (error) {
      Alert.alert('An error occured', error)
    }
  }, [error])

  // const pickImage = async () => {
  //   try {
  //     const tempUri = await launchImagePicker()

  //     if (!tempUri) return

  //     // set the image
  //     setImage({ uri: tempUri })
  //   } catch (error) { }
  // };

  // fectch codes from rescountries api
  useEffect(() => {
    fetch("https://restcountries.com/v2/all")
      .then(response => response.json())
      .then(data => {
        let areaData = data.map((item) => {
          return {
            code: item.alpha2Code,
            item: item.name,
            callingCode: `+${item.callingCodes[0]}`,
            flag: `https://flagsapi.com/${item.alpha2Code}/flat/64.png`
          }
        });

        setAreas(areaData);
        if (areaData.length > 0) {
          let defaultData = areaData.filter((a) => a.code == "CI");

          if (defaultData.length > 0) {
            setSelectedArea(defaultData[0])
          }
        }
      })
  }, [])

  // render countries codes modal
  function RenderAreasCodesModal() {
    

    const renderItem = ({ item }) => {
      return (
        <TouchableOpacity
          style={{
            padding: 10,
            flexDirection: "row"
          }}
          onPress={() => {
            setSelectedArea(item),
              setModalVisible(false)
          }}
        >
          <Image
            source={{ uri: item.flag }}
            contentFit='contain'
            style={{
              height: 30,
              width: 30,
              marginRight: 10
            }}
          />
          <Text style={{ fontSize: 16, color: "#fff" }}>{item.item}</Text>
        </TouchableOpacity>
      )
    }
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <TouchableWithoutFeedback
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <View
              style={{
                height: SCREEN_H,
                width: SCREEN_W,
                backgroundColor: Colors.app.primary,
                borderRadius: 12
              }}
            >
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}>
                <Ionicons name="close-outline" size={24} color={Colors.app.primary} />
              </TouchableOpacity>
              <FlatList
                data={areas}
                renderItem={renderItem}
                horizontal={false}
                keyExtractor={(item) => item.code}
                style={{
                  padding: 20,
                  marginBottom: 20
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={[styles.area, ]}>
      <View style={[styles.container,]}>
        {/* <Header title="Completez votre profil" /> */}



        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center", marginVertical: 12 }}>
            <View style={styles.avatarContainer}>
              <Image
                source={ {uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"} }
                resizeMode="cover"
                style={styles.avatar} />
              <TouchableOpacity
                // onPress={pickImage}
                style={styles.pickImage}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={24}
                  color={"white"} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{gap: 20}} >

          {/* <CustomTextInput
            placeholder="Ajoutez le nom"
            leftIcon={ <Square3Stack3DIcon fill={Colors.app.primary} size={27}  />}
            value={name}
            
            onChangeText={text => setName(text)}
          /> */}
            
              <OtherInput
                  required
                  label="Nom"
                  placeholder="Ajoutez le nom"
                  icon={
                    <Square3Stack3DIcon fill={Colors.app.primary} size={27} />
                  }
                  value={name}
                  setValue={text => setName(text)}
                  keyboardType="default"
                />

                <OtherInput
                  required
                  label="Prénom"
                  placeholder="Ajoutez le prénom"
                  icon={
                    <Square3Stack3DIcon fill={Colors.app.primary} size={27} />
                  }
                  value={''}
                  setValue={() =>{}}
                  keyboardType="default"
                />

                 <OtherInput
                  required
                  label="Numéro de téléphone"
                  placeholder="Ajoutez le numéro de téléphone"
                  icon={
                    <Square3Stack3DIcon fill={Colors.app.primary} size={27} />
                  }
                  value={''}
                  setValue={() =>{}}
                  keyboardType="numeric"
                />

                <OtherInput
                  required
                  label="Numéro whatsapp"
                  placeholder="Ajoutez le numéro de téléphone"
                  icon={
                    <Square3Stack3DIcon fill={Colors.app.primary} size={27} />
                  }
                  value={''}
                  setValue={() =>{}}
                  keyboardType="numeric"
                />

                <OtherInput
                  required
                  label="Adresse email"
                  placeholder="Ajoutez le numéro de téléphone"
                  icon={
                    <Square3Stack3DIcon fill={Colors.app.primary} size={27} />
                  }
                  value={''}
                  setValue={() =>{}}
                  keyboardType="email-address"
                />

                 <OtherInput
                  required
                  label="Lien facebook"
                  placeholder="Ajoutez le lien facebook"
                  icon={
                    <Square3Stack3DIcon fill={Colors.app.primary} size={27} />
                  }
                  value={''}
                  setValue={() =>{}}
                  keyboardType="email-address"
                />

                 <OtherInput
                  required
                  label="Lien instagram"
                  placeholder="Ajoutez le lien instagram"
                 
                  icon={
                    <Square3Stack3DIcon fill={Colors.app.primary} size={27} />
                  }
                  value={''}
                  setValue={() =>{}}
                  keyboardType="email-address"
                />

                

            {/* <View style={{
              width: SIZES.width - 32
            }}>
              <TouchableOpacity
                style={[styles.inputBtn, {
                  backgroundColor: dark ? Colors.dark2 : Colors.greyscale500,
                  borderColor: dark ? Colors.dark2 : Colors.greyscale500,
                }]}
                onPress={showDatepicker}
              >
                <Text style={{ ...FONTS.body4, color: Colors.grayscale400 }}>{date?.toLocaleDateString("fr-FR")}</Text>
                <Feather name="calendar" size={24} color={Colors.grayscale400} />
              </TouchableOpacity>
            </View> */}


            
          </View>
        </ScrollView>
      </View>
      {/* <DatePickerModal
        open={openStartDatePicker}
        startDate={startDate}
        selectedDate={startedDate}
        onClose={() => setOpenStartDatePicker(false)}
        onChangeStartDate={(date) => setStartedDate(date)}
      /> */}

    
      {RenderAreasCodesModal()}
      <View style={styles.bottomContainer}>
       
       
      </View>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: "white"
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white"
  },
  avatarContainer: {
    marginVertical: 12,
    alignItems: "center",
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  avatar: {
    height: 130,
    width: 130,
    borderRadius: 65,
  },
  pickImage: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: Colors.app.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  inputContainer: {
    flexDirection: "row",
    borderColor: Colors.app.disabled,
    borderWidth: .4,
    borderRadius: 12,
    height: 52,
    width: SCREEN_W - 32,
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: Colors.app.disabled,
  },
  downIcon: {
    width: 10,
    height: 10,
    tintColor: "#111"
  },
  selectFlagContainer: {
    width: Rs(90),
    height: Rs(50),
    marginHorizontal: 5,
    flexDirection: "row",
  },
  flagIcon: {
    width: Rs(30),
    height: Rs(30)
  },
  input: {
    flex: 1,
    marginVertical: Rs(10),
    height: Rs(40),
    fontSize: SIZES.sm,
    color: "#111"
  },
  inputBtn: {
    borderWidth: 1,
    borderRadius: Rs(12),
    borderColor: Colors.app.disabled,
    height: Rs(52),
    paddingLeft: 8,
    fontSize: Rs(18),
    justifyContent: "space-between",
    marginTop: 4,
    backgroundColor: Colors.app.disabled,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  bottomContainer: {
    position: "absolute",
    bottom: Rs(32),
    right: Rs(16),
    left: Rs(16),
    flexDirection: "row",
    justifyContent: "space-between",
    // width: SIZES.width - 32,
    alignItems: "center"
  },
  continueButton: {
    width: "100%",
    borderRadius: 32,
    backgroundColor: Colors.app.primary,
    borderColor: Colors.app.primary
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "white",
    position: "absolute",
    right: 16,
    top: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }
})

export default Page