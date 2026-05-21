import { useUserStore } from "@/stores/user";
import { baseURL } from "@/util/axios";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type ActiveToklomanResponse = {
  status?: string;
  message?: string;
  isSubscribed?: boolean;
};

const useUserActiveToklomant = () => {
  const { user, setSubscribe } = useUserStore();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("Toklo Man introuvable");
      }

      const response = await axios.post<ActiveToklomanResponse>(
        baseURL + "/subscriptions/active-tokloman",
        { toklo_manid: user.id },
      );

      if (
        response.data?.status === "error" ||
        response.data?.status === "unsubscribe" ||
        response.data?.isSubscribed === false
      ) {
        throw new Error(
          response.data?.message ??
            "Une erreur est survenue lors de l'activation de votre compte",
        );
      }

      console.log("response", response.data);
      return response.data;
    },
    onSuccess: () => {
      setSubscribe(true);
    },
  });
};

export default useUserActiveToklomant;
