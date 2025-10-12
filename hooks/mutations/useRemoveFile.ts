import { QueryKeys } from "@/interfaces/queries-key";
import { baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import { EDressStatus } from "@/interfaces/type";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import { StoreKeys } from "@/interfaces/queries-key/store";

type Props ={
  selectRemoveImg: string;
  id: number;
}
const useRemoveFile = (closeBottomSheet: () => void, refetch: () => void) => {
  const { handleNotification } = useNotif();
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async (data:Props ) => {
      const response = await axios.put(`${baseURL}/file`, {productId: Number(data?.id), imageName: data?.selectRemoveImg});
      return response.data;
    },
    onSuccess: (_response, variables) => {
     closeBottomSheet?.()
     queryClient.invalidateQueries({ queryKey: StoreKeys.product.all });
     refetch()
     
      handleNotification(
        "success",
        "Suppression",
        `Image supprimée avec succès`
      );
    },
    onError: (error) => {
      console.error("Order submission error:", error.message);
      handleNotification("error", "Erreur", "Échec reessaie de la suppression de l'image");
    },
  });
};

export default useRemoveFile;