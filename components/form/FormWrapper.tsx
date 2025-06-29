import { KeyboardAvoidingView, ScrollView, StyleSheet, Platform, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../ScreenWrapper'

type Props = {
  children: React.ReactNode;
}

const FormWrapper = ({ children }: Props) => {
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScreenWrapper>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={styles.scrollContent}
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
  scrollContent: {
    flexGrow: 1,
  }
})