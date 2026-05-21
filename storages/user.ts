import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware'

export const userStorage = createMMKV({
 id: 'user-storage',

});

export const userZustandStorage: StateStorage = {
 setItem: (name, value) => {
   return userStorage.set(name, value)
 },
 getItem: (name) => {
   const value = userStorage.getString(name)
   return value ?? null
 },
 removeItem: (name) => {
   userStorage.remove(name)
 },
}
