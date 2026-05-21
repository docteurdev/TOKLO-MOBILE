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

type Props = INewProduct & {category: string, reduction: number, images: UploadImgProps[]}

const useNewProduct = (closeForm: () => void) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const {user} = useUserStore();

  return useMutation({
    mutationFn: async (data: Props) => {
      Keyboard.dismiss()


      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("stock", data.stock.toString());
      formData.append("category", data.category.toString());
      formData.append("reduction", data.reduction.toString());
      formData.append("isActiveReduction", data.reduction? true: false);
      formData.append("tokloman_id", user?.id.toString());
      

      if(data.images.length > 1){

        for(let img of data.images){
          formData.append("images", {
              uri: img.uri,
              name: "fabric.png", // Ensure the name is unique
              type: "image/png", // Ensure the type matches the file
          });
        }
      }


      
      const response = await axios.post(`${baseURL}/product/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer`,
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      console.log("Successfully added new client", data);
      queryClient.invalidateQueries({ queryKey: StoreKeys.product.all }); // Refetch orders list
      // closeForm()
      handleNotification("success", "Neauvau produit", "Vouz avez ajouter un nouveau produit");
    },
    onError: (error) => {
     if( axios.isAxiosError(error)){
       
       handleNotification("error", "Erreur", " Une erreur est survenue lors de l'ajout de produit");
       console.error("Order submission error:", error.message);
     }
    },
  });
};

export default useNewProduct;
