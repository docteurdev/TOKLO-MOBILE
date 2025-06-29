import React from 'react';
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomButton from './form/CustomButton';
import CustomInput from './form/CustomInput';
import BackButton from './form/BackButton';
import { Rs } from '@/util/comon';
import { newClientSchema, newClientValuesType } from '@/constants/formSchemas';
import useNewClient from '@/hooks/mutations/useNewClient';
import axios from 'axios';
import { baseURL } from '@/util/axios';
import useNotif from '@/hooks/useNotification';
import { Colors } from '@/constants/Colors';

// Validation schema

type Props = {
  handleShowAddClient: () => void;
};

const AddNewClientCompo = ({ handleShowAddClient }: Props) => {

  const {mutate, isPending} = useNewClient(handleShowAddClient);

  const { handleNotification } = useNotif()

  const handleAddClient = (values: newClientValuesType) => {
    mutate(values)
   
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.app.disabled} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          {/* <BackButton backAction={ handleShowAddClient} /> */}
          
          <Formik
            initialValues={{ name: '', lastname: '', telephone: '' }}
            validationSchema={newClientSchema}
            onSubmit={handleAddClient}
          >
            {({ handleSubmit, values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
              <>
                {/* Form */}
                <View 
                  style={styles.formContainer}
                >
                  {/* Name Input */}
                  <CustomInput 
                    value={values.name}
                    label='Nom'
                    placeholder=''
                    handleChange={handleChange('name')}
                    handleOnBlur={handleBlur('name')}
                    error={touched.name && errors.name  }
                  />

                  <CustomInput 
                    value={values.lastname}
                    label='Prénom(s)'
                    placeholder=''
                    handleChange={handleChange('lastname')}
                    handleOnBlur= {handleBlur('lastname')}
                    error={touched.lastname && errors.lastname  }
                  />

                  <CustomInput 
                    value={values.telephone}
                    label='Numéro de téléphone'
                    placeholder=''
                    keyboardType="numeric"
                    handleChange={handleChange('telephone')}
                    handleOnBlur={handleBlur('telephone')}
                    error={touched.telephone && errors.telephone }
                  />
                </View>

                {/* Submit Button */}
                <View 
                >
                  <CustomButton 
                    label='Enregistrer' 
                    action={handleSubmit} 
                    disabled={isValid } 
                    loading={isPending}
                  />
                </View>
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: Rs(20)
  },
  formContainer: {
    marginBottom: 30,
  },
});

export default AddNewClientCompo;