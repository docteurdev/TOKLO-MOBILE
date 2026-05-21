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

type Props = INewProduct & {id: number, category: string, reduction: number, isActiveReduction: boolean}

const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const {user} = useUserStore();

  return useMutation({
    mutationFn: async (data: Props) => {
      console.log("ooooooooooooo",data);
      Keyboard.dismiss()            
      const response = await axios.put(baseURL+ `/product/update`, data);

      return response.data;
    },
    onSuccess: (data) => {
      // console.log("Successfully added new client", data);
      queryClient.invalidateQueries({ queryKey: StoreKeys.product.all }); // Refetch orders list
      // closeForm()
      handleNotification("success", "Modification", " Le produit a été modifié avec succès");
    },
    onError: (error) => {
     if( axios.isAxiosError(error)){
       
       handleNotification("error", "Erreur", "Réessayer!");
       console.error("Order submission error:", error.message);
     }
    },
  });
};

export default useUpdateProduct;
