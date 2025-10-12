import { Colors } from '@/constants/Colors';
import { EDressStatus } from '@/interfaces/type';
import { formatXOF, Rs, SIZES } from '@/util/comon';
import React, { Suspense } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CalendarDaysIcon } from 'react-native-heroicons/solid';


type Props ={
  totalPrice: number;
  status: EDressStatus
  date_remise: string
  date_depot: string;
  solde_cal: string;
  paiement: string;
}
const PaymentDisplay = ({totalPrice, status, date_remise, solde_cal, paiement}:Props) => {

  if(!status) return <ActivityIndicator size="large" color="#5c60f5" />

  return (

      <View style={[styles.container,  {backgroundColor: status == EDressStatus.ONGOING ? Colors.app.available.unav_bg: status == EDressStatus.FINISHED? Colors.app.dashitem.bg_2 : Colors.app.available.av_bg}]}>
        <Text style={styles.label}>Solde</Text>
        
        <View style={[styles.amountContainer,]}>
          {/* <Text style={styles.dollarSign}>$</Text> */}
          <Text style={styles.amount}> {formatXOF(totalPrice)} </Text>
          {/* <Text style={styles.cents}>.56</Text> */}
          <View style={[styles.paidBadge, {backgroundColor: status == EDressStatus.ONGOING ? Colors.app.available.unav_txt: status == EDressStatus.FINISHED? Colors.app.dashitem.t_2 : Colors.app.available.av_txt}]}>
            <Text style={styles.paidText}> {status == EDressStatus.ONGOING ? "En cours": status == EDressStatus.FINISHED ? 'Terminée' :  "Livrée"} </Text>
          </View>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={[styles.benefitsText, {color: status == EDressStatus.ONGOING ? Colors.app.available.unav_txt: status == EDressStatus.FINISHED? Colors.app.dashitem.t_2 : Colors.app.available.av_txt}]}>Date de livraison: {date_remise}</Text>
          {/* <Text style={styles.benefitsText}>Date de livraision: {new Date(date_remise).toLocaleDateString("fr-FR", {day: "2-digit", month: "2-digit", year: "numeric"})}</Text> */}
          <View style={styles.dotsContainer}>
            <CalendarDaysIcon fill={ status == EDressStatus.ONGOING ? Colors.app.available.unav_txt: status == EDressStatus.FINISHED? Colors.app.dashitem.t_2 : Colors.app.available.av_txt} size={Rs(23)} />
          </View>
        </View>
      </View>
   

  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5',
    padding: Rs(16),
    borderRadius: Rs(12),
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dollarSign: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: '#000',
  },
  amount: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: '#000',
  },
  cents: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: '#000',
    marginTop: 2,
  },
  paidBadge: {
    backgroundColor: Colors.app.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    alignSelf: 'center',
  },
  paidText: {
    color: '#FFF',
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  benefitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  benefitsText: {
    fontSize: 14,
    color: '#8B4513',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
});

export default PaymentDisplay;