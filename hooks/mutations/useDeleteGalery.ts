import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import axios from "axios";

const useDeleteGalery = (closeBottomSheet: () => void) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif()

  return useMutation({
    mutationFn: async (id: number) => {

      //  return console.log("FormData", id)
      const response = await axios.delete(baseURL+"/catalogue/" + id.toString());
      console.log("response", response.data)
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.gallery.all }); // Refetch orders list
      closeBottomSheet()
      handleNotification("success", "Catalogue", "Le modèle a bien été supprimé")
    },
    onError: (error) => {
      if(axios.isAxiosError(error)) {
        const message = error.response?.data ;
        console.error("Order submission error:", message);
    }
  }
  });
};

export default useDeleteGalery;
