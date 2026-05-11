import { Alert } from 'react-native';

type NotificationType = 'success' | 'error';

const useNotif = () => {
  function handleNotification(
    type: NotificationType,
    title: string,
    description: string,
  ) {
    Alert.alert(title || type, description);
  }

  return {
    handleNotification,
  };
};

export default useNotif;
