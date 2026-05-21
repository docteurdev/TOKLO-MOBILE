import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import axios from "axios";
import { newClientValuesType } from "@/constants/formSchemas";
import { Toklomen } from "@/interfaces/user";
import { useUserStore } from "@/stores/user";

const useToklomanStore = () => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif()
  const {user, setUser} = useUserStore();

  return useMutation({
    mutationFn: async (data: FormData) => {
      console.log( "ooooooooooooo",data);

      const dd ={...data, adresse: '' , Toklo_menId: 1}
      
      const response = await axiosConfigFile.put(`${baseURL}/tokloMen/store/${user?.id}`, data);
      
      setUser(response.data)
      // console.log("aaaaaa", response.data)

      return response.data;
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: QueryKeys.tokloman.byToklomanStore }); // Refetch orders list
     
       handleNotification("success", "Notification", "Préférences sauvegardé ")
    },
    onError: (error) => {
      
      if (axios.isAxiosError(error)) {
        console.error("Order submission error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        console.error("Unexpected error:", error);
      }
    },
  });
};

export default useToklomanStore;
