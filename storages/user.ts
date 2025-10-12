import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware'

export const userStorage = new MMKV({
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
   return userStorage.delete(name)
 },
}