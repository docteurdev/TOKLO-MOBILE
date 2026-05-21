
import { IUser } from '@/interfaces/user';
import { ordersZustandStorage } from '@/storages/order.storage';
import { userZustandStorage } from '@/storages/user';
import {create} from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface orderState {
 orderLength: number ;
 ongoingOrderLength: number ;
 finishedOrderLength: number ;
 deliveredOrderLength: number ;
 setOrderLength: (ordersLength: number) => void;
 setOngoingOrderLength: (ordersLength: number) => void;
 setFinishedOrderLength: (ordersLength: number) => void;
 setDeliveredOrderLength: (ordersLength: number) => void;
// clearOrderLength: () => void;

}

export const useOrderStore = create<orderState>()(persist(
 ((set) => ({
  orderLength: 0,
  ongoingOrderLength: 0,
  finishedOrderLength: 0,
  deliveredOrderLength: 0,
  setOrderLength: (ordersLength: number) => set((state) => {
    return {...state, orderLength: ordersLength}
  }),
  setOngoingOrderLength: (ordersLength: number) => set((state) => {
    return {...state, ongoingOrderLength: ordersLength}
  }),
  setFinishedOrderLength: (ordersLength: number) => set((state) => {
    return {...state, finishedOrderLength: ordersLength}
  }),
  setDeliveredOrderLength: (ordersLength: number) => set((state) => {
    return {...state, deliveredOrderLength: ordersLength}
  }),

 })),
 {
  name: 'useUserStore',
  storage: createJSONStorage(() => ordersZustandStorage ),
 }
)) 
