import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfig, axiosConfigFile } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import axios from "axios";
import { useUserStore } from "@/stores/user";
import { TInvoice } from "@/interfaces/type";

const useCreateOrder = (closeBottomSheet: () => void, subcribeBottomSheet: () => void, handleInvoice: () => void) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const {user} = useUserStore()

  return useMutation({
    mutationFn: async (formData: FormData) => {

      // return console.log("FormData", formData)
      // const response = await axiosConfigFile.post("/orders", formData);
       const response = await axiosConfig("toklo_menid", user?.id).post("/orders", formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders.onGoing }); // Refetch orders list
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders.calendar }); // Refetch calendar list;
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders.lastOrder }); // Refetch past orders list
       queryClient.invalidateQueries({ queryKey: QueryKeys.orders.stats });
      closeBottomSheet()
      handleNotification("success", "Commande", "Votre commande a bien été enregistrée");
      handleInvoice()
    },
    onError: (error) => {
      if(axios.isAxiosError(error)) {
        console.error("Order submission error:", error.response?.status);
        if(error.response?.status === 403) {
          handleNotification("error", "Commande", "Forfait expiré, veuillez le renouveler");
          subcribeBottomSheet()
        }
      }
      console.error("Order submission error:", error);
    },
  });
};

export default useCreateOrder;
