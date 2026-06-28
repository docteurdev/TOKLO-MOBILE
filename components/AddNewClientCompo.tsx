import React from 'react';
import {
  Dimensions,
  findNodeHandle,
  Keyboard,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import CustomButton from './form/CustomButton';
import CustomInput from './form/CustomInput';
import { Rs } from '@/util/comon';
import { newClientSchema, newClientValuesType } from '@/constants/formSchemas';
import useNewClient from '@/hooks/mutations/useNewClient';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';

// Validation schema

type Props = {
  handleShowAddClient: () => void;
};

type ScrollTargetRef = React.RefObject<TextInput | View | null>;

const AddNewClientCompo = ({ handleShowAddClient }: Props) => {

  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const statusBarStyle = theme.background === '#FFFDF8' ? 'dark-content' : 'light-content';
  const {mutate, isPending} = useNewClient(handleShowAddClient);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const currentScrollYRef = React.useRef(0);
  const keyboardTopRef = React.useRef(Dimensions.get('window').height);
  const focusedTargetRef = React.useRef<ScrollTargetRef | null>(null);
  const nameGroupRef = React.useRef<View>(null);
  const lastnameGroupRef = React.useRef<View>(null);
  const phoneGroupRef = React.useRef<View>(null);

  const scrollContentStyle = React.useMemo(
    () => [
      styles.scrollContent,
      { paddingBottom: keyboardHeight > 0 ? keyboardHeight + Rs(170) : Rs(80) },
    ],
    [keyboardHeight, styles.scrollContent],
  );

  const scrollToTarget = React.useCallback((targetRef: ScrollTargetRef, delay = 120) => {
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

  React.useEffect(() => {
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

  const handleAddClient = (values: newClientValuesType) => {
    mutate(values)
   
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.card} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? Rs(24) : 0}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          ref={scrollViewRef}
          automaticallyAdjustKeyboardInsets
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollContentStyle}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          scrollIndicatorInsets={{ bottom: keyboardHeight + Rs(120) }}
          onScroll={(event) => {
            currentScrollYRef.current = event.nativeEvent.contentOffset.y;
          }}
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
                  <View ref={nameGroupRef}>
                    <CustomInput
                      value={values.name}
                      label='Nom'
                      placeholder=''
                      handleChange={handleChange('name')}
                      handleOnBlur={handleBlur('name')}
                      error={touched.name ? errors.name : undefined}
                      onFocus={() => scrollToTarget(nameGroupRef, Platform.OS === 'ios' ? 80 : 180)}
                    />
                  </View>

                  <View ref={lastnameGroupRef}>
                    <CustomInput
                      value={values.lastname}
                      label='Prénom(s)'
                      placeholder=''
                      handleChange={handleChange('lastname')}
                      handleOnBlur= {handleBlur('lastname')}
                      error={touched.lastname ? errors.lastname : undefined}
                      onFocus={() => scrollToTarget(lastnameGroupRef, Platform.OS === 'ios' ? 80 : 180)}
                    />
                  </View>

                  <View ref={phoneGroupRef}>
                    <CustomInput
                      value={values.telephone}
                      label='Numéro de téléphone'
                      placeholder=''
                      keyboardType="numeric"
                      handleChange={handleChange('telephone')}
                      handleOnBlur={handleBlur('telephone')}
                      error={touched.telephone ? errors.telephone : undefined}
                      onFocus={() => scrollToTarget(phoneGroupRef, Platform.OS === 'ios' ? 80 : 180)}
                    />
                  </View>
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.card,
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
