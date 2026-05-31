import { QueryKeys } from "@/interfaces/queries-key";
import { useUserStore } from "@/stores/user";
import { axiosConfig } from "@/util/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import useNotif from "../useNotification";

type UseGaleryOptions = {
  closeBottomSheet: () => void;
  subscribeBottomSheet?: () => void;
  claimActiveFreeTime?: () => void;
};

type CatalogueErrorResponse = {
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

type HandleCatalogueAccessErrorParams = {
  statusCode?: number;
  errorData?: CatalogueErrorResponse;
  subscribeBottomSheet?: () => void;
  claimActiveFreeTime?: () => void;
  handleNotification: (
    type: "success" | "error",
    title: string,
    description: string,
  ) => void;
  setSubscribe: (subscribe: boolean) => void;
};

const handleCatalogueAccessError = ({
  statusCode,
  errorData,
  subscribeBottomSheet,
  claimActiveFreeTime,
  handleNotification,
  setSubscribe,
}: HandleCatalogueAccessErrorParams) => {
  const isFreeTimeInactive =
    statusCode === 403 &&
    (errorData?.code === "FREE_TIME_INACTIVE" ||
      errorData?.status === "free_time_inactive");

  if (isFreeTimeInactive) {
    setSubscribe(false);
    handleNotification(
      "error",
      "Activation",
      "Veuillez activer votre mois gratuit avant de créer un catalogue",
    );
    claimActiveFreeTime?.();
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

const useGalery = ({
  closeBottomSheet,
  subscribeBottomSheet,
  claimActiveFreeTime,
}: UseGaleryOptions) => {
  const queryClient = useQueryClient();

  const { handleNotification } = useNotif();
  const { user, setSubscribe } = useUserStore();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user?.id) {
        throw new Error("Toklo Man introuvable");
      }

      const response = await axiosConfig("toklo_menid", user.id).post(
        "/catalogue",
        formData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.gallery.all }); // Refetch orders list
      closeBottomSheet();
      handleNotification(
        "success",
        "Catalogue",
        "Votre catalogue a bien été enregistré",
      );
    },
    onError: (error) => {
      if (isAxiosError<CatalogueErrorResponse>(error)) {
        const statusCode = error.response?.status;
        const errorData = error.response?.data;

        console.error("Catalogue submission error:", {
          status: statusCode,
          data: errorData,
        });

        const isAccessErrorHandled = handleCatalogueAccessError({
          statusCode,
          errorData,
          subscribeBottomSheet,
          claimActiveFreeTime,
          handleNotification,
          setSubscribe,
        });

        if (isAccessErrorHandled) {
          return;
        }

        handleNotification(
          "error",
          "Catalogue",
          "Une erreur est survenue lors de l'enregistrement du catalogue",
        );
        return;
      }

      console.error("Catalogue submission error:", error);
      handleNotification(
        "error",
        "Catalogue",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'enregistrement du catalogue",
      );
    },
  });
};

export default useGalery;
