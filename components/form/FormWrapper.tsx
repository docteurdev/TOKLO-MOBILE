import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'
import React from 'react'
import ScreenWrapper from '../ScreenWrapper'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Rs } from '@/util/comon';

type Props = {
  children: React.ReactNode;
}

const FormWrapper = ({ children }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ScreenWrapper>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentInsetAdjustmentBehavior='always'
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Rs(140) },
          ]}
        >
          {children}
        </ScrollView>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  )
}

export default FormWrapper

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  }
})
