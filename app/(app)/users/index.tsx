import AddNewClientCompo from '@/components/AddNewClientCompo'
import FlatBtn from '@/components/FlatBtn'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import UserItem from '@/components/user/UserItem'
import { QueryKeys } from '@/interfaces/queries-key'
import { IClient } from '@/interfaces/type'
import { useUserStore } from '@/stores/user'
import { baseURL } from '@/util/axios'
import { colors, SIZES } from '@/util/comon'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'expo-router'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import BottomSheetCompo from './../../../components/BottomSheetCompo'

type Props = {}

const  Page = (props: Props) => {

   const [filterVal, setFilterVal] = useState('')
  
   const router = useRouter();

   const {user} = useUserStore()

   const bottomSheetRef = useRef<BottomSheetModal>(null);

  const { data, isLoading, error, refetch } = useQuery<IClient[], Error>({
    queryKey: QueryKeys.clients.all,
    queryFn: async (): Promise<IClient[]> => {  // Explicit return type
      try {
        const resp = await axios.post(`${baseURL}/clients/by-toklo-menId`, {Toklo_menId: user?.id});
        // console.log("ààààààààààààààà", resp.data)
        return resp.data?.reverse(); // Ensure `resp.data` is returned
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
      }
    },
  });

  
  
 const dataFiltered = useMemo(() => {
  return data?.filter(item => {
    const searchTerm = filterVal?.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchTerm) ||
      item.lastname?.toLowerCase().includes(searchTerm) 
    )
  });
}, [data]); // Only recalculate when data or filterVal changes

// Memoize keyExtractor
const keyExtractor = useCallback((item: IClient) => 
  item.id.toString(),
[]);

// Memoize renderItem
const renderItem = useCallback(({ item }: { item: IClient }) => (
  <UserItem user={item} action={() => router.push({pathname: "/(app)/users/[id]", params: {id: item?.id}})}  />
), []);


   

  return (
    <>
    <ScreenWrapper>
        <View>
          <ThemedText style={{ fontSize: SIZES.sm, fontWeight: "bold" }}>
            Clients
          </ThemedText>
          

        </View>

        <FlashList
                   data={dataFiltered}
                   keyExtractor={keyExtractor}
                   renderItem={renderItem}
                  
                   showsVerticalScrollIndicator={false}
                   keyboardShouldPersistTaps="handled"
                   onRefresh={refetch}
                   refreshing={isLoading}
                  //  ListEmptyComponent={ListEmptyComponent}
                   removeClippedSubviews={true} // Optimisation de performance
                   estimatedItemSize={200}
                 />
    
    
    </ScreenWrapper>

     <FlatBtn bg={colors.orange} action={() => bottomSheetRef.current?.present()} />
    <BottomSheetCompo bottomSheetModalRef={bottomSheetRef} snapPoints={['80%']} >
      <AddNewClientCompo handleShowAddClient={() => {
        refetch()
        bottomSheetRef?.current?.close()
      } } />
    </BottomSheetCompo>
    </>
  )
}

export default  Page

const styles = StyleSheet.create({})