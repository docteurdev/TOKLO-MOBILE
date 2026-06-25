import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { EDressStatus } from '@/interfaces/type';
import { formatXOF, Rs, SIZES } from '@/util/comon';
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
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
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  if(!status) return <ActivityIndicator size="large" color={theme.primary} />

  const statusTone = getStatusTone(status, theme);

  return (

      <View style={[styles.container, { backgroundColor: statusTone.backgroundColor }]}>
        <Text style={styles.label}>Solde</Text>
        
        <View style={[styles.amountContainer,]}>
          {/* <Text style={styles.dollarSign}>$</Text> */}
          <Text style={styles.amount}> {formatXOF(totalPrice)} </Text>
          {/* <Text style={styles.cents}>.56</Text> */}
          <View style={[styles.paidBadge, { backgroundColor: statusTone.accentColor }]}>
            <Text style={styles.paidText}> {status === EDressStatus.ONGOING ? "En cours": status === EDressStatus.FINISHED ? 'Terminée' :  "Livrée"} </Text>
          </View>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={[styles.benefitsText, { color: statusTone.accentColor }]}>Date de livraison: {date_remise}</Text>
          {/* <Text style={styles.benefitsText}>Date de livraision: {new Date(date_remise).toLocaleDateString("fr-FR", {day: "2-digit", month: "2-digit", year: "numeric"})}</Text> */}
          <View style={styles.dotsContainer}>
            <CalendarDaysIcon fill={statusTone.accentColor} size={Rs(23)} />
          </View>
        </View>
        
        <Image style={styles.africanTouchSheet} source={require("@/assets/images/measure/top-sheet.png")} />
        
      </View>
   

  );
};

const getStatusTone = (status: EDressStatus, theme: AppTheme) => {
  if (status === EDressStatus.ONGOING) {
    return {
      accentColor: theme.gold,
      backgroundColor: theme.goldLight,
    };
  }

  if (status === EDressStatus.FINISHED) {
    return {
      accentColor: theme.primary,
      backgroundColor: theme.primaryLight,
    };
  }

  return {
    accentColor: theme.success,
    backgroundColor: `${theme.success}22`,
  };
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Rs(16),
    borderRadius: Rs(12),
    width: '100%',
    overflow: "hidden"
  },
  label: {
    fontSize: 14,
    color: theme.muted,
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
    color: theme.text,
  },
  amount: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: theme.text,
  },
  cents: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: theme.text,
    marginTop: 2,
  },
  paidBadge: {
    backgroundColor: theme.gold,
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
  africanTouchSheet: {
    height: 150, 
    width: 150,
    position: "absolute",
    right: -30,
    top: -10,
    opacity: theme.background === '#FFFDF8' ? 1 : 0.35,
  },
  benefitsText: {
    fontSize: 14,
    color: theme.gold,
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
