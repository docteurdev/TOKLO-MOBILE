import { Dimensions } from "react-native"
import * as FileSystem from 'expo-file-system';

import { s, vs, ms, mvs } from 'react-native-size-matters';


const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

export { SCREEN_WIDTH, SCREEN_HEIGHT }

export const SIZES = {
 xs: s(9),
  sm: s(13),
  md: s(12),
  lg: s(15),
  xl: s(17),
}

export  function Rs (z: number){
  return s(z)
}

export  function RVs (z: number){
  return ms(z)
}

export  function RMvs (z: number){
  return mvs(z)
}

export  function RMs (z: number){
  return vs(z)
}


// eas build -p android  --profile preview
export const colors = {
  blue: "#2196F3",
  white: "#fff",
  gray: "#f0f0f0",
  grayText: "#1F2C37",
  black: "#000",
  green: "#1E9600",
  orange: "#f5af19",
  yellow: '#FACC15',
  purple: "#ad5389",
  red: '#FF0000',
  blackOpacity: '#24252685',
  modal: "rgba(0,0,0,.02)",
  price1:  "#eef2f3",
  inputborderColor: "#ECF1F6", 
  available:{
    av_txt: "#00C566",
    av_bg: "#E6F9F0",

    unav_txt: "#ff794c",
    unav_bg: "#FFF2ED"
  },
  dashitem: {
    bg_1: "#eec1c6",
    t_1: '#e83f38',
    bg_2: "#d7f1fe",
    t_2: '#01a0fc',
    bg_3: "#ffcbac",
    t_3: '#f36d1e',
    bg_4: "#f2eaba",
    t_4: '#f2eaba',

    // bg_5: "#d7f1fe",
    // t_5: '#01a0fc',
    // bg_6: "#ffcbac",
    // t_6: '#f36d1e',
  }
  // #7993b0
  // 

}
export const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window')

export const size ={
  s1: 22,
  s3: 18,
  s2: 15,
  sm: 10,
  xs: 9,
  md: 12,
  marginTop: 10,
  sp: 20,
  lg: 12
}

export const spacing ={
  marginPage: 6,
  paddingPage: 15
}

export const rounded ={
  md: 40
}

export const GoogleApiKey = "AIzaSyApnRnmuv4kkEcFhSkTG-f25aTM_u3_MKE";
export const rootUrl = "https://myapi.leyorodelimmo.com/";
export  const geaCodingUrl = "https://maps.googleapis.com/maps/api/geocode/json?";
export async function uriToBase64(uri: string) {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  return base64;
}

export function checkDateDifferenceMatches(
  startDate: string, // Format: dd/mm/yyyy
  endDate: string, // Format: dd/mm/yyyy
  expectedDifferenceInDays: number
): boolean {
  // Helper function to parse date from dd/mm/yyyy format
  function parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day); // JavaScript months are 0-based
  }

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  // Calculate the difference in time (milliseconds)
  const differenceInMilliseconds = end.getTime() - start.getTime();

  // Convert difference from milliseconds to days
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

  // Check if the difference matches the expected value
  return differenceInDays === expectedDifferenceInDays;
}

export function formatXOF(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatIvoryCoastPhoneNumber(input: string) {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');

  // Remove country code if present
  const localNumber = digits.startsWith('225') ? digits.slice(3) : digits;

  // Ensure it's a 10-digit number
  if (localNumber.length !== 10) {
    return 'Invalid number';
  }

  // Format as "XX XX XX XX XX"
  return localNumber.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}



/**
 * Formate un numéro de téléphone en format standard à 10 chiffres (XX-XX-XX-XX-XX)
 * @param phoneNumber - Le numéro de téléphone à formater
 * @returns Le numéro formaté
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Supprime tous les caractères non numériques
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Prend les 10 premiers chiffres et les formate
  const formattedNumber = digitsOnly.slice(0, 10)
    .replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3-$4-$5');
  
  return formattedNumber;
}


export function generateInvoiceNumber(userId: string | number, updatedAt: string): string {
  const date = new Date(updatedAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hash = updatedAt.slice(-6).replace(/\D/g, '').slice(0, 4); // last part digits

  return `FACT-${year}${month}${day}-${userId}-${hash}`;
}


