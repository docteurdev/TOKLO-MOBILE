import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ToastAndroid } from "react-native";

const useDeleteNotif = () => {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (id?: number, deleteAll?: boolean) => {

      //  return console.log("FormData", id)
      const response = await axios.delete(baseURL+"/notif/" + id?.toString());
      console.log("response", response.data)
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.notif.all }); // Refetch orders list
      ToastAndroid.show("Notification supprimée", ToastAndroid.SHORT);
    },
    onError: (error) => {
      if(axios.isAxiosError(error)) {
        const message = error.response?.data ;
        console.error("Order submission error:", message);
    }
  }
  });
};

export default useDeleteNotif;
