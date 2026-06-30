import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

import BackButton from '@/components/form/BackButton';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { useUserStore } from '@/stores/user';
import { baseURL } from '@/util/axios';
import { Rs } from '@/util/comon';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'expo-router';

type ExternalUrlResponse = {
  id: number;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

const normalizeExternalUrl = (value?: string, userId?: number | string | null) => {
  if (!value) return "";

  const markdownUrl = value.match(/\((https?:\/\/[^)]+)\)/i)?.[1];
  const cleanUrl = (markdownUrl ?? value.replace(/^\[|\]$/g, "")).trim();

  if (!userId) return cleanUrl;

  try {
    const url = new URL(cleanUrl);
    const cleanPathname = url.pathname.replace(/\/+$/, "");
    const encodedUserId = encodeURIComponent(String(userId));

    if (!cleanPathname.endsWith(`/${encodedUserId}`)) {
      url.pathname = `${cleanPathname}/${encodedUserId}`;
    }

    return url.toString();
  } catch {
    return `${cleanUrl.replace(/\/+$/, "")}/${encodeURIComponent(String(userId))}`;
  }
};

const Page = () => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const route = useRouter()
  const { user } = useUserStore();
 
  const { data } = useQuery<ExternalUrlResponse>({
    queryKey: ["external-url", "toklo-man-portfolio-url", user?.id],
    queryFn: async (): Promise<ExternalUrlResponse> => {
      const response = await axios.get(`${baseURL}/externUrl/useId/1`);

      return response.data;
    },
    enabled: Boolean(user?.id),
  });
  const qrValue = normalizeExternalUrl(data?.url, user?.id);

  React.useEffect(() => {
    if (qrValue) {
     
    }
  }, [qrValue]);
  return (
   <View style={styles.container}>
    <View style={styles.backButtonWrap}>
     <BackButton backAction={() => route.back()}/>
    </View>
    <View style={styles.qrContainer}>
      <QRCode
        value={qrValue || "https://toklo.allons-y.ci/"+ user?.id.toString()}
        size={Rs(250)}
        color={theme.primary}
        backgroundColor={theme.card}
      />
    </View>

    <Text style={styles.scanText}>
      Scannez pour voir mon catalogue
    </Text>
   </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.background,
    justifyContent: 'center',
  },
  backButtonWrap: {
    left: Rs(20),
    position: "absolute",
    top: Rs(20),
  },
  qrContainer: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Rs(16),
    shadowColor: theme.background === "#FFFDF8" ? '#000' : '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: theme.background === "#FFFDF8" ? 0.15 : 0.32,
    shadowRadius: 12,
    elevation: 8,
  },
  scanText: {
    marginTop: Rs(20),
    fontSize: 16,
    fontWeight: '600',
    color: theme.muted,
    textAlign: "center",
  }
});

export default Page;
