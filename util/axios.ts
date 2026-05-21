import { create } from "axios";
import { Platform } from "react-native";

const fallbackBase =
  __DEV__ && Platform.OS === "android"
    ? "http://10.106.24.188:3344/"
    : "http://192.168.1.16:3344/";

export const base = process.env.EXPO_PUBLIC_API_URL ?? fallbackBase; //"https://toklo.allons-y.ci/"
export const baseURL = base + "api";

export const axiosConfigFile = create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  },
});

export const axiosConfig = (key: string, secret: number | undefined) => {
  return create({
    baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      [key]: secret,
    },
  });
};
