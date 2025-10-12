import { useUserStore } from "@/stores/user";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Slot, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNotifications } from "react-native-notificated";
import { StripeProvider } from '@stripe/stripe-react-native';

import * as Notifications from 'expo-notifications';
import { Platform, Text } from "react-native";

import * as Device from 'expo-device';
import Constants  from 'expo-constants';

import { vexo } from 'vexo-analytics';
// import { ConfettiProvider } from "typegpu-confetti/react-native";
import Notification from "@/components/NofiCompo";

// You may want to wrap this with `if (!__DEV__) { ... }` to only run Vexo in production.
vexo(process.env.EXPO_PUBLIC_VEXO_KEY || '');




// ✅ Move queryClient outside the component so it persists
const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Root() {
  const { NotificationsProvider, useNotifications, ...events } =
    createNotifications();

  const { notify } = useNotifications();

     // useReactQueryDevTools(queryClient);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const [isNotif, setIsNotif] = useState(false)
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const {setNotifyToken} = useUserStore();

  const router = useRouter();

  // const { isGoodConnection, connectionType } = useNetworkStatus();


  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) =>{
         if(token){
           token && setExpoPushToken(token)
           setNotifyToken(token)}
          //  console.log("????????????????????????", token)
         }
    );

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? []),
      );
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        //  console.log("Notif recieve=============", notification);

        setNotification( notification);
        setIsNotif(true)
      });
 
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        redirect(response.notification)
        //  console.log("Notif recieve=============", response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  function redirect(notification: Notifications.Notification) {
    const url = notification.request.content.data?.url;
    if (url) {
      router.push(url);
    }
  }

  async function registerForPushNotificationsAsync() {
    let token;

  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } 
  
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log("$$$$$$$$$$$$$$$", token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

  

  return (
     <>

         <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
            <NotificationsProvider>
              <Slot />
            
            </NotificationsProvider>
        </BottomSheetModalProvider>
          </QueryClientProvider>
      </GestureHandlerRootView>
   
     </>
  );
}
