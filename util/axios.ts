import axios from "axios";

export const base = "https://toklo.abdoulcodeur.com/";
// "https://toklo.abdoulcodeur.com/"
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

