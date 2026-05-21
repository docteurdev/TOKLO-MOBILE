import { QueryKeys } from "@/interfaces/queries-key";
import { axiosConfigFile } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useNotif from "../useNotification";
import axios from "axios";

const useCreateOrder = (closeBottomSheet?: () => void) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif()

  return useMutation({
    mutationFn: async (formData: FormData) => {

     const d = {
      toklo_menid: 1,
      month: 2,
      year: 2025,
      status: "FINISHED"
     }

      // return console.log("FormData", formData)
      const response = await axios.post("/stats/weekly", d);
      return response.data;
    },
    onSuccess: () => {
      // handleNotification("success", "Commande", "Votre commande a bien été enregistrée")
    },
    onError: (error) => {
      console.error("Order submission error:", error);
    },
  });
};

export default useCreateOrder;
