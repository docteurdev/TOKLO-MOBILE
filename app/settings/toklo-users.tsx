import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import BackButton from '@/components/form/BackButton';
import { useRouter } from 'expo-router';
import { Rs, SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';
import { SwitchCompo } from '@/components/SwitchCompo';
import { QueryKeys } from '@/interfaces/queries-key';
import { useQuery } from '@tanstack/react-query';
import { ITokloUser, IUser, Toklomen } from '@/interfaces/user';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import { baseURL } from '@/util/axios';
import useTokloman from '@/hooks/mutations/useTokloman';
import { ActivityIndicator } from 'react-native';
import { defaultRemindTime } from '@/utils';
import BlowingBtn from '@/components/form/BlowingBtn';
import { UserGroupIcon, UserPlusIcon } from 'react-native-heroicons/solid';
import ToklomanUser from '@/components/settings/ToklomanUser';
import FlatButton from '@/components/form/FlatBtn';
import BottomSheetCompo from '@/components/BottomSheetCompo';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CustomInput from '@/components/form/CustomInput';
import CustomButton from '@/components/form/CustomButton';
import { Formik } from 'formik';
import { userSchema } from '@/constants/formSchemas';
import useToklomanUser from '@/hooks/mutations/useToklomanUser';
import { Alert } from 'react-native';
import useNotif from '@/hooks/useNotification';
import useUpdateToklomanUser from '@/hooks/mutations/useUpdateToklomanUser';

const { width } = Dimensions.get('window');

const Page = () => {
  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const bottosheetRef = useRef<BottomSheetModal>(null);
  const updatebottosheetRef = useRef<BottomSheetModal>(null);

  const [selectedUser, setSelectedUser] = useState<ITokloUser | null>(null);

  const {user} = useUserStore();
    const { handleNotification } = useNotif()
  


  const { data, isLoading, error, refetch } = useQuery<ITokloUser[], Error>({
    queryKey: QueryKeys.tokloman.byToklomanUsers,
    queryFn: async (): Promise<ITokloUser[]> => {  // Explicit return type
      try {
        const resp = await axios.get(`${baseURL}/tokloMen/users/${Number(user?.id)}`);
          console.log("tokloMen°°°°°°", resp.data, user?.id)
        return resp.data; // Ensure `resp.data` is returned
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
      }
    },
  });

  function handleSelectUser(user: ITokloUser) {
    setSelectedUser(user);
    updatebottosheetRef?.current?.present();
  }

   async function handleDeleteUser(id: number) {
    try {
     
      const response = await axios.delete(`${baseURL}/tokloMen/users/${id}`, );
      if(response.data){
       handleNotification("success", "Utilisateur", "Utilisateur supprimé ")

        refetch()
      }
      
    } catch (error) {
       handleNotification("error", "Utilisateur", "Erreur lors de la suppression ")

    }
  }
  

  const router = useRouter();


  const {mutate, isPending} = useToklomanUser(() => bottosheetRef?.current?.dismiss());
  const {mutate: updateMutate, isPending: isPendingUpdate} = useUpdateToklomanUser(() => updatebottosheetRef?.current?.dismiss());



  return (
    <View
      // colors={['#f9f9ff', '#e8f0ff']}
      style={styles.container}
    >
        <View style={{padding: 16}}>
          <BackButton backAction={() => router.back()} />
          <View style={[styles.header, ]}>
            <Text style={styles.title}>Personel</Text>
            <UserGroupIcon size={32} color={Colors.app.primary} />
          </View>
        </View>
      <ScrollView showsVerticalScrollIndicator={false}>

        
       {data?.map((item) => <ToklomanUser
        key={item?.id.toString()} 
        user={item}
        onDelete={() => {
          Alert.alert("Supprimer", "Êtes-vous sûr de vouloir supprimer cet utilisateur ?", [
            {
              text: "Annuler",
              style: "cancel",
            },
            { text: "Supprimer", onPress: () => handleDeleteUser(item?.id) },
          ]);
        }}
        onPress={() => handleSelectUser(item)}
        /> )}
      </ScrollView>
      <FlatButton
        title="Nouveau personnel"
        width={Rs(300)}
        onPress={() => bottosheetRef?.current?.present()} 
        icon={<UserPlusIcon size={24} color="#fff" />}
      />


  {/* add new user */}
    <BottomSheetCompo  bottomSheetModalRef={bottosheetRef} snapPoints={['50%']} >
      <View style={{padding: Rs(16), }}>

        <Formik
        initialValues={{
          fullName: 'Oumar Adje',
          phone: '0133903894',
          password: '123456',
        }}
        validationSchema={userSchema}
        onSubmit={(values) => {
          Keyboard.dismiss();
          mutate(values)
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
          isValid
        }) => (
          <View style={styles.container}>
            <CustomInput
              label="Nom et prénom(s)"
              placeholder="John Doe"
              keyboardType="default"
              handleChange={handleChange('fullName')}
              handleOnBlur={handleBlur('fullName')}
              value={values.fullName}
              error={touched.fullName && errors.fullName}
            />
            
            <CustomInput
              label="Numéro de téléphone"
              placeholder="XX XX XX XX XX"
              keyboardType="phone-pad"
              handleChange={handleChange('phone')}
              handleOnBlur={handleBlur('phone')}
              value={values.phone}
              error={touched.phone && errors.phone}
            />
            
            <CustomInput
              label="Mot de passe"
              placeholder="******"
              secureTextEntry={true}
              keyboardType="default"
              handleChange={handleChange('password')}
              handleOnBlur={handleBlur('password')}
              value={values.password}
              isPassword
              error={touched.password && errors.password}
            />
            
            <CustomButton
              label={isSubmitting ? "Traitement..." : "Enregistrer"}
              action={handleSubmit}
              disabled={isValid}
            />
          </View>
        )}
        </Formik>
      </View>
    </BottomSheetCompo>

{/* update user */}
    <BottomSheetCompo  bottomSheetModalRef={updatebottosheetRef} snapPoints={['50%']} >
      <View style={{padding: Rs(16), }}>

        <Formik
        initialValues={{
          fullName: selectedUser?.fullName,
          phone: selectedUser?.phone,
          password: selectedUser?.password,
        }}
        enableReinitialize
        validationSchema={userSchema}
        onSubmit={(values) => {
          Keyboard.dismiss();
          const data = {...values, id: selectedUser?.id}
          updateMutate(data)
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
          isValid
        }) => (
          <View style={styles.container}>
            <CustomInput
              label="Nom et prénom(s)"
              placeholder="Koné Etienne"
              keyboardType="default"
              handleChange={handleChange('fullName')}
              handleOnBlur={handleBlur('fullName')}
              value={values.fullName}
              error={touched.fullName && errors.fullName}
            />
            
            <CustomInput
              label="Numéro de téléphone"
              placeholder="XX XX XX XX XX"
              keyboardType="phone-pad"
              handleChange={handleChange('phone')}
              handleOnBlur={handleBlur('phone')}
              value={values.phone}
              error={touched.phone && errors.phone}
            />
            
            <CustomInput
              label="Mot de passe"
              placeholder="******"
              secureTextEntry={true}
              keyboardType="default"
              handleChange={handleChange('password')}
              handleOnBlur={handleBlur('password')}
              value={values.password}
              isPassword
              error={touched.password && errors.password}
            />
            
            <CustomButton
              label={"Enregistrer"}
              action={handleSubmit}
              disabled={isValid}
              loading={isPending}
            />
          </View>
        )}
        </Formik>
      </View>
    </BottomSheetCompo>



    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    backgroundColor: "white"
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Rs(16),
    paddingVertical: 8,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
   boxShadow: Colors.shadow.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: Rs(36),
    height: Rs(36),
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: SIZES.md,
    color: '#333',
  },
  timePickerContainer: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#7367F0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Page;