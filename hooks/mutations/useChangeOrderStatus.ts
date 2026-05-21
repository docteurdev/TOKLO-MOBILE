import { QueryKeys } from "@/interfaces/queries-key";
import { baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import { EDressStatus } from "@/interfaces/type";
import { useUserStore } from "@/stores/user";
import axios from "axios";

const useChangeOrderStatus = (closeBottomSheet: () => void, status: EDressStatus) => {
  const queryClient = useQueryClient();
  const { handleNotification } = useNotif();
  const { user } = useUserStore();

  return useMutation({
    mutationFn: async (data: { id: number; status: EDressStatus }) => {
      const response = await axios.put(`${baseURL}/orders/update`, data);
      return response.data;
    },
    onSuccess: () => {
      if (status === EDressStatus.ONGOING) {
        queryClient.invalidateQueries({ queryKey: QueryKeys.orders.onGoing });
        queryClient.invalidateQueries({ queryKey: QueryKeys.orders.finished });
        queryClient.invalidateQueries({ queryKey: QueryKeys.orders.stats });
        
      }
      if (status === EDressStatus.FINISHED) {
        queryClient.invalidateQueries({ queryKey: QueryKeys.orders.finished });
        queryClient.invalidateQueries({ queryKey: QueryKeys.orders.delivered });
        queryClient.invalidateQueries({ queryKey: QueryKeys.orders.stats });
      }
      closeBottomSheet();
      handleNotification(
        "success",
        "Commande",
        `La commande est ${status === EDressStatus.ONGOING ? "terminée" : "livrée"}`
      );
    },
    onError: (error) => {
      console.error("Order submission error:", error);
      handleNotification("error", "Erreur", "Échec de la mise à jour du statut de la commande");
    },
  });
};

export default useChangeOrderStatus;