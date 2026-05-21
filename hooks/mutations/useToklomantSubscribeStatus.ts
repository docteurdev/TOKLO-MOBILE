import { useUserStore } from "@/stores/user";
import { baseURL } from "@/util/axios";
import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import useNotif from "../useNotification";

type ToklomantSubscription = {
  id: number;
  start_date: string;
  end_date: string;
  days_since_expiration: number;
  numb_order: number;
  numb_catalog: number;
  amount: number;
};

export type ToklomantSubscribeStatusResponse =
  | {
      status: "subscribe";
      message: string;
      isActiveFreeTime: true;
      subscription: ToklomantSubscription;
    }
  | {
      status: "unsubscribe";
      message: string;
      isActiveFreeTime: false;
      subscription?: undefined;
    };

const useToklomantSubscribeStatus = (subcribeBottomSheet: () => void) => {
  const { handleNotification } = useNotif();
  const { user, setSubscribe } = useUserStore();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("Toklo Man introuvable");
      }

      const response = await axios.get<ToklomantSubscribeStatusResponse>(
        baseURL + "/subscriptions/check-tokloman/" + user.id,
      );

      console.log("response", response.data);
      return response.data;
    },
    onSuccess: (data) => {
      setSubscribe(data.isActiveFreeTime);

      if (!data.isActiveFreeTime) {
        subcribeBottomSheet();
        return;
      }
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Subscription status error:", error.response?.status);
        return;
      }

      console.error("Subscription status error:", error);
      handleNotification(
        "error",
        "Abonnement",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la vérification de votre abonnement",
      );
    },
  });
};

export default useToklomantSubscribeStatus;
