import LoadingScreen from '@/components/Loading'
import NotifItem from '@/components/notif/NotifList'
import NotifEmptyCompo from '@/components/NotifEmptyCompo'
import useDeleteNotifs from '@/hooks/mutations/notifications/useDeleteNotif'
import useDeleteNotif from '@/hooks/mutations/notifications/useDeleteNotification'
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme'
import { QueryKeys } from '@/interfaces/queries-key'
import { TNotif } from '@/interfaces/type'
import { useUserStore } from '@/stores/user'
import { baseURL } from '@/util/axios'
import { SIZES } from '@/util/comon'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useMemo } from 'react'
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

function Header({ action }: { action: () => void }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        Notifications
      </Text>
      <TouchableOpacity
       style={styles.clearButton}
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
        <Text style={styles.clearText}>
          Vider
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const Page = () => {
    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const {user} = useUserStore()
    const {mutate, isPending} = useDeleteNotifs()
    const {mutate: deleteNotfi} = useDeleteNotif()

    const { data, isLoading, refetch } = useQuery<TNotif[], Error>({
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
                backgroundColor={theme.background}
                indicatorColor={theme.primary}
                indicatorSize={48}
                message=""
                animationType="slide"
              />
      }

  return (
    <View style={styles.container} >
      {data?.length === 0 &&
      ( <NotifEmptyCompo
       title="Pas de notifications"
       message="Votre boîte de réception est vide. Les nouveaux messages apparaîtront ici."
       />)
       }

      {data && data?.length > 0 && <Header action={() => !isPending? mutate(user?.id): null } />}
       <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={ <RefreshControl refreshing={isPending} onRefresh={refetch} tintColor={theme.primary} />}
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    alignItems: 'center',
    backgroundColor: theme.card,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    color: theme.text,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
  },
  clearButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearText: {
    color: theme.danger,
    fontSize: 16,
    marginLeft: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
