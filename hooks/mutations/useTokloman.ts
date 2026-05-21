import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import axios from "axios";
import { newClientValuesType } from "@/constants/formSchemas";
import { Toklomen } from "@/interfaces/user";
import { useUserStore } from "@/stores/user";

const useTokloman = () => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif()
  const {user, setUser} = useUserStore();

  return useMutation({
    mutationFn: async (data: Toklomen) => {
      console.log( "ooooooooooooo",data);

      const dd ={...data, adresse: '' , Toklo_menId: 1}
      
      const response = await axios.put(`${baseURL}/tokloMen/${user?.id}`, data);

      if(response.data){
        setUser(response.data)
      }

      return response.data;
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: QueryKeys.tokloman.byTokloman }); // Refetch orders list
     
       handleNotification("success", "Notification", "Préférences sauvegardé ")
    },
    onError: (error) => {
      console.error("Order submission error:", error);
    },
  });
};

export default useTokloman;
