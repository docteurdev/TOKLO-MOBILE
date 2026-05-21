import { QueryKeys } from "@/interfaces/queries-key";
import { baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import { EDressStatus, IOrder } from "@/interfaces/type";
import { useUserStore } from "@/stores/user";
import axios from "axios";

const usePayOrderSold = (closeBottomSheet: () => void, status: EDressStatus) => {
  const queryClient = useQueryClient();
  const { handleNotification } = useNotif();
  const { user } = useUserStore();

  return useMutation({
    mutationFn: async (data: {id: number, paiement: string, solde_cal: string}) => {
      const dd = {
        id: data.id,
        paiement: (Number(data.paiement) + Number(data.solde_cal)).toString(),
        solde_cal: '0',
        status: EDressStatus.DELIVERED,

      }
      const response = await axios.put(`${baseURL}/orders/update`, dd);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders.finished });
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders.delivered });
     
      
      closeBottomSheet();
      handleNotification(
        "success",
        "Commande",
        `La commande est ${status === EDressStatus.ONGOING ? "terminée" : "livrée"}`
      );
    },
    onError: (error) => {
      if(axios.isAxiosError(error)){

        console.error("Order submission error:", error.response?.data);
      }
      handleNotification("error", "Erreur", "Échec de la mise à jour du statut de la commande");
    },
  });
};

export default usePayOrderSold;