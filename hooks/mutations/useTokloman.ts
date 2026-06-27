import { QueryKeys } from "@/interfaces/queries-key";
import { Toklomen } from "@/interfaces/user";
import { useUserStore } from "@/stores/user";
import { baseURL } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useNotif from "../useNotification";

const useTokloman = () => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const { user, setUser } = useUserStore();

  return useMutation({
    mutationFn: async (data: Partial<Toklomen>) => {
      const response = await axios.put(`${baseURL}/tokloMen/${user?.id}`, data);

      if (response.data) {
        setUser(response.data);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tokloman.byTokloman,
      }); // Refetch orders list

      handleNotification("success", "Notification", "Préférences sauvegardé ");
    },
    onError: (error) => {
      console.error("Order submission error:", error);
    },
  });
};

export default useTokloman;
