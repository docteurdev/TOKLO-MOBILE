import { ToklomantSubscribeStatusResponse } from "@/interfaces/type";
import { useUserStore } from "@/stores/user";
import { baseURL } from "@/util/axios";
import { useMutation } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import useNotif from "../useNotification";

type ToklomantSubscribeStatusErrorResponse = {
  code?: "FREE_TIME_INACTIVE" | string;
  status?: "free_time_inactive" | "unsubscribe" | string;
  message?: string;
  isActiveFreeTime?: boolean;
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
      if (isAxiosError<ToklomantSubscribeStatusErrorResponse>(error)) {
        const statusCode = error.response?.status;
        const errorData = error.response?.data;
        const shouldOpenActivation =
          statusCode === 402 ||
          statusCode === 403 ||
          statusCode === 404 ||
          errorData?.code === "FREE_TIME_INACTIVE" ||
          errorData?.status === "free_time_inactive" ||
          errorData?.status === "unsubscribe" ||
          errorData?.isActiveFreeTime === false ||
          errorData?.message === "No subscription found for this Toklo Man" ||
          errorData?.message === "Subscription is not active";

        console.error("Subscription status error:", {
          status: statusCode,
          data: errorData,
        });

        if (shouldOpenActivation) {
          setSubscribe(false);
          subcribeBottomSheet();
        }

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
