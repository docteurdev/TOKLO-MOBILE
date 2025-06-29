
import { ITokloUser, Toklomen } from '@/interfaces/user';
import { userZustandStorage } from '@/storages/user';
import {create} from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface userState {
 user: Toklomen | null ;
 tokloUser: ITokloUser | null;
 token: string | null;
 userId: string | null;
 notify_token: string | null;
 subscribe: boolean ;
 setUser: (user: Toklomen) => void;
 setTokloUser: (user: ITokloUser) => void; 
 setToken: (token: string) => void;
 setUserId: (id: string) => void;
 setNotifyToken: (token: string) => void;
 setSubscribe: (subscribe: boolean) => void; 
 clearUser: () => void;
 clearTokloUser: () => void;
 clearToken: () => void;
 clearUserId: () => void;
 clearNotifyToken: () => void;
 clearSubscribe: () => void;
}

export const useUserStore = create<userState>()(persist(
 ((set) => ({
  user: null,
  tokloUser: null,
  token: '',
  notify_token: '',
  userId: '',
  subscribe: false,
  setSubscribe: (subscribe: boolean) => set((state) => {
    return {...state, subscribe: subscribe}
  }),
  setUser: (newuser: Toklomen) => set((state) => {
    return {...state, user: newuser }
  }),
  setTokloUser: (newuser: ITokloUser) => set((state) => {
    return {...state, tokloUser: newuser }
  }),
  setToken: (newtoken: string) => set((state) => {
    return {...state, token: newtoken}
  }),
  setUserId: (newid: string) => set((state) => {
   return {...state, userId: newid}
 }),
 
  setNotifyToken: (newnotifytoken: string) => set((state) => {
   return {...state, notify_token: newnotifytoken}
 }),
 clearUser: () => set((state) =>{
  return {...state, user: null}
 }) ,
  clearTokloUser: () => set((state) =>{
    return {...state, tokloUser: null}
  }) ,
 
 clearToken: () => set((state) =>{
  return {...state, token: null}
 }) ,
 clearUserId: () => set((state) =>{
  return {...state, userId: null}
 }) ,
 clearNotifyToken: () => set((state) =>{
  return {...state, notify_token: null, }
 }) ,
  clearSubscribe: () => set((state) =>{
    return {...state, subscribe: false}
  }) ,
 
 })),
 {
  name: 'userStore',
  storage: createJSONStorage(() => userZustandStorage ),
 }
)) 
