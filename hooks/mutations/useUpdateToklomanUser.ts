import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import axios from "axios";
import { newClientValuesType } from "@/constants/formSchemas";
import { ITokloUser, Toklomen } from "@/interfaces/user";
import { useUserStore } from "@/stores/user";

const useUpdateToklomanUser = (closeSheet: () => void) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif()
  const {user, setUser} = useUserStore();

  return useMutation({
    mutationFn: async (data: ITokloUser) => {
      console.log( "ooooooooooooo",data);

      const {id, ...rest} = data;
      console.log("id", id, rest);
      
      const response = await axios.put(`${baseURL}/tokloMen/user/${id}`, rest);

      return response.data;
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: QueryKeys.tokloman.byToklomanUsers }); // Refetch orders list
       closeSheet?.()
       handleNotification("success", "Personel", "Personel modifié ")
    },
    onError: (error) => {
      if(axios.isAxiosError(error)){
        console.error(error.response?.data);
      }
      console.error("Order submission error:", error);
    },
  });
};

export default useUpdateToklomanUser;
