import { useUserStore } from "@/stores/user";
import { Colors } from "@/constants/Colors";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, type Href } from "expo-router";
import { useCallback, useEffect } from "react";
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as Notifications from "expo-notifications";
import { Image, Platform, StyleSheet, View } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";

import { vexo } from "vexo-analytics";

const vexoKey = process.env.EXPO_PUBLIC_VEXO_KEY;
const shouldEnableVexo =
  process.env.EXPO_PUBLIC_ENABLE_VEXO === "true" && !!vexoKey;

if (shouldEnableVexo) {
  vexo(vexoKey);
}

const queryClient = new QueryClient();

const tokloAlertColors = {
  label: Colors.app.texte,
  card: "#FFFDF8",
  overlay: "rgba(0, 0, 0, 0.28)",
  success: Colors.app.success,
  danger: Colors.app.error,
  warning: Colors.app.warning,
  info: Colors.app.primary,
};

const alertNotificationColors = [tokloAlertColors, tokloAlertColors] as [
  typeof tokloAlertColors,
  typeof tokloAlertColors,
];

const alertTitleStyle = {
  color: Colors.app.texte,
  fontSize: 15,
  fontWeight: "700" as const,
};

const alertTextBodyStyle = {
  color: Colors.app.texteLight,
  fontSize: 13,
  lineHeight: 18,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Root() {
  const { setNotifyToken } = useUserStore();
  const router = useRouter();

  const redirect = useCallback(
    (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.url;
      if (typeof url === "string") {
        router.push(url as Href);
      }
    },
    [router],
  );

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setNotifyToken(token);
      }
    });

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        redirect(response.notification);
      });

    return () => {
      responseListener.remove();
    };
  }, [redirect, setNotifyToken]);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Toklo",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: Colors.app.primary,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error("Project ID not found");
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log("")
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AlertNotificationRoot
        theme="light"
        colors={alertNotificationColors}
        toastConfig={{
          autoClose: 3200,
          titleStyle: alertTitleStyle,
          textBodyStyle: alertTextBodyStyle,
        }}
        dialogConfig={{
          closeOnOverlayTap: true,
          autoClose: false,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <View pointerEvents="none" style={styles.decorationsLayer}>
                    <Image
                      resizeMode="cover"
                      source={require("@/assets/images/measure/cauri.png")}
                      style={[styles.traditionPattern, styles.leftTraditionPattern]}
                    />
            
                    <Image
                      resizeMode="cover"
                      source={require("@/assets/images/measure/cauri.png")}
                      style={[styles.traditionPattern, styles.rightTraditionPattern]}
                    />
                  </View>
            <Slot />
          </BottomSheetModalProvider>
        </QueryClientProvider>

      </AlertNotificationRoot>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorationsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  traditionPattern: {
    position: 'absolute',
    height: 86,
  },
  leftTraditionPattern: {
    top: -40,
    left: -70,
    width: 150,
    height: 110,
    transform: [{ rotate: '40deg' }],
  },
  rightTraditionPattern: {
    top: -35,
    right: -65,
    width: 140,
    height: 105,
    transform: [{ rotate: '-40deg' }],
  },
  })
