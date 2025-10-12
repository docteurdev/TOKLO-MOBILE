import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";

const useGalery = (closeBottomSheet: () => void) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif()

  return useMutation({
    mutationFn: async (formData: FormData) => {

      // return console.log("FormData", formData)
      const response = await axiosConfigFile.post("/catalogue", formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.gallery.all }); // Refetch orders list
      closeBottomSheet()
      handleNotification("success", "Commande", "Votre commande a bien été enregistrée")
    },
    onError: (error) => {
      console.error("Order submission error:", error);
    },
  });
};

export default useGalery;
