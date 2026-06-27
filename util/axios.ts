import { create } from "axios";
import { Platform } from "react-native";

const devFallbackBase =
  __DEV__ && Platform.OS === "android"
    ? "http://10.27.231.188:3344/"
    : "http://localhost:3344/";
const prodFallbackBase = devFallbackBase; //"https://toklo.allons-y.ci/";
const configuredBase = process.env.EXPO_PUBLIC_API_URL;

export const base = (configuredBase ?? prodFallbackBase).replace(/\/?$/, "/");
export const baseURL = base + "api";

export const apiClient = create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

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
