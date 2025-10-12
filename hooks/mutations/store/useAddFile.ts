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

type Props = {id: number, image: UploadImgProps | null }

const useAddFile = () => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const {user} = useUserStore();

  return useMutation({
    mutationFn: async (data: Props) => {

     Keyboard.dismiss();
      const formData = new FormData();
      formData.append("id", data.id.toString());

      if(data.image){

        formData.append("image", {
              uri: data.image.uri,
              name: data.image.fileName, // Ensure the name is unique
              type: "image/png", // Ensure the type matches the file
          });
      } 

  
      const response = await axios.put(baseURL+ `/file/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer`,
        },
      });
      // console.log("response", response);
      return response.data;
    },
    onSuccess: (data) => {
      // console.log("Successfully added new client", data);
      // queryClient.invalidateQueries({ queryKey: StoreKeys.product.all }); // Refetch orders list
      // handleNotification("success", "Neauvau produit", "Vouz avez ajouter un nouveau produit");
    },
    onError: (error) => {
     if( axios.isAxiosError(error)){
       
       handleNotification("error", "Erreur", " Une erreur est survenue lors de l'ajout de produit");
       console.error("Order submission error:", error.response);
     }
    },
  });
};

export default useAddFile;
