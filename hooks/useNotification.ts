import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";

type NotificationType = "success" | "error" | "warning" | "info" | ALERT_TYPE;

type NotificationOptions = {
  autoClose?: number | boolean;
  button?: string;
  onPress?: () => void;
};

const DEFAULT_TOAST_DURATION = 3200;

const normalizeNotificationType = (type: NotificationType): ALERT_TYPE => {
  if (type === ALERT_TYPE.SUCCESS || type === "success") {
    return ALERT_TYPE.SUCCESS;
  }

  if (type === ALERT_TYPE.DANGER || type === "error") {
    return ALERT_TYPE.DANGER;
  }

  if (type === ALERT_TYPE.WARNING || type === "warning") {
    return ALERT_TYPE.WARNING;
  }

  return ALERT_TYPE.INFO;
};

const normalizeText = (value?: string) => value?.trim() || undefined;

const useNotif = () => {
  function handleNotification(
    type: NotificationType,
    title: string,
    description: string,
    options?: NotificationOptions,
  ) {
    Toast.show({
      type: normalizeNotificationType(type),
      title: normalizeText(title) ?? "Toklo",
      textBody: normalizeText(description),
      autoClose: options?.autoClose ?? DEFAULT_TOAST_DURATION,
      onPress: options?.onPress,
    });
  }

  function handleNotificationDialog(
    type: NotificationType,
    title: string,
    description: string,
    options?: NotificationOptions,
  ) {
    Dialog.show({
      type: normalizeNotificationType(type),
      title: normalizeText(title) ?? "Toklo",
      textBody: normalizeText(description),
      button: options?.button ?? "Fermer",
      autoClose: options?.autoClose ?? false,
      closeOnOverlayTap: true,
      onPressButton: () => {
        Dialog.hide();
        options?.onPress?.();
      },
    });
  }

  return {
    handleNotification,
    handleNotificationDialog,
  };
};

export default useNotif;
