import BottomSheetCompo from '@/components/BottomSheetCompo'
import PaymentInterface from '@/components/calendar/CardDetails'
import PaymentDetails from '@/components/calendar/OrderDetail'
import BackButton from '@/components/form/BackButton'
import RoundedBtn from '@/components/form/RoundedBtn'
import LoadingScreen from '@/components/Loading'
import { Colors } from '@/constants/Colors'
import useChangeOrderStatus from '@/hooks/mutations/useChangeOrderStatus'
import { QueryKeys } from '@/interfaces/queries-key'
import { EDressStatus, IOrder } from '@/interfaces/type'
import { alertMgs } from '@/util/appText'
import { baseURL } from '@/util/axios'
import { Rs, SIZES } from '@/util/comon'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

type OrderStatusValue = IOrder["status"] | EDressStatus | string | undefined | null;

const getOrderStatus = (status: OrderStatusValue): EDressStatus | undefined => {
  const statuses = Object.values(EDressStatus);

  if (typeof status === "string" && statuses.includes(status as EDressStatus)) {
    return status as EDressStatus;
  }

  if (status && typeof status === "object" && "status" in status) {
    const nestedStatus = status.status;
    if (statuses.includes(nestedStatus)) {
      return nestedStatus;
    }
  }

  return undefined;
};

const DressDetail = () => {

const route = useRouter();
const {id} = useLocalSearchParams <{id: string}> ();

const bottomSheetModalRef = useRef<BottomSheetModal>(null);

const { data, isLoading, error, refetch } = useQuery<IOrder, Error>({
  queryKey: QueryKeys.orders.byId(Number(id)),
  queryFn: async (): Promise<IOrder> => {
    // Explicit return type
 
    try {
      const resp = await axios.get(baseURL+"/orders/"+id);
      // console.log("ààààààààààààààà", resp.data);
      if (resp.data.length > 0) {
        // setOngoingOrderLength(resp.data.length)
      }
      return resp.data; 
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch clients"); 
    }
  },
 });
 
//  alert(data?.status)

const currentStatus = getOrderStatus(data?.status);
const mutationSourceStatus = currentStatus ?? EDressStatus.ONGOING;

const {mutate, isPending} = useChangeOrderStatus(closebottomSheet, mutationSourceStatus)


const handleChangeStatus = () => {
  if (!data || !currentStatus) return;
  const newStatus = currentStatus === EDressStatus.ONGOING ? EDressStatus.FINISHED : EDressStatus.DELIVERED;
  mutate({ id: data.id, status: newStatus });
};
function closebottomSheet(){
  refetch()
  bottomSheetModalRef?.current?.close()
  }

  // if (isLoading) {
  //   return ;
  // }

  if (error) {
    return <Text style={styles.errorText}>Erreur: {error.message}</Text>;
  }

  if (!data || !currentStatus) {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <LoadingScreen
          visible={isLoading}
          backgroundColor="rgba(0, 0, 0, 0.7)"
          indicatorColor="#FFFFFF"
          indicatorSize={48}
          message=""
          animationType="slide"
        />
        {!isLoading && (
          <Text style={styles.errorText}>Commande introuvable</Text>
        )}
      </View>
    );
  }

  const dateRemise = new Date(data.date_remise);
  const dateDepot = new Date(data.date_depote);

  return (
   <View style={{flex: 1, backgroundColor: 'white'}}>
     <View style={{position: "absolute", top: Rs(10), left: Rs(10), width: 40, height: 40, justifyContent: "center", alignItems: "center",}} >
	     <BackButton backAction={() => route.push({pathname: "/(app)/users/[id]", params: {id, from: "user"}})  } />
    </View>

    

    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: Rs(50), }}>

    <LoadingScreen 
                visible={isLoading}
                backgroundColor="rgba(0, 0, 0, 0.7)"
                indicatorColor="#FFFFFF"
                indicatorSize={48}
                message=""
                animationType="slide"
              />
    <View style={{padding: 20, gap: 20, }} >

        
		         <PaymentDetails
		          totalPrice={Number(data?.solde_cal)}
		          status={currentStatus}
		          date_remise={data?.date_remise}
	          date_depot={data.date_depote}
	          solde_cal={data.solde_cal}
	          paiement={data.paiement}
	            />

	         <PaymentInterface
	          clientfullname={data.client_name ?? ""}
	          clientphone={data.client_phone ?? ""}
	          dresstype={data.description}
	          tissu={data.tissus}
	          fabric={data.photos}
	          mesure={data.measure}

	          quantity={data.quantite}
	          solde={data.solde_cal}
	          price={data.amount}
	          paid={data.paiement}

	          date_remise={dateRemise}
	          date_depot={dateDepot}
	          deliveryHour={data.deliveryHour}
	         />
        </View>
    

	     {currentStatus !== EDressStatus.DELIVERED && <View style={{paddingHorizontal: 20, marginBottom: Rs(50), flexDirection: "row", alignItems: "center", gap: 20}} >
        
         <View style={{flex: 1}} >

	           <RoundedBtn
	            label={currentStatus === EDressStatus.ONGOING ? `Terminer le vêtement` : 'Livrer le vêtement'}
	             disabled
	             action={() => bottomSheetModalRef.current?.present()}
	             />
         </View>
      </View>}
	    <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(220)]} >
	       <View style={{height: Rs(150), justifyContent: "center", alignItems: "center", gap: Rs(20), paddingHorizontal: Rs(20)}} >
	        <Text style={{fontSize: SIZES.sm, color: Colors.app.texteLight}}> 
	          {currentStatus === EDressStatus.ONGOING ? alertMgs.order.order.statussChanging.finish.fr : alertMgs.order.order.statussChanging.deliver.fr}
	         </Text>
	        <RoundedBtn label={currentStatus === EDressStatus.ONGOING ? 'Terminer' : 'Livrer'}  disabled loading={isPending} action={() => handleChangeStatus()}  />
	       </View>
	    </BottomSheetCompo>
    </ScrollView>

    
   </View>
  )
}

export default DressDetail

const styles = StyleSheet.create({
 container: {
   flex: 1,
   paddingVertical: Rs(40)
   
 },
	 errorText: {
	   color: Colors.app.error,
	   fontSize: SIZES.sm,
	   padding: Rs(20),
	   textAlign: "center",
	 },
	})
