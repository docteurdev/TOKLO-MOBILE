import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import OtherInput from '@/components/form/OtherInput'
import { BanknotesIcon, Square3Stack3DIcon } from 'react-native-heroicons/solid'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'

type Props = {}

const DressMeasure = (props: Props) => {
 // route.push({pathname: "/OrderDetail", params: {id}})
 const route = useRouter()

  const [quantity, setquantity] = React.useState('')
  const [amount, setamount] = React.useState('')
  return (
    <ScreenWrapper>
      <Button title='Go' onPress={() => route.push('/add-dress')} />
                  <View style={{ marginHorizontal: 20 }}>
                <OtherInput
                  required
                  label="Quantité"
                  placeholder="Ajoutez la quantité"
                  icon={
                    <Square3Stack3DIcon fill={Colors.app.primary} size={27} />
                  }
                  value={quantity}
                  setValue={setquantity}
                  keyboardType="numeric"
                />
                
              </View>
              <View style={{ marginHorizontal: 20 }}>
                <OtherInput
                  required
                  label="Montant"
                  placeholder="Saisissez le montant"
                  icon={<BanknotesIcon fill={Colors.app.primary} size={27} />}
                  value={amount}
                  setValue={setamount}
                  keyboardType="numeric"
                />
              </View>

    </ScreenWrapper>
  )
}

export default DressMeasure

const styles = StyleSheet.create({})