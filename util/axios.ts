import axios from "axios";

export const base = "https://toklo.allons-y.ci/" //"http://192.168.255.125:3344/";
export const baseURL = base+"api";


export const axiosConfigFile = axios.create({
 baseURL,
 headers: {
  Accept: 'application/json',
    'Content-Type': 'multipart/form-data'
 }
})

export const axiosConfig = (key: string, secret: number | undefined) => {

  return axios.create({
    baseURL,
    headers: {
     Accept: 'application/json',
       'Content-Type': 'multipart/form-data',
       [key] : secret
    }
   })
}

