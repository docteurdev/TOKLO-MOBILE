import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import axios from "axios";
import { newClientValuesType } from "@/constants/formSchemas";
import { useUserStore } from "@/stores/user";
import { Keyboard } from "react-native";

const useNewClient = (closeForm: () => void) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const {user} = useUserStore();

  return useMutation({
    mutationFn: async (data: newClientValuesType) => {
      Keyboard.dismiss()
      const dd ={...data, adresse: '' , Toklo_menId: user?.id}
      
      const response = await axios.post(`${baseURL}/clients`, dd);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all }); // Refetch orders list
      closeForm()
      // handleNotification("success", "Neauvau client", "Vous avez ajouté un client")
    },
    onError: (error) => {
      console.error("Order submission error:", error);
    },
  });
};

export default useNewClient;
