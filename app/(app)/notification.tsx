import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import NotifEmptyCompo from '@/components/NotifEmptyCompo'
import { colors, SIZES } from '@/util/comon'
import NotifList from '@/components/notif/NotifList'
import { QueryKeys } from '@/interfaces/queries-key'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '@/stores/user'
import { baseURL } from '@/util/axios'
import axios from 'axios'
import { IOrder, TNotif } from '@/interfaces/type'
import NotifItem from '@/components/notif/NotifList'
import useDeleteNotifs from '@/hooks/mutations/notifications/useDeleteNotif'
import LoadingScreen from '@/components/Loading'
import useDeleteNotif from '@/hooks/mutations/notifications/useDeleteNotification'
import { RefreshControl } from 'react-native'

type Props = {}

function Header({ action }: { action: () => void }) {
  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA'}}>
      <Text style={{fontSize: SIZES.lg, fontWeight: 'bold', color: '#000'}}>
        Notifications
      </Text>
      <TouchableOpacity
       style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}
       onPress={() => Alert.alert('Attention', 'Vous êtes sur le point de vider toutes vos notifications. Êtes-vous sûr de vouloir continuer ?',

         [
           {
             text: 'Annuler',
             onPress: () => {
               console.log('Annuler');
             },
             style: 'cancel',
           },
           {
             text: 'Vider',
             onPress: () => {
               action()
             },
             style: 'destructive',
           },
         ],
       )}
       >
        <Text style={{color: '#FF3B30', fontSize: 16, marginLeft: 4}}>
          Vider
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const Page = (props: Props) => {

    const {user} = useUserStore()
    const {mutate, isPending} = useDeleteNotifs()
    const {mutate: deleteNotfi, isPending: isPendingDelete} = useDeleteNotif()

    const { data, isLoading, error, refetch } = useQuery<TNotif[], Error>({
      queryKey: QueryKeys.notif.all,
      queryFn: async (): Promise<TNotif[]> => {
       
        try {
          const resp = await axios.get(`${baseURL}/notif/${user?.id}`);
          // console.log("notifs: ", resp.data);
          return resp.data;
        } catch (error) {
          console.error(error);
          throw new Error("Erreur lors de la récupération des notifications");
        }
      },
    });

    if (isLoading) {
        return  <LoadingScreen 
                visible={isLoading}
                // backgroundColor="rgba(0, 0, 0, 0.7)"
                indicatorColor="#FFFFFF"
                indicatorSize={48}
                message=""
                animationType="slide"
              />
      }

  return (
    <View style={{flex: 1, backgroundColor: "white"}} >
      {data?.length === 0 &&
      ( <NotifEmptyCompo
       title="Pas de notifications"
       message="Votre boîte de réception est vide. Les nouveaux messages apparaîtront ici."
       iconColor={colors.available.unav_txt}
       // primaryColor="#4F46E5"
       />)
       }

      {data && data?.length > 0 && <Header action={() => !isPending? mutate(user?.id): null } />}
       <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={isPending} onRefresh={refetch} />}
       >

         {data?.map((notif, index) => (
           <NotifItem
             key={index}
             notification={notif}
             onDelete={() => deleteNotfi(notif.id)}
             onPress={() => null}
           />
         ))}

       </ScrollView>
    </View>
  )
}

export default Page