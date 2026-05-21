import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import axios from "axios";
import { newClientValuesType } from "@/constants/formSchemas";
import { ITokloUser, Toklomen } from "@/interfaces/user";
import { useUserStore } from "@/stores/user";

const useActiveStore = () => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif()
  const {user, setUser} = useUserStore();

  return useMutation({
    mutationFn: async (data: boolean) => {
      console.log( "ooooooooooooo",data);

      
      const response = await axios.put(`${baseURL}/tokloMen/${user?.id}`, {isActiveStore: data});

      return response.data;
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: QueryKeys.tokloman.activeStore }); // Refetch orders list
       
       handleNotification("success", "Activer la boutique", "Votre boutique est maintenant visible")
    },
    onError: (error) => {
      if(axios.isAxiosError(error)){
        console.error(error.response?.data);
        handleNotification("error", "Erreur", "Une erreur est survenue")
      }
      console.error("Order submission error:", error);
    },
  });
};

export default useActiveStore;
