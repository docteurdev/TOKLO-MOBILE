import BottomSheetCompo from "@/components/BottomSheetCompo";
import LoadingScreen from "@/components/Loading";
import PaymentLottieCompo from "@/components/PaymentLottieCompo";
import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import { QueryKeys } from "@/interfaces/queries-key";
import { IPlan, ISubscription } from "@/interfaces/type";
import { useUserStore } from "@/stores/user";
import { base, baseURL } from "@/util/axios";
import { formatXOF, Rs } from "@/util/comon";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { ComponentProps, useCallback, useEffect, useMemo } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import PaymentResult from "./PaymentResult";
import CustomButton from "./form/CustomButton";

const BG = "#FFFDF8";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type PlanKind = "basic" | "pro" | "premium";
type JekoStatus = "pending" | "success" | "error";

type JekoCheckoutResponse = {
  reference: string;
  paymentRequestId: string;
  redirectUrl: string;
};

type JekoStatusResponse = {
  status: JekoStatus;
};

type JekoPaymentMethod = {
  id: string;
  name: string;
  logo?: string | null;
};

type SubscriptionCompoProps = {
  redirectURL: string;
  closeBottomSheet?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const JEKO_PAYMENT_BASE_URL =  baseURL;
const JEKO_ASSET_BASE_URL = JEKO_PAYMENT_BASE_URL.replace(/\/api\/?$/, "");
const PAYMENT_POLL_INTERVAL = 3344;
const PAYMENT_POLL_MAX_DURATION = 120000;

const getQueryParam = (value: unknown) => {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : undefined;
  if (typeof value === "string") return value;
  if (value == null) return undefined;
  return String(value);
};

const getPaymentMethodLogoUrl = (logo?: string | null) => {
  if (!logo) return undefined;
  if (/^https?:\/\//i.test(logo)) return logo;
  return `${JEKO_ASSET_BASE_URL}/${logo.replace(/^\/+/, "")}`;
};

const getPlanIconUrl = (icon?: string | null) => {
  if (!icon) return undefined;
  if (/^https?:\/\//i.test(icon)) return icon;

  const cleanIcon = icon.replace(/^\/+/, "");
  return `${base}${cleanIcon.startsWith("uploads/") ? cleanIcon : `uploads/${cleanIcon}`}`;
};

const normalizePlanName = (name?: string) => name?.trim().toLowerCase() ?? "";

const getPlanKind = (plan?: IPlan): PlanKind => {
  const type = normalizePlanName(plan?.type);
  const name = normalizePlanName(plan?.name);

  if (type.includes("premium") || name.includes("premium")) return "premium";
  if (type.includes("pro") || name.includes("pro")) return "pro";

  return "basic";
};

const getPlanIcon = (plan?: IPlan): IconName => {
  const kind = getPlanKind(plan);

  if (kind === "premium") return "crown";
  if (kind === "pro") return "hanger";

  return "needle";
};

const getPlanPeriod = (plan?: IPlan) => {
  if (!plan || Number(plan.price) === 0) return "Gratuit";
  return "par mois";
};

const getPlanItemValue = (plan: IPlan | undefined, kind = getPlanKind(plan)) => {
  return (item: IPlan["items"][number]) => item[kind];
};

const formatFeatureValue = (value: number | string | boolean) => {
  if (typeof value === "boolean") return value ? "✓" : "—";
  return String(value);
};

const sortPlans = (plans?: IPlan[]) => {
  const order: Record<PlanKind, number> = {
    basic: 0,
    pro: 1,
    premium: 2,
  };

  return [...(plans ?? [])].sort((a, b) => order[getPlanKind(a)] - order[getPlanKind(b)]);
};

const SubscriptionCompo = ({ redirectURL, closeBottomSheet }: SubscriptionCompoProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusBarStyle = theme.background === BG ? "dark-content" : "light-content";
  const { width } = useWindowDimensions();
  const { user, token } = useUserStore();

  const [showSuccess, setShowSuccess] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<IPlan | undefined>(undefined);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>("wave");
  const [currentPaymentReference, setCurrentPaymentReference] = React.useState<string | undefined>(undefined);
  const [isCheckoutLoading, setIsCheckoutLoading] = React.useState(false);
  const [isPaymentPending, setIsPaymentPending] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState<string | undefined>(undefined);
  const [paymentSuccessPaidAt, setPaymentSuccessPaidAt] = React.useState<string | undefined>(undefined);

  const pollingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPaymentReferenceRef = React.useRef<string | undefined>(undefined);
  const paymentMethodBottomSheetRef = React.useRef<BottomSheetModal>(null);
  const paymentResultBottomSheetRef = React.useRef<BottomSheetModal>(null);

  const continueScale = useSharedValue(1);

  const { data, isLoading } = useQuery<IPlan[]>({
    queryKey: [QueryKeys.subscriptionType.all],
    queryFn: async (): Promise<IPlan[]> => {
      const response = await axios.get(`${baseURL}/subscriptionTypes`);
      return response.data as IPlan[];
    },
  });

  const { refetch } = useQuery<ISubscription>({
    queryKey: [QueryKeys.tokloman.subscriptionType],
    queryFn: async (): Promise<ISubscription> => {
      const response = await axios.get(`${baseURL}/subscriptions/last/${user?.id}`);
      return response.data;
    },
    enabled: Boolean(user?.id),
  });

  const {
    data: paymentMethods,
    isLoading: isPaymentMethodsLoading,
    isError: isPaymentMethodsError,
    refetch: refetchPaymentMethods,
  } = useQuery<JekoPaymentMethod[]>({
    queryKey: ["jeko-payment-methods", token],
    queryFn: async (): Promise<JekoPaymentMethod[]> => {
      const response = await axios.get<JekoPaymentMethod[]>(
        `${JEKO_PAYMENT_BASE_URL}/subscriptions/jeko/payment-methods`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        },
      );
      return response.data;
    },
    enabled: Boolean(token),
  });

  const plans = useMemo(() => sortPlans(data), [data]);
  const selectedPaymentMethodData = useMemo(
    () => paymentMethods?.find((method) => method.id === selectedPaymentMethod),
    [paymentMethods, selectedPaymentMethod],
  );

  useEffect(() => {
    if (!selectedPlan && plans.length > 0) {
      setSelectedPlan(plans[0]);
    }
  }, [plans, selectedPlan]);

  // useEffect(() =>{
  //   paymentResultBottomSheetRef.current?.present() 
  // }, [])

  useEffect(() => {
    if (!paymentMethods?.length) return;
    if (paymentMethods.some((method) => method.id === selectedPaymentMethod)) return;
    setSelectedPaymentMethod(paymentMethods[0].id);
  }, [paymentMethods, selectedPaymentMethod]);

  useEffect(() => {
    currentPaymentReferenceRef.current = currentPaymentReference;
  }, [currentPaymentReference]);

  const clearPaymentTimers = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearPaymentTimers;
  }, [clearPaymentTimers]);

  const continueAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: continueScale.value }],
  }));

  const checkPaymentStatus = useCallback(async (
    reference: string,
    options: { keepPollingOnError?: boolean; startPollingOnPending?: boolean } = {},
  ) => {
    const { keepPollingOnError = false, startPollingOnPending = true } = options;
    
    if (!token) {
      setPaymentError("Session expirée. Reconnecte-toi pour relancer le paiement.");
      setIsPaymentPending(false);
      return false;
    }

    try {
      const response = await axios.get<JekoStatusResponse>(
        `${JEKO_PAYMENT_BASE_URL}/subscriptions/jeko/status/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const status = response.data.status;
      
      if (status === "success") {
        setPaymentError(undefined);
        setIsPaymentPending(false);
        setCurrentPaymentReference(reference);
        setPaymentSuccessPaidAt(new Date().toISOString());
        await WebBrowser.dismissBrowser();
        await refetch();
        setShowSuccess(true);
        paymentResultBottomSheetRef?.current?.present();

        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

        successTimeoutRef.current = setTimeout(() => setShowSuccess(false), 2500);
        return false;
      }

      if (status === "error") {
        setIsPaymentPending(false);
        setPaymentError("Le paiement a échoué. Vérifie ton moyen de paiement puis réessaie.");
        await WebBrowser.dismissBrowser();
        return false;
      }

      setPaymentError(undefined);
      if (startPollingOnPending) {
        setCurrentPaymentReference(reference);
        setIsPaymentPending(true);
      }
      return true;
    } catch (error) {
      console.error("Error checking Jeko payment status:", error);
      if (keepPollingOnError) {
        setPaymentError("Vérification du paiement en cours...");
        return true;
      }
      setPaymentError("Impossible de vérifier le paiement pour le moment.");
      return false;
    }
  }, [refetch, token]);

  useEffect(() => {
    if (!isPaymentPending || !currentPaymentReference) return;

    let isCancelled = false;
    const startedAt = Date.now();

    const poll = async () => {
      if (isCancelled) return;

      const isStillPending = await checkPaymentStatus(currentPaymentReference, {
        keepPollingOnError: true,
        startPollingOnPending: false,
      });

      if (isCancelled || !isStillPending) return;

      if (Date.now() - startedAt >= PAYMENT_POLL_MAX_DURATION) {
        setIsPaymentPending(false);
        setPaymentError("Paiement toujours en attente. Nous actualiserons ton abonnement dès confirmation.");
        return;
      }

      pollingTimeoutRef.current = setTimeout(poll, PAYMENT_POLL_INTERVAL);
    };

    pollingTimeoutRef.current = setTimeout(poll, PAYMENT_POLL_INTERVAL);

    return () => {
      isCancelled = true;
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [checkPaymentStatus, currentPaymentReference, isPaymentPending]);

  const handleDeepLink = useCallback((event: { url: string }) => {
    const parsedUrl = Linking.parse(event.url);
    const reference = getQueryParam(parsedUrl.queryParams?.reference)
      ?? currentPaymentReferenceRef.current;
    const paymentPath = [parsedUrl.hostname, parsedUrl.path].filter(Boolean).join("/");
    const pathStatus: JekoStatus | undefined = paymentPath.includes("success")
      ? "success"
      : paymentPath.includes("error")
        ? "error"
        : undefined;
    const isPaymentReturn = paymentPath.includes("payment") || Boolean(pathStatus);

    if (!reference || !isPaymentReturn) return;

    setCurrentPaymentReference(reference);
    checkPaymentStatus(reference);
  }, [checkPaymentStatus]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [handleDeepLink]);

  const handleOpenPaymentSheet = () => {
    if (!selectedPlan) return;

    if (Number(selectedPlan.price) === 0) {
      setPaymentError(undefined);
      return;
    }

    if (!token) {
      setPaymentError("Session expirée. Reconnecte-toi pour relancer le paiement.");
      return;
    }

    if (!user?.id) {
      setPaymentError("Utilisateur introuvable. Reconnecte-toi pour relancer le paiement.");
      return;
    }

    if (!isPaymentMethodsLoading && !paymentMethods?.length) {
      setPaymentError("Aucun moyen de paiement disponible pour le moment.");
      refetchPaymentMethods();
      paymentMethodBottomSheetRef.current?.present();
      return;
    }

    setPaymentError(undefined);
    paymentMethodBottomSheetRef.current?.present();
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    if (Number(selectedPlan.price) === 0) {
      setPaymentError(undefined);
      paymentMethodBottomSheetRef.current?.dismiss();
      return;
    }

    if (!token) {
      setPaymentError("Session expirée. Reconnecte-toi pour relancer le paiement.");
      return;
    }

    if (!user?.id) {
      setPaymentError("Utilisateur introuvable. Reconnecte-toi pour relancer le paiement.");
      return;
    }

    if (!selectedPaymentMethod) {
      setPaymentError("Sélectionne un moyen de paiement pour continuer.");
      return;
    }

    setPaymentError(undefined);
    setIsCheckoutLoading(true);
    setIsPaymentPending(false);

    try {
      const response = await axios.post<JekoCheckoutResponse>(
        `${JEKO_PAYMENT_BASE_URL}/subscriptions/jeko/checkout`,
        {
          planId: selectedPlan.id,
          paymentMethod: selectedPaymentMethod,
          tokloMenId: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { reference, redirectUrl } = response.data;

      if (!reference || !redirectUrl) {
        throw new Error("Invalid Jeko checkout response");
      }

      setCurrentPaymentReference(reference);
      setIsPaymentPending(true);
      setIsCheckoutLoading(false);
      paymentMethodBottomSheetRef.current?.dismiss();

      let result: Awaited<ReturnType<typeof WebBrowser.openAuthSessionAsync>> | undefined;
      try {
        result = await WebBrowser.openAuthSessionAsync(
          redirectUrl,
          Linking.createURL(redirectURL),
        );
      } catch (browserError) {
        console.error("Error opening Jeko payment browser:", browserError);
      }

      if (result?.type === "success" && result.url) {
        handleDeepLink({ url: result.url });
        return;
      }

      await checkPaymentStatus(reference, {
        keepPollingOnError: true,
        startPollingOnPending: true,
      });
    } catch (error) {
      console.error("Error creating Jeko checkout:", error);
      setIsCheckoutLoading(false);
      setIsPaymentPending(false);
      setPaymentError("Impossible de lancer le paiement. Réessaie dans un instant.");
    }
  };

  if (isLoading || !data) {
    return (
      <LoadingScreen
        visible
        backgroundColor={theme.background}
        indicatorColor={theme.gold}
        indicatorSize={48}
        message=""
      />
    );
  }

  const planGap = Rs(8);
  const cardWidth = (width - Rs(32) - planGap * 2) / 3;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      {showSuccess && <PaymentLottieCompo />}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
          <View style={styles.heroTextWrap}>
            <View style={styles.heroLabelRow}>
              <Text style={styles.heroLabel}>ABONNEMENTS TOKLO</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(110).duration(520).springify()} style={styles.plansSection}>
          <View style={[styles.plansRow, { gap: planGap }]}>
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                index={index}
                plan={plan}
                width={cardWidth}
                isSelected={selectedPlan?.id === plan.id}
                onSelect={() => setSelectedPlan(plan)}
              />
            ))}
          </View>
        </Animated.View>

        {paymentError && <Text style={styles.paymentErrorText}>{paymentError}</Text>}

        <FeatureCard selectedPlan={selectedPlan} />
      </ScrollView>

      <SelectedPlanFooter
        isLoading={isCheckoutLoading}
        isPending={isPaymentPending}
        selectedPlan={selectedPlan}
        animatedStyle={continueAnimatedStyle}
        onContinue={handleOpenPaymentSheet}
        onPressIn={() => {
          continueScale.value = withTiming(0.97, { duration: 110 });
        }}
        onPressOut={() => {
          continueScale.value = withSpring(1);
        }}
      />

      <BottomSheetCompo
        bottomSheetModalRef={paymentMethodBottomSheetRef}
        snapPoints={['50%']}
      >
        <PaymentMethodSheet
          isLoading={isCheckoutLoading}
          isPending={isPaymentPending}
          isPaymentMethodsError={isPaymentMethodsError}
          isPaymentMethodsLoading={isPaymentMethodsLoading}
          paymentError={paymentError}
          paymentMethods={paymentMethods ?? []}
          selectedPaymentMethod={selectedPaymentMethod}
          selectedPlan={selectedPlan}
          onClose={() => paymentMethodBottomSheetRef.current?.dismiss()}
          onConfirm={handleSubscribe}
          onRetryPaymentMethods={refetchPaymentMethods}
          onSelect={setSelectedPaymentMethod}
        />
      </BottomSheetCompo>
      <BottomSheetCompo
        bottomSheetModalRef={paymentResultBottomSheetRef}
        snapPoints={['100%']}
      >
        <PaymentResult
          amount={Number(selectedPlan?.price ?? 0)}
          paidAt={paymentSuccessPaidAt}
          paymentMethod={selectedPaymentMethodData?.name}
          planName={selectedPlan?.name}
          transactionId={currentPaymentReference}
          onPrimaryPress={() => {
            paymentResultBottomSheetRef.current?.dismiss();
            closeBottomSheet?.();
          }}
          onSecondaryPress={() => {
            paymentResultBottomSheetRef.current?.dismiss();
          }}
        />
      </BottomSheetCompo>
      
    </View>
  );
};

type PaymentMethodSelectorProps = {
  disabled: boolean;
  paymentMethods: JekoPaymentMethod[];
  selectedPaymentMethod: string;
  onSelect: (paymentMethod: string) => void;
};

const PaymentMethodSelector = ({
  disabled,
  paymentMethods,
  selectedPaymentMethod,
  onSelect,
}: PaymentMethodSelectorProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Animated.View entering={FadeInDown.delay(210).duration(500).springify()} style={styles.paymentMethodWrap}>
      <View style={styles.paymentMethodRow}>
        {paymentMethods.map((method) => {
          const isSelected = selectedPaymentMethod === method.id;
          const logoUrl = getPaymentMethodLogoUrl(method.logo);

          return (
            <Pressable
              disabled={disabled}
              key={method.id}
              onPress={() => onSelect(method.id)}
              style={[
                styles.paymentMethodButton,
                isSelected && styles.paymentMethodButtonSelected,
                disabled && styles.paymentMethodButtonDisabled,
              ]}
            >
              {logoUrl ? (
                <Image
                  resizeMode="contain"
                  source={{ uri: logoUrl }}
                  style={styles.paymentMethodLogo}
                />
              ) : (
                <View style={styles.paymentMethodLogoFallback}>
                  <Text style={styles.paymentMethodLogoFallbackText}>{method.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <Text style={[styles.paymentMethodText, isSelected && styles.paymentMethodTextSelected]}>
                {method.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

type PaymentMethodSheetProps = {
  isLoading: boolean;
  isPending: boolean;
  isPaymentMethodsError: boolean;
  isPaymentMethodsLoading: boolean;
  paymentError?: string;
  paymentMethods: JekoPaymentMethod[];
  selectedPaymentMethod: string;
  selectedPlan?: IPlan;
  onClose: () => void;
  onConfirm: () => void;
  onRetryPaymentMethods: () => void;
  onSelect: (paymentMethod: string) => void;
};

const PaymentMethodSheet = ({
  isLoading,
  isPending,
  isPaymentMethodsError,
  isPaymentMethodsLoading,
  paymentError,
  paymentMethods,
  selectedPaymentMethod,
  selectedPlan,
  onClose,
  onConfirm,
  onRetryPaymentMethods,
  onSelect,
}: PaymentMethodSheetProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.paymentSheetContent}>
      <View style={styles.paymentSheetHeader}>
        <View>
          <Text style={styles.paymentSheetTitle}>
            {selectedPlan?.name ?? "Plan"} · {formatXOF(Number(selectedPlan?.price ?? 0))}
          </Text>
          <Text style={styles.paymentSheetSubtitle}>Moyen de paiement</Text>
        </View>

        <Pressable
          disabled={isLoading || isPending}
          onPress={onClose}
          style={styles.paymentSheetCloseButton}
        >
          <MaterialCommunityIcons name="close" size={Rs(18)} color={theme.text} />
        </Pressable>
      </View>

      {isPaymentMethodsLoading ? (
        <Text style={styles.paymentMethodStateText}>Chargement des moyens de paiement...</Text>
      ) : isPaymentMethodsError ? (
        <View style={styles.paymentMethodStateWrap}>
          <Text style={styles.paymentMethodStateText}>Impossible de charger les moyens de paiement.</Text>
          <Pressable onPress={onRetryPaymentMethods} style={styles.paymentMethodRetryButton}>
            <Text style={styles.paymentMethodRetryText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : paymentMethods.length === 0 ? (
        <Text style={styles.paymentMethodStateText}>Aucun moyen de paiement disponible.</Text>
      ) : (
        <PaymentMethodSelector
          disabled={isLoading || isPending}
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
          onSelect={onSelect}
        />
      )}

      {paymentError && <Text style={styles.paymentSheetErrorText}>{paymentError}</Text>}

      
      <CustomButton
       action={onConfirm}
        disabled={true}
       label={isLoading ? "Chargement..." : isPending ? "Vérification..." : "Payer maintenant"}
 />
    </View>
  );
};

type PlanCardProps = {
  index: number;
  plan: IPlan;
  isSelected: boolean;
  width: number;
  onSelect: () => void;
};

const PlanCard = ({ index, plan, isSelected, width, onSelect }: PlanCardProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scale = useSharedValue(isSelected ? 1.02 : 1);
  const kind = getPlanKind(plan);
  const isPro = kind === "pro";
  const icon = getPlanIcon(plan);
  const planIconUrl = getPlanIconUrl(plan.icon);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.02 : 1, { damping: 15, stiffness: 170 });
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(170 + index * 80).duration(520).springify()}
      onPress={onSelect}
      style={[
        styles.planCard,
        { width },
        isPro && styles.proPlanCard,
        isSelected && styles.selectedPlanCard,
        animatedStyle,
      ]}
    >
      {/* {isPro && <PopularBadge />} */}
      {isSelected && (
        <View style={styles.selectedBadge}>
          <MaterialCommunityIcons name="check" size={Rs(13)} color={theme.gold} />
          <Text style={styles.selectedBadgeText}>Sélectionné</Text>
        </View>
      )}

      <View style={styles.planIconCircle}>
        {planIconUrl ? (
          <Image
            resizeMode="contain"
            source={{ uri: planIconUrl }}
            style={styles.planSewingMachine}
          />
        ) : kind === "basic" ? (
          <Image
            resizeMode="contain"
            source={require("@/assets/souscription/sewing-machine.png")}
            style={styles.planSewingMachine}
          />
        ) : (
          <MaterialCommunityIcons name={icon} size={Rs(12)} color={theme.gold} />
        )}
      </View>

      <Text style={styles.planName}>{plan.name.toUpperCase()}</Text>
      <Text style={styles.planPrice}>{formatXOF(Number(plan.price))}</Text>
      <Text style={styles.planPeriod}>{getPlanPeriod(plan)}</Text>

      <View style={styles.planDivider} />

      <View style={[styles.planButton, isPro ? styles.planButtonFilled : styles.planButtonOutline]}>
        <Text style={[styles.planButtonText, isPro && styles.planButtonTextFilled]}>
          {isSelected ? "Sélectionné" : "Choisir ce plan"}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

type FeatureCardProps = {
  selectedPlan?: IPlan;
};

const FeatureCard = ({ selectedPlan }: FeatureCardProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const planKind = getPlanKind(selectedPlan);
  const valueForPlan = getPlanItemValue(selectedPlan, planKind);

  return (
  <Animated.View entering={FadeInDown.delay(260).duration(520).springify()} style={styles.comparisonCard}>
    <View style={styles.featureSectionHeader}>
      <Text style={styles.comparisonTitle}>Fonctionnalités</Text>
      <Text style={styles.selectedPlanPill}>{selectedPlan?.name ?? "Plan"}</Text>
    </View>

    {selectedPlan?.items.map((item) => (
      <View key={item.feature} style={styles.tableRow}>
        <View style={styles.tableFeatureCell}>
          <View style={styles.featureIconBubble}>
           <Text>{item.icon}</Text>
          </View>
            
          <Text style={styles.tableFeatureText}>{item.feature}</Text>
        </View>
        <TableValue value={valueForPlan(item)} />
      </View>
    ))}
  </Animated.View>
  );
};

type TableValueProps = {
  value: number | string | boolean;
};

const TableValue = ({ value }: TableValueProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const formattedValue = formatFeatureValue(value);
  const isCheck = formattedValue === "✓";
  const isDash = formattedValue === "—";

  return (
    <Text style={[styles.tableValue, isCheck && styles.tableValueCheck, isDash && styles.tableValueDash]}>
      {formattedValue}
    </Text>
  );
};

type SelectedPlanFooterProps = {
  isLoading: boolean;
  isPending: boolean;
  selectedPlan?: IPlan;
  animatedStyle: StyleProp<ViewStyle>;
  onContinue: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

const SelectedPlanFooter = ({
  isLoading,
  isPending,
  selectedPlan,
  animatedStyle,
  onContinue,
  onPressIn,
  onPressOut,
}: SelectedPlanFooterProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const selectedPlanIconUrl = getPlanIconUrl(selectedPlan?.icon);
  const selectedPlanIcon = getPlanIcon(selectedPlan);

  return (
    <Animated.View entering={FadeInDown.delay(360).duration(500)} style={styles.footerWrap}>
      <View style={styles.footerCard}>
        <View style={styles.footerLeft}>
          <View style={styles.footerIconCircle}>
            {selectedPlanIconUrl ? (
              <Image
                resizeMode="contain"
                source={{ uri: selectedPlanIconUrl }}
                style={styles.footerSewingMachine}
              />
            ) : selectedPlan ? (
              <MaterialCommunityIcons name={selectedPlanIcon} size={Rs(15)} color={theme.gold} />
            ) : (
              <Image
                resizeMode="contain"
                source={require("@/assets/souscription/sewing-machine.png")}
                style={styles.footerSewingMachine}
              />
            )}
          </View>

          <View style={styles.footerTextWrap}>
            <Text style={styles.footerEyebrow}>Forfait sélectionné</Text>
            <Text numberOfLines={1} style={styles.footerPlanName}>{selectedPlan?.name ?? "Aucun plan"}</Text>
            <Text style={styles.footerPlanPrice}>{formatXOF(Number(selectedPlan?.price ?? 0))}</Text>
          </View>
        </View>

        <AnimatedPressable
          disabled={!selectedPlan || isLoading || isPending}
          onPress={onContinue}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[
            styles.continueButton,
            (!selectedPlan || isLoading || isPending) && styles.continueButtonDisabled,
            animatedStyle,
          ]}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? "Chargement..." : isPending ? "Vérification..." : "Continuer →"}
          </Text>
        </AnimatedPressable>
      </View>

    </Animated.View>
  );
};

type PatternProps = {
  source: "top" | "bottom";
  style: StyleProp<ViewStyle>;
};

const Pattern = ({ source, style }: PatternProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View pointerEvents="none" style={[styles.patternBase, style]}>
      <Image
        resizeMode="contain"
        source={
          source === "top"
            ? require("@/assets/images/measure/top-sheet.png")
            : require("@/assets/images/measure/down-sheet.png")
        }
        style={styles.patternImage}
      />
    </View>
  );
};

const premiumFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: undefined,
});

const createStyles = (theme: AppTheme) => {
  const isDarkMode = theme.background !== BG;
  const planAccent = isDarkMode ? theme.primary : theme.gold;
  const planAccentSoft = isDarkMode ? theme.primaryLight : theme.goldLight;

  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: Rs(70),
    justifyContent: "space-between",
    paddingHorizontal: Rs(16),
    zIndex: 2,
  },
  headerIconButton: {
    alignItems: "center",
    height: Rs(42),
    justifyContent: "center",
    width: Rs(42),
  },
  headerTitle: {
    color: theme.text,
    fontFamily: premiumFont,
    fontSize: Rs(22),
    fontWeight: "800",
    left: 0,
    position: "absolute",
    right: 0,
    textAlign: "center",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: Rs(4),
  },
  notificationBadge: {
    backgroundColor: theme.gold,
    borderColor: theme.background,
    borderRadius: Rs(5),
    borderWidth: 2,
    height: Rs(10),
    position: "absolute",
    right: Rs(8),
    top: Rs(8),
    width: Rs(10),
  },
  scrollContent: {
    paddingBottom: Rs(108),
    paddingHorizontal: Rs(14),
  },
  hero: {
    marginTop: Rs(8),
    paddingBottom: Rs(6),
    paddingTop: Rs(6),
    position: "relative",
  },
  heroTextWrap: {
    maxWidth: "86%",
  },
  heroLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Rs(8),
    marginBottom: Rs(5),
  },
  heroLabel: {
    color: theme.gold,
    fontSize: Rs(12),
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  heroDiamond: {
    color: theme.gold,
    fontSize: Rs(12),
  },
  heroTitle: {
    color: theme.text,
    fontFamily: premiumFont,
    fontSize: Rs(21),
    fontWeight: "800",
    lineHeight: Rs(26),
  },
  heroTitleGold: {
    color: theme.gold,
  },
  heroSubtitle: {
    color: theme.muted,
    fontSize: Rs(10),
    lineHeight: Rs(16),
    marginTop: Rs(6),
  },
  heroIllustration: {
    alignItems: "center",
    opacity: 0.14,
    position: "absolute",
    right: Rs(-4),
    top: Rs(30),
  },
  heroSewingMachine: {
    height: Rs(48),
    tintColor: theme.gold,
    width: Rs(48),
  },
  threadIcon: {
    marginTop: Rs(-10),
    transform: [{ rotate: "-14deg" }],
  },
  plansSection: {
    marginBottom: Rs(8),
  },
  plansRow: {
    alignItems: "stretch",
    flexDirection: "row",
    paddingTop: Rs(4),
  },
  planCard: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: Rs(10),
    borderWidth: 1,
    minHeight: Rs(150),
    overflow: "hidden",
    padding: Rs(7),
  },
  proPlanCard: {
    borderColor: planAccent,
    borderWidth: 1.5,
    height: Rs(150),
    paddingTop: Rs(8),
  },
  selectedPlanCard: {
    backgroundColor: planAccentSoft,
    borderColor: planAccent,
  },
  selectedBadge: {
    alignItems: "center",
    backgroundColor: isDarkMode ? theme.background : theme.card,
    borderColor: isDarkMode ? theme.primary : theme.border,
    borderRadius: Rs(999),
    borderWidth: 1,
    flexDirection: "row",
    gap: Rs(2),
    paddingHorizontal: Rs(5),
    paddingVertical: Rs(3),
    position: "absolute",
    right: Rs(6),
    top: Rs(6),
    zIndex: 2,
  },
  selectedBadgeText: {
    color: planAccent,
    fontSize: Rs(7),
    fontWeight: "900",
  },
  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: planAccentSoft,
    borderColor: theme.border,
    borderRadius: Rs(999),
    borderWidth: 1,
    marginBottom: Rs(4),
    paddingHorizontal: Rs(4),
    paddingVertical: Rs(3),
  },
  popularBadgeText: {
    color: planAccent,
    fontSize: Rs(6),
    fontWeight: "900",
    letterSpacing: 0,
  },
  planIconCircle: {
    alignItems: "center",
    // backgroundColor: planAccentSoft,
    borderRadius: Rs(18),
    height: Rs(28),
    justifyContent: "center",
    marginBottom: Rs(5),
    width: Rs(28),
  },
  planSewingMachine: {
    height: Rs(80),
    // tintColor: planAccent,
    width: Rs(80),
  },
  planName: {
    color: theme.text,
    fontSize: Rs(9),
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: Rs(3),
  },
  planPrice: {
    color: theme.text,
    fontFamily: premiumFont,
    fontSize: Rs(13),
    fontWeight: "800",
    lineHeight: Rs(16),
  },
  planPeriod: {
    color: theme.muted,
    fontSize: Rs(10),
    marginTop: Rs(2),
  },
  planDivider: {
    backgroundColor: theme.border,
    height: 1,
    marginVertical: Rs(5),
    width: "100%",
  },
  featuresList: {
    gap: Rs(3),
  },
  featureItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Rs(4),
  },
  featureCheck: {
    color: theme.success,
    fontSize: Rs(9),
    fontWeight: "900",
    lineHeight: Rs(10),
  },
  featureText: {
    color: theme.muted,
    flex: 1,
    fontSize: Rs(7),
    lineHeight: Rs(10),
  },
  planButton: {
    alignItems: "center",
    borderRadius: Rs(9),
    borderWidth: 1,
    height: Rs(26),
    justifyContent: "center",
    marginTop: "auto",
    paddingHorizontal: Rs(4),
  },
  planButtonOutline: {
    backgroundColor: "transparent",
    borderColor: planAccent,
  },
  planButtonFilled: {
    backgroundColor: planAccent,
    borderColor: planAccent,
  },
  planButtonText: {
    color: planAccent,
    fontSize: Rs(9),
    fontWeight: "600",
    textAlign: "center",
  },
  planButtonTextFilled: {
    color: "#FFFFFF",
  },
  paymentMethodWrap: {
    marginBottom: Rs(8),
  },
  paymentMethodTitle: {
    color: theme.text,
    fontSize: Rs(10),
    fontWeight: "900",
    marginBottom: Rs(6),
  },
  paymentMethodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Rs(6),
  },
  paymentMethodButton: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: Rs(5),
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: "48%",
    flexDirection: "row",
    gap: Rs(5),
    justifyContent: "flex-start",
    minHeight: Rs(50),
    paddingHorizontal: Rs(9),
    paddingVertical: Rs(5),
  },
  paymentMethodButtonSelected: {
    backgroundColor: theme.goldLight,
    borderColor: theme.gold,
  },
  paymentMethodButtonDisabled: {
    opacity: 0.65,
  },
  paymentMethodLogo: {
    height: Rs(30),
    width: Rs(30),
    borderRadius: Rs(10)
  },
  paymentMethodLogoFallback: {
    alignItems: "center",
    backgroundColor: theme.goldLight,
    borderRadius: Rs(8),
    height: Rs(16),
    justifyContent: "center",
    width: Rs(16),
  },
  paymentMethodLogoFallbackText: {
    color: theme.gold,
    fontSize: Rs(8),
    fontWeight: "900",
  },
  paymentMethodText: {
    color: theme.muted,
    fontSize: Rs(10),
    fontWeight: "600",
  },
  paymentMethodTextSelected: {
    color: theme.gold,
  },
  paymentErrorText: {
    color: theme.danger,
    fontSize: Rs(10),
    fontWeight: "800",
    lineHeight: Rs(14),
    marginBottom: Rs(8),
  },
  paymentSheetContent: {
    backgroundColor: theme.card,
    paddingHorizontal: Rs(16),
    paddingTop: Rs(8),
  },
  paymentSheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Rs(14),
  },
  paymentSheetTitle: {
    color: theme.text,
    fontFamily: premiumFont,
    fontSize: Rs(17),
    fontWeight: "800",
  },
  paymentSheetSubtitle: {
    color: theme.muted,
    fontSize: Rs(11),
    fontWeight: "800",
    marginTop: Rs(4),
  },
  paymentSheetCloseButton: {
    alignItems: "center",
    backgroundColor: theme.goldLight,
    borderColor: theme.border,
    borderRadius: Rs(17),
    borderWidth: 1,
    height: Rs(34),
    justifyContent: "center",
    width: Rs(34),
  },
  paymentMethodStateWrap: {
    marginBottom: Rs(8),
  },
  paymentMethodStateText: {
    color: theme.muted,
    fontSize: Rs(10),
    fontWeight: "800",
    lineHeight: Rs(14),
    marginBottom: Rs(8),
  },
  paymentMethodRetryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: theme.gold,
    borderRadius: Rs(999),
    borderWidth: 1,
    minHeight: Rs(28),
    paddingHorizontal: Rs(10),
    paddingVertical: Rs(5),
  },
  paymentMethodRetryText: {
    color: theme.gold,
    fontSize: Rs(9),
    fontWeight: "900",
  },
  paymentSheetErrorText: {
    color: theme.danger,
    fontSize: Rs(10),
    fontWeight: "800",
    lineHeight: Rs(14),
    marginBottom: Rs(10),
  },
  paymentSheetConfirmButton: {
    alignItems: "center",
    backgroundColor: theme.gold,
    borderRadius: Rs(10),
    height: Rs(42),
    justifyContent: "center",
    marginTop: Rs(4),
  },
  paymentSheetConfirmText: {
    color: "#FFFFFF",
    fontSize: Rs(11),
    fontWeight: "900",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  comparisonCard: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: Rs(10),
    borderWidth: 1,
    marginBottom: Rs(12),
    marginTop: Rs(4),
    overflow: "hidden",
    padding: Rs(10),
  },
  comparisonTitle: {
    color: theme.text,
    fontFamily: premiumFont,
    fontSize: Rs(15),
    fontWeight: "800",
  },
  featureSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Rs(8),
  },
  selectedPlanPill: {
    backgroundColor: theme.goldLight,
    borderColor: theme.border,
    borderRadius: Rs(999),
    borderWidth: 1,
    color: theme.gold,
    fontSize: Rs(9),
    fontWeight: "900",
    maxWidth: Rs(120),
    paddingHorizontal: Rs(8),
    paddingVertical: Rs(4),
  },
  tableHeader: {
    alignItems: "center",
    backgroundColor: theme.goldLight,
    borderRadius: Rs(14),
    flexDirection: "row",
    paddingHorizontal: Rs(8),
    paddingVertical: Rs(10),
  },
  tableFeatureHeader: {
    color: theme.text,
    flex: 1.45,
    fontSize: Rs(9),
    fontWeight: "900",
  },
  tablePlanHeader: {
    color: theme.text,
    flex: 0.74,
    fontSize: Rs(9),
    fontWeight: "900",
    textAlign: "center",
  },
  tableRow: {
    alignItems: "center",
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: Rs(36),
    paddingHorizontal: Rs(4),
  },
  tableFeatureCell: {
    alignItems: "center",
    flex: 1.45,
    flexDirection: "row",
    gap: Rs(8),
    paddingRight: Rs(6),
  },
  featureIconBubble: {
    alignItems: "center",
    backgroundColor: theme.primaryLight,
    borderColor: theme.border,
    borderRadius: Rs(35),
    borderWidth: StyleSheet.hairlineWidth,
    height: Rs(27),
    justifyContent: "center",
    width: Rs(27),
  },
  tableFeatureText: {
    color: theme.text,
    flex: 1,
    fontSize: Rs(10),
    lineHeight: Rs(12),
  },
  tableValue: {
    color: theme.muted,
    flex: 0.74,
    fontSize: Rs(12),
    fontWeight: "800",
    textAlign: "center",
  },
  tableValueCheck: {
    color: theme.gold,
    fontSize: Rs(12),
  },
  tableValueDash: {
    color: theme.muted,
    fontWeight: "700",
  },
  footerWrap: {
    backgroundColor: theme.background,
    borderTopColor: theme.border,
    borderTopWidth: 1,
    bottom: Rs(50),
    left: 0,
    paddingHorizontal: Rs(10),
    paddingTop: Rs(5),
    position: "absolute",
    right: 0,
  },
  footerCard: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: Rs(10),
    borderWidth: 1,
    flexDirection: "row",
    gap: Rs(10),
    minHeight: Rs(68),
    padding: Rs(8),
  },
  footerLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: Rs(10),
    minWidth: 0,
  },
  footerIconCircle: {
    alignItems: "center",
    backgroundColor: theme.goldLight,
    borderRadius: Rs(19),
    height: Rs(30),
    justifyContent: "center",
    width: Rs(30),
  },
  footerSewingMachine: {
    height: Rs(90),
    width: Rs(90),
  },
  footerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  footerEyebrow: {
    color: theme.muted,
    fontSize: Rs(10),
    fontWeight: "800",
  },
  footerPlanName: {
    color: theme.text,
    fontSize: Rs(13),
    fontWeight: "900",
    marginTop: Rs(3),
  },
  footerPlanPrice: {
    color: theme.gold,
    fontSize: Rs(12),
    fontWeight: "900",
    marginTop: Rs(2),
  },
  continueButton: {
    alignItems: "center",
    backgroundColor: theme.gold,
    borderRadius: Rs(5),
    flexBasis: "50%",
    height: Rs(50),
    justifyContent: "center",
  },
  continueButtonDisabled: {
    opacity: 0.55,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: Rs(10),
    fontWeight: "500",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  patternBase: {
    opacity: 0.07,
    position: "absolute",
  },
  patternImage: {
    height: "100%",
    width: "100%",
  },
  topLeftPattern: {
    height: Rs(150),
    left: Rs(-70),
    top: Rs(40),
    width: Rs(150),
  },
  topRightPattern: {
    height: Rs(190),
    right: Rs(-66),
    top: Rs(50),
    width: Rs(190),
  },
  cardPattern: {
    height: Rs(128),
    right: Rs(-34),
    top: Rs(-20),
    width: Rs(128),
  },
  comparisonPattern: {
    bottom: Rs(-40),
    height: Rs(160),
    right: Rs(-38),
    width: Rs(160),
  },
  });
};

export default SubscriptionCompo;
