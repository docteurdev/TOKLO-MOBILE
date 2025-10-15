import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import BackButton from '@/components/form/BackButton'
import { useRouter } from 'expo-router'

type Props = {}

const Page = (props: Props) => {
 const router = useRouter();
  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center", gap: 20}} >
      <BackButton backAction={() => router.back()}  />
      <Text style={{fontSize: 20, fontWeight: "bold", color: "red"}}>
        Toklo Market - Bientôt disponible !
      </Text>
    </View>
  )
}

export default Page

const styles = StyleSheet.create({})