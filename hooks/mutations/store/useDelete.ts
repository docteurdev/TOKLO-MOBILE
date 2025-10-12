import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile, baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { newClientValuesType } from "@/constants/formSchemas";
import { useUserStore } from "@/stores/user";
import { Keyboard } from "react-native";
import useNotif from "@/hooks/useNotification";
import { INewProduct } from "@/constants/formSchemas/product";
import { UploadImgProps } from "@/interfaces/type";
import { StoreKeys } from "@/interfaces/queries-key/store";


const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const {user} = useUserStore();

  return useMutation({
    mutationFn: async (id: number) => {
      
      Keyboard.dismiss()            
      const response = await axios.delete(baseURL+ `/product/${id}`);

      return response.data;
    },
    onSuccess: (data) => {
      // console.log("Successfully added new client", data);
      queryClient.invalidateQueries({ queryKey: StoreKeys.product.all }); // Refetch orders list
      // closeForm()
      handleNotification("success", "Suppression", " Le produit a été supprimé");
    },
    onError: (error) => {
     if( axios.isAxiosError(error)){
       
       handleNotification("error", "Erreur", "Réessayer svp!");
       console.error("Order submission error:", error.message);
     }
    },
  });
};

export default useDeleteProduct;
