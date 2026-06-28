import { ISubscription } from "@/interfaces/type";
import { useUserStore } from "@/stores/user";
import { useCurrentPlanStore } from "@/stores/user-current-plan";
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
  const { setCurrentPlan } = useCurrentPlanStore();

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

      return response.data;
    },
    onSuccess: async () => {
      setSubscribe(true);

      if (!user?.id) {
        return;
      }

      const response = await axios.get<ISubscription>(
        `${baseURL}/subscriptions/last/${user.id}`,
      );
      console.log("responsexxxxxxx--------xxx---x-----", response.data);

      setCurrentPlan(response.data);
    },
  });
};

export default useUserActiveToklomant;
