import { QueryKeys } from "@/interfaces/queries-key";
import { useUserStore } from "@/stores/user";
import { axiosConfig } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import useNotif from "../useNotification";

type UseCreateOrderOptions = {
  closeBottomSheet: () => void;
  subscribeBottomSheet?: () => void;
  claimActiveFreeTime?: () => void;
  handleInvoice?: () => void;
};

type OrderErrorResponse = {
  code?: "FREE_TIME_INACTIVE" | string;
  status?:
    | "free_time_inactive"
    | "unsubscribe"
    | "subscription_expired"
    | string;
  message?: string;
  isActiveFreeTime?: boolean;
  isSubscribed?: boolean;
};

type HandleOrderAccessErrorParams = {
  statusCode?: number;
  errorData?: OrderErrorResponse;
  claimActiveFreeTime?: () => void;
  subscribeBottomSheet?: () => void;
  setSubscribe: (subscribe: boolean) => void;
  handleNotification: (
    type: "success" | "error",
    title: string,
    description: string,
  ) => void;
};

const handleOrderAccessError = ({
  statusCode,
  errorData,
  claimActiveFreeTime,
  subscribeBottomSheet,
  setSubscribe,
  handleNotification,
}: HandleOrderAccessErrorParams) => {
  const isFreeTimeInactive =
    statusCode === 403 &&
    (errorData?.code === "FREE_TIME_INACTIVE" ||
      errorData?.status === "free_time_inactive");

  if (isFreeTimeInactive) {
    setSubscribe(false);

    if (claimActiveFreeTime) {
      claimActiveFreeTime();
    } else {
      handleNotification(
        "error",
        "Activation",
        "Veuillez activer votre mois gratuit depuis l'accueil avant de créer une commande",
      );
    }
    return true;
  }

  const isSubscriptionMissingOrInactive =
    statusCode === 402 &&
    (errorData?.status === "unsubscribe" ||
      errorData?.message === "No subscription found for this Toklo Man" ||
      errorData?.message === "Subscription is not active");

  const isSubscriptionExpired =
    statusCode === 402 &&
    (errorData?.status === "subscription_expired" ||
      errorData?.message === "Subscription expired");

  if (isSubscriptionMissingOrInactive || isSubscriptionExpired) {
    setSubscribe(false);

    subscribeBottomSheet?.();
    return true;
  }

  return false;
};

const useCreateOrder = ({
  closeBottomSheet,
  subscribeBottomSheet,
  claimActiveFreeTime,
  handleInvoice,
}: UseCreateOrderOptions) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const { user, setSubscribe } = useUserStore();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user?.id) {
        throw new Error("Toklo Man introuvable");
      }

      const response = await axiosConfig("toklo_menid", user.id).post(
        "/orders",
        formData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders.onGoing }); // Refetch orders list
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders.calendar }); // Refetch calendar list;
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders.lastOrder }); // Refetch past orders list
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders.stats });
      closeBottomSheet();
      handleInvoice?.();
    },
    onError: (error) => {
      if (isAxiosError<OrderErrorResponse>(error)) {
        const statusCode = error.response?.status;
        const errorData = error.response?.data;

        console.error("Order submission error:", {
          status: statusCode,
          data: errorData,
        });

        const isAccessErrorHandled = handleOrderAccessError({
          statusCode,
          errorData,
          claimActiveFreeTime,
          subscribeBottomSheet,
          setSubscribe,
          handleNotification,
        });

        if (isAccessErrorHandled) {
          return;
        }

        handleNotification(
          "error",
          "Commande",
          "Une erreur est survenue lors de l'enregistrement de la commande",
        );
        return;
      }

      console.error("Order submission error:", error);
      handleNotification(
        "error",
        "Commande",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'enregistrement de la commande",
      );
    },
  });
};

export default useCreateOrder;
