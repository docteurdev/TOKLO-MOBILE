import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { newClientValuesType } from "@/constants/formSchemas";
import { useUserStore } from "@/stores/user";
import { Keyboard } from "react-native";
import useNotif from "@/hooks/useNotification";
import { INewProduct } from "@/constants/formSchemas/product";
import { TOrderStatus, UploadImgProps } from "@/interfaces/type";
import { StoreKeys } from "@/interfaces/queries-key/store";


const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const {user} = useUserStore();

  return useMutation({
      mutationFn: async (orderInfo: { orderId: number; status: TOrderStatus }) => {
      console.log("ooooooooooooo",orderInfo)
      Keyboard.dismiss();
      const data = {status: orderInfo.status}            
      const response = await axios.put(baseURL+ `/order/${orderInfo?.orderId}`, data);

      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // console.log("Successfully added new client", data);
      queryClient.invalidateQueries({ queryKey: StoreKeys.product.all }); // Refetch orders list
      // closeForm()
      if(variables.status === "DELIVERED"){
       handleNotification("success", "Livraison", "Commande livrée");

      }else{
        handleNotification("success", "Annulation", "Commande annulée");
      }
    },
    onError: (error) => {
     if( axios.isAxiosError(error)){
       
       handleNotification("error", "Erreur", "Réessayer svp!");
       console.error("Order submission error:", error.message);
     }
    },
  });
};

export default useUpdateOrder;
