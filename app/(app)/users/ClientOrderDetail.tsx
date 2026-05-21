import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { Suspense, useRef, useState } from 'react'
import { Colors } from '@/constants/Colors'
import { Image } from 'react-native'
import { formatXOF, Rs, SCREEN_W, SIZES } from '@/util/comon'
import { Square3Stack3DIcon, BanknotesIcon, MinusCircleIcon, Bars2Icon, UserCircleIcon, PhoneIcon, ShoppingCartIcon, CalendarDaysIcon, CalendarIcon, UserIcon, ClockIcon } from "react-native-heroicons/solid";
import ItemChild from '@/components/dress/ItemChild'
import Separator from '@/components/Separator'
import { DisplayMeasure } from '@/components/dress/DisplayMeasure'
import BackButton from '@/components/form/BackButton'
import RoundedBtn from '@/components/form/RoundedBtn'
import { useLocalSearchParams, useRouter } from 'expo-router'
import axios from 'axios'
import { base, baseURL } from '@/util/axios'
import { EDressStatus, IDress, IOrder } from '@/interfaces/type'
import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/interfaces/queries-key'
import BottomSheetCompo from '@/components/BottomSheetCompo'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { alertMgs } from '@/util/appText'
import useChangeOrderStatus from '@/hooks/mutations/useChangeOrderStatus'
import DressStatus from '@/components/dress/DressStatus'
import { ActivityIndicator } from 'react-native'
import PaymentInterface from '@/components/calendar/CardDetails';
import PaymentDetails from '@/components/calendar/OrderDetail';
import LoadingScreen from '@/components/Loading'
import { useUserStore } from '@/stores/user'


type Props = {
 closeSheet: () => void
}

function Card ({data}){



 return (
  <View style={[styles.card, ]}>
    {/* <Text style={styles.dressType} >Détails de la commande  </Text> */}
    <View style={{ }}>
     <Text style={styles.dressType} >{data?.description}  </Text>
     <DressStatus status={data?.status} />
    </View>

    <View style={{marginTop: 20, gap: Rs(20) }} >

    <ItemChild label={`Quantité: ${data?.quantite}`} icon={<Square3Stack3DIcon fill={Colors.app.primary} size={Rs(20)} />} />
    <ItemChild label={`Montant: ${formatXOF(Number(data?.amount))}`} icon={<BanknotesIcon fill={Colors.app.primary} size={Rs(20)} />} />
    </View>

    <View style={{marginTop: 20, gap: Rs(20)}} >
             
      <ItemChild label={`Avance: ${formatXOF(Number(data?.paiement))}`} icon={<MinusCircleIcon fill={Colors.app.primary} size={Rs(20)} />} />
      <ItemChild label={`Reste: ${formatXOF(Number(data?.solde_cal))}`} icon={<Bars2Icon fill={Colors.app.primary} size={Rs(20)} />} />
     
   
    </View>

    <View style={{gap: Rs(20), marginTop: 20,  }} >

      <ItemChild label={`Reception : `+ new Date(data?.date_depot).toLocaleDateString("fr-FR", {weekday: "long", day: "numeric", month: "long", year: "numeric"})} icon={<CalendarDaysIcon fill={Colors.app.primary} size={Rs(20)} />} />
      <ItemChild label={`Livraison : `+ new Date(data?.date_remise).toLocaleDateString("fr-FR", {weekday: "long", day: "numeric", month: "long", year: "numeric"})} icon={<CalendarIcon fill={Colors.app.primary} size={Rs(20)} />} />
      <ItemChild label={`Heure de livraison : ${data?.deliveryHour}`} icon={<ClockIcon fill={Colors.app.primary} size={Rs(20)} />} />
    </View>

   

    <Separator />
    
    <Text style={styles.dressType} > Client  </Text>

    <View style={[{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}]} >
          
             <ItemChild label={data?.client_name} icon={<UserIcon fill={Colors.app.primary} size={Rs(20)} />} />
             <ItemChild label={data?.client_phone} icon={<PhoneIcon fill={Colors.app.primary} size={Rs(18)} />} />
          
       </View>
 </View>
 )
}


