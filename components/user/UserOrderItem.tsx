import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { EDressStatus, IOrder } from '@/interfaces/type';
import { colors, formatXOF, SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

type Props = {
  order: IOrder;
  openBottomSheet: () => void;
  
}

const UserOrderItem = ({order, openBottomSheet}: Props) => {

const {status, date_depote, amount, quantite, id} = order

  const router  = useRouter()

  let statusColor = '#5c60f5'; // Default blue
 if (status === EDressStatus.DELIVERED ) statusColor = '#4CAF50';
 if (status === EDressStatus.ONGOING) statusColor = '#FF9800';
 if (status === EDressStatus.FINISHED) statusColor = '#F44336';
        
        return (
          <TouchableOpacity onPress={() => router.replace({pathname: "/(app)/users/ClientOrderDetail", params: {id, from: "user"}}) } style={styles.orderItem}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}></Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{status === EDressStatus.DELIVERED ? 'Délivrée' : status === EDressStatus.ONGOING ? 'En cours' : 'Terminée'}</Text>
              </View>
            </View>
            
            <View style={styles.orderDetails}>
              <View style={styles.orderDetail}>
                <Text style={styles.orderDetailLabel}>Date de dépôt</Text>
                <Text style={styles.orderDetailValue}>{date_depote}</Text>
              </View>
              
              <View style={styles.orderDetail}>
                <Text style={styles.orderDetailLabel}>Montant</Text>
                <Text style={styles.orderDetailValue}>{formatXOF(Number(amount))}</Text>
              </View>
              
              <View style={styles.orderDetail}>
                <Text style={styles.orderDetailLabel}>quantité(s)</Text>
                <Text style={styles.orderDetailValue}>{quantite}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );

       }
    


export default UserOrderItem

const styles = StyleSheet.create({
 orderItem: {
  backgroundColor: 'white',
  borderRadius: 15,
  padding: 15,
  marginBottom: 15,
  boxShadow: Colors.shadow.card,
},
orderHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},
orderNumber: {
  fontSize: SIZES.sm,
  fontWeight: 'bold',
  color: '#333',
},
statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 20,
},
statusText: {
  color: 'white',
  fontSize: SIZES.xs,
  fontWeight: 'bold',
},
orderDetails: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
orderDetail: {
  alignItems: 'center',
},
orderDetailLabel: {
  fontSize: SIZES.xs,
  color: '#888',
  marginBottom: 5,
},
orderDetailValue: {
  fontSize: SIZES.md,
  fontWeight: '600',
  color: colors.grayText,
},

})