import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfig, axiosConfigFile, base, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import axios from "axios";
import { useUserStore } from "@/stores/user";

const userActiveToklomant = ( subcribeBottomSheet: () => void) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const {user, setSubscribe} = useUserStore()

  return useMutation({
    mutationFn: async () => {

      // return console.log("FormData", formData)
      // const response = await axiosConfigFile.post("/orders", formData);
       const response = await axios.post(baseURL+ "/subscriptions/active-tokloman", {toklo_manid: user?.id});

       console.log("response", response.data)
      return response.data;
    },
    onSuccess: () => {
      setSubscribe(true)
      setTimeout(() => {

        subcribeBottomSheet()
      }, 6000)
      handleNotification("success", "Activation", "Votre compte a bien été activé")
    },
    onError: (error) => {
      if(axios.isAxiosError(error)) {
        console.error("Order submission error:", error.response?.status);
        handleNotification("error", "Activation", "Une erreur est survenue lors de l'activation de votre compte, veuillez réessayer");
        
        
      }
      console.error("Order submission error:", error);
    },
  });
};

export default userActiveToklomant;