function MeasureCard ({measure}: {[key: string]: number}){
  // alert(JSON.stringify(measure))
 return (
  <View style={[styles.card, {boxShadow:"none", padding: 0}]}>
    <Text style={styles.dressType} > Mesures  </Text>

   {measure && <View style={{flexDirection: "row", flexWrap: "wrap", gap: 3, justifyContent: "center"}} >
     {Object?.entries(measure).map(([key, value]) => <DisplayMeasure value={value} title={key} key={key} />)}
      
    </View>}
    

    
 </View>
 )
}


function DetailHeader (){
 return (
  <View style={{}}>
   <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
   
   </ScrollView>
 </View>
 )
}


const DressDetail = ({closeSheet}: Props) => {

const route = useRouter();
const {id, from} = useLocalSearchParams <{id: string, from: string}> ();

const bottomSheetModalRef = useRef<BottomSheetModal>(null);

const {user} = useUserStore()

const { data, isLoading, error, refetch } = useQuery<IOrder, Error>({
  queryKey: QueryKeys.orders.byId(Number(id)),
  queryFn: async (): Promise<IOrder> => {
    // Explicit return type
 
    const data = {
      Toklo_menId: user?.id,
      status: "ONGOING",
    };
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

const [dressStatus, setDressStatus] = useState<EDressStatus | undefined>(data?.status)

const {mutate, isPending} = useChangeOrderStatus(closebottomSheet, )


const handleChangeStatus = () => {
  if (!data) return;
  const newStatus = data.status === EDressStatus.ONGOING ? EDressStatus.FINISHED : EDressStatus.DELIVERED;
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
          quantity={data?.quantite}
          status={data?.status}
          date_remise={data?.date_remise}
            />

         <PaymentInterface
          clientfullname={data?.client_name}
          clientphone={data?.client_phone}
          dresstype={data?.description}
          tissu={data?.tissus}
          fabric={data?.photos}
          mesure={data?.measure}

          quantity={data?.quantite}
          solde={data?.solde_cal}
          price={data?.amount}
          paid={data?.paiement}

          date_remise={data?.date_remise}
          date_depot={data?.date_depote}
          deliveryHour={data?.deliveryHour}
         />
        </View>
    

     {data?.status !== "DELIVERED" && <View style={{paddingHorizontal: 20, marginBottom: Rs(50), flexDirection: "row", alignItems: "center", gap: 20}} >
        
         <View style={{flex: 1}} >

           <RoundedBtn
            label={data?.status === EDressStatus.ONGOING ? `Terminer le vêtement` : 'Livrer le vêtement'}
             disabled
             action={() => bottomSheetModalRef.current?.present()}
             />
         </View>
      </View>}
    <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(190)]} >
       <View style={{height: Rs(150), justifyContent: "center", alignItems: "center", gap: Rs(20), paddingHorizontal: Rs(20)}} >
        <Text style={{fontSize: SIZES.sm, color: Colors.app.texteLight}}> 
          {data?.status === EDressStatus.ONGOING ? alertMgs.order.order.statussChanging.finish.fr : alertMgs.order.order.statussChanging.deliver.fr}
         </Text>
        <RoundedBtn label={data?.status === "ONGOING" ? 'Terminer' : 'Livrer'}  disabled loading={isPending} action={() => handleChangeStatus()}  />
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
 card:{
   padding: 20,
   minHeight: 200,
   boxShadow: Colors.shadow.card,
   margin: 20,
   borderRadius: 10
 },
 dressType:{
  fontWeight: "700",
  color: Colors.app.texte,
  fontSize: SIZES.sm,
  marginBottom: 20
 },
})