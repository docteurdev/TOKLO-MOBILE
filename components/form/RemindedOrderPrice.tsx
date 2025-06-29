import { formatXOF, Rs, SIZES } from '@/util/comon';
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import RoundedBtn from './RoundedBtn';
import { Colors } from '@/constants/Colors';
import { IOrder } from '@/interfaces/type';

type Props ={
  id: number
  solde_cal: number
  paiement: number
  amount: number;
  orderName?: string
}

const RemindedOrderPrice = ({id, solde_cal, paiement, amount, orderName}: Props) => {
  return (
    <View style={styles.container}>
      <Text style={{fontSize: SIZES.md , marginBottom: Rs(16)}} >Le client vous doit encore <Text style={{color: Colors.app.error}} > {formatXOF(solde_cal)} </Text> pour ce vêtement.  </Text>
       {/* <Separator /> */}
      <View style={styles.contentRow}>
        {/* Product Image */}
        {/* <Image source={productImage} style={styles.productImage} /> */}
        
        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{orderName}</Text>
          <Text style={styles.productSize}>Total : {formatXOF(amount)}</Text>
          
          <View style={styles.priceQuantityRow}>
            <Text style={styles.productPrice}>Avance : {formatXOF(paiement)}</Text>
            {/* <Text style={styles.quantity}>x{quantity}</Text> */}
          </View>
        </View>
      </View>
      
      {/* Estimated Total */}
      <View style={styles.totalSection}>
        <View style={styles.estimateRow}>
          <Text style={styles.estimateLabel}>Reste à payer </Text>
          <Text style={[styles.totalPrice, {color: Colors.app.error}]}>{formatXOF(solde_cal)}</Text>
        </View>
        
        {/* Pay Now Button */}
        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}} >
         <RoundedBtn label={"Livrer"}  disabled isOutline loading={false} action={() => onPayNowPress() }  />
         <RoundedBtn label={"Payer"}  disabled  loading={false} action={() => onPayNowPress() }  />

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F0F0F0',
    marginHorizontal: 16,
    marginVertical: 8,
    width: "100%",
    paddingTop: Rs(80)
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: Colors.app.texte,
    marginBottom: 4,
  },
  productSize: {
    fontSize: SIZES.sm,
    color: Colors.app.primary,
    marginBottom: 8,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: Colors.app.texte,
  },
  quantity: {
    fontSize: SIZES.md,
    color: Colors.app.primary,
    marginRight: 8,
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  estimateLabel: {
    fontSize: SIZES.sm,
    color: Colors.app.primary,
  },
  totalPrice: {
    fontSize: SIZES.md,
    fontWeight: '900',
    color: Colors.app.texte,
  },
  payButton: {
    backgroundColor: Colors.app.texte,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RemindedOrderPrice;