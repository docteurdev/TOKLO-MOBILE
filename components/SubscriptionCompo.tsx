import LoadingScreen from "@/components/Loading";
import PaymentLottieCompo from "@/components/PaymentLottieCompo";
import { QueryKeys } from "@/interfaces/queries-key";
import { IPlan, ISubscription } from "@/interfaces/type";
import { useUserStore } from "@/stores/user";
import { baseURL } from "@/util/axios";
import { colors, formatXOF, Rs, SIZES } from "@/util/comon";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as Linking from "expo-linking";
import { useNavigation, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { ComponentProps, useCallback, useEffect, useMemo } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
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

const BG = "#FFFDF8";
const CARD = "#FFFFFF";
const GOLD = "#D8A032";
const GOLD_LIGHT = "#FFF4D8";
const BORDER = "#F0E3CC";
const TEXT = "#1F1F1F";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const CINETPAY = "#E53935";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type PlanKind = "basic" | "pro" | "premium";

type TOut = {
  userId?: number;
  userLastname?: string;
  userFirstname?: string;
  phone?: string;
  adress?: string;
  planId?: number;
  planPrice?: number | string;
  nubm_order?: number;
  numb_catalog?: number;
  status?: boolean;
  notify_token?: string;
};

type SubscriptionCompoProps = {
  redirectURL: string;
  closeBottomSheet?: () => void;
};

type DrawerNavigation = {
  openDrawer?: () => void;
};

type ComparisonRow = {
  label: string;
  basic: string;
  pro: string;
  premium: string;
  icon: IconName;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Nombre de clients", basic: "20", pro: "Illimités", premium: "Illimités", icon: "account-group-outline" },
  { label: "Gestion des mesures", basic: "✓", pro: "✓", premium: "✓", icon: "tape-measure" },
  { label: "Catalogue de créations", basic: "✓", pro: "Avancé", premium: "Avancé", icon: "view-grid-outline" },
  { label: "Statistiques & rapports", basic: "—", pro: "✓", premium: "✓", icon: "chart-box-outline" },
  { label: "Boutique en ligne", basic: "—", pro: "—", premium: "✓", icon: "storefront-outline" },
  { label: "Marketplace Toklo", basic: "—", pro: "—", premium: "✓", icon: "shopping-outline" },
  { label: "Support", basic: "Standard", pro: "Prioritaire", premium: "Dédié", icon: "headset" },
];

const normalizePlanName = (name?: string) => name?.trim().toLowerCase() ?? "";

const getPlanKind = (plan?: IPlan): PlanKind => {
  const name = normalizePlanName(plan?.name);

  if (name.includes("premium")) return "premium";
  if (name.includes("pro")) return "pro";

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

const sortPlans = (plans?: IPlan[]) => {
  const order: Record<PlanKind, number> = {
    basic: 0,
    pro: 1,
    premium: 2,
  };

  return [...(plans ?? [])].sort((a, b) => order[getPlanKind(a)] - order[getPlanKind(b)]);
};

const SubscriptionCompo = ({ redirectURL, closeBottomSheet }: SubscriptionCompoProps) => {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigation>();
  const { width } = useWindowDimensions();
  const { user, notify_token } = useUserStore();

  const [showSuccess, setShowSuccess] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<IPlan | undefined>(undefined);

  const continueScale = useSharedValue(1);

  const { data, isLoading } = useQuery<IPlan[]>({
    queryKey: [QueryKeys.subscriptionType.all],
    queryFn: async (): Promise<IPlan[]> => {
      const response = await axios.get(`${baseURL}/subscriptionTypes`);
      return response.data as IPlan[];
    },
  });

  const { data: userSub, refetch } = useQuery<ISubscription>({
    queryKey: [QueryKeys.tokloman.subscriptionType],
    queryFn: async (): Promise<ISubscription> => {
      const response = await axios.get(`${baseURL}/subscriptions/last/${user?.id}`);
      return response.data;
    },
    enabled: Boolean(user?.id),
  });

  const plans = useMemo(() => sortPlans(data), [data]);

  useEffect(() => {
    if (!selectedPlan && plans.length > 0) {
      setSelectedPlan(plans[0]);
    }
  }, [plans, selectedPlan]);

  const handleDeepLink = useCallback((event: { url: string }) => {
    const { queryParams } = Linking.parse(event.url);

    if (queryParams?.result) {
      try {
        const resultData = JSON.parse(decodeURIComponent(String(queryParams.result)));

        if (resultData) {
          refetch();
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 6000);
          setTimeout(() => closeBottomSheet?.(), 8000);
        }
      } catch (error) {
        console.error("Error parsing result data:", error);
      }
    }
  }, [closeBottomSheet, refetch]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [handleDeepLink]);

  const continueAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: continueScale.value }],
  }));

  const openBrowserWithData = async (outData: TOut) => {
    const redirectUrl = Linking.createURL(redirectURL);
    const url = `https://cinetpay2.leyorodelimmo.com/?data=${encodeURIComponent(
      JSON.stringify(outData),
    )}&redirect=${encodeURIComponent(redirectUrl)}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);
      console.log("WebBrowser result:", result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubscribe = () => {
    if (!selectedPlan) return;

    openBrowserWithData({
      userId: user?.id,
      userLastname: user?.lastname,
      userFirstname: user?.name,
      phone: user?.phone,
      adress: "adress",
      planId: selectedPlan.id,
      planPrice: selectedPlan.price,
      nubm_order: userSub?.numb_order ?? 0,
      numb_catalog: userSub?.numb_catalog ?? 0,
      notify_token: notify_token ?? undefined,
    });
  };

  if (isLoading || !data) {
    return (
      <LoadingScreen
        visible
        backgroundColor={BG}
        indicatorColor={GOLD}
        indicatorSize={48}
        message=""
      />
    );
  }

  const planGap = Rs(8);
  const cardWidth = (width - Rs(32) - planGap * 2) / 3;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      {showSuccess && <PaymentLottieCompo />}
      <Pattern source="top" style={styles.topLeftPattern} />
      <Pattern source="bottom" style={styles.topRightPattern} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
          <View style={styles.heroTextWrap}>
            <View style={styles.heroLabelRow}>
              <Text style={styles.heroLabel}>ABONNEMENTS TOKLO</Text>
              <Text style={styles.heroDiamond}>◈</Text>
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

        <ComparisonCard />
      </ScrollView>

      <SelectedPlanFooter
        selectedPlan={selectedPlan}
        animatedStyle={continueAnimatedStyle}
        onContinue={handleSubscribe}
        onPressIn={() => {
          continueScale.value = withTiming(0.97, { duration: 110 });
        }}
        onPressOut={() => {
          continueScale.value = withSpring(1);
        }}
      />
    </SafeAreaView>
  );
};

type HeaderProps = {
  onMenuPress: () => void;
  onQrPress: () => void;
  onNotificationPress: () => void;
};

const Header = ({ onMenuPress, onQrPress, onNotificationPress }: HeaderProps) => (
  <View style={styles.header}>
    <Pressable onPress={onMenuPress} style={styles.headerIconButton}>
      <MaterialCommunityIcons name="menu" size={Rs(27)} color={TEXT} />
    </Pressable>

    <Text style={styles.headerTitle}>Toklo</Text>

    <View style={styles.headerActions}>
      <Pressable onPress={onQrPress} style={styles.headerIconButton}>
        <MaterialCommunityIcons name="qrcode" size={Rs(25)} color={GOLD} />
      </Pressable>
      <Pressable onPress={onNotificationPress} style={styles.headerIconButton}>
        <MaterialCommunityIcons name="bell-outline" size={Rs(25)} color={TEXT} />
        <View style={styles.notificationBadge} />
      </Pressable>
    </View>
  </View>
);

type PlanCardProps = {
  index: number;
  plan: IPlan;
  isSelected: boolean;
  width: number;
  onSelect: () => void;
};

const PlanCard = ({ index, plan, isSelected, width, onSelect }: PlanCardProps) => {
  const scale = useSharedValue(isSelected ? 1.02 : 1);
  const kind = getPlanKind(plan);
  const isPro = kind === "pro";
  const icon = getPlanIcon(plan);

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
      {isPro && <PopularBadge />}
      {isSelected && (
        <View style={styles.selectedBadge}>
          <MaterialCommunityIcons name="check" size={Rs(13)} color={GOLD} />
          <Text style={styles.selectedBadgeText}>Sélectionné</Text>
        </View>
      )}
      {(kind === "basic" || kind === "premium") && <Pattern source="top" style={styles.cardPattern} />}

      <View style={styles.planIconCircle}>
        {kind === "basic" ? (
          <Image
            resizeMode="contain"
            source={require("@/assets/souscription/sewing-machine.png")}
            style={styles.planSewingMachine}
          />
        ) : (
          <MaterialCommunityIcons name={icon} size={Rs(26)} color={GOLD} />
        )}
      </View>

      <Text style={styles.planName}>{plan.name.toUpperCase()}</Text>
      <Text style={styles.planPrice}>{formatXOF(Number(plan.price))}</Text>
      <Text style={styles.planPeriod}>{getPlanPeriod(plan)}</Text>

      <View style={styles.planDivider} />

      <View style={styles.featuresList}>
        {plan.items?.features?.map((feature) => (
          <View key={feature} style={styles.featureItem}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.planButton, isPro ? styles.planButtonFilled : styles.planButtonOutline]}>
        <Text style={[styles.planButtonText, isPro && styles.planButtonTextFilled]}>
          {isSelected ? "Sélectionné" : "Choisir ce plan"}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

const PopularBadge = () => (
  <View style={styles.popularBadge}>
    <Text style={styles.popularBadgeText}>★ PLUS POPULAIRE</Text>
  </View>
);

const ComparisonCard = () => (
  <Animated.View entering={FadeInDown.delay(260).duration(520).springify()} style={styles.comparisonCard}>
    <Pattern source="bottom" style={styles.comparisonPattern} />
    <Text style={styles.comparisonTitle}>Comparatif des fonctionnalités</Text>

    <View style={styles.tableHeader}>
      <Text style={styles.tableFeatureHeader}>Fonctionnalités</Text>
      <Text style={styles.tablePlanHeader}>Basique</Text>
      <Text style={styles.tablePlanHeader}>Pro</Text>
      <Text style={styles.tablePlanHeader}>Premium</Text>
    </View>

    {COMPARISON_ROWS.map((row) => (
      <View key={row.label} style={styles.tableRow}>
        <View style={styles.tableFeatureCell}>
          <MaterialCommunityIcons name={row.icon} size={Rs(16)} color={GOLD} />
          <Text style={styles.tableFeatureText}>{row.label}</Text>
        </View>
        <TableValue value={row.basic} />
        <TableValue value={row.pro} isPro />
        <TableValue value={row.premium} />
      </View>
    ))}
  </Animated.View>
);

type TableValueProps = {
  value: string;
  isPro?: boolean;
};

const TableValue = ({ value, isPro }: TableValueProps) => {
  const isCheck = value === "✓";
  const isDash = value === "—";

  return (
    <Text style={[styles.tableValue, isPro && styles.tableValuePro, isCheck && styles.tableValueCheck, isDash && styles.tableValueDash]}>
      {value}
    </Text>
  );
};

type SelectedPlanFooterProps = {
  selectedPlan?: IPlan;
  animatedStyle: StyleProp<ViewStyle>;
  onContinue: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

const SelectedPlanFooter = ({
  selectedPlan,
  animatedStyle,
  onContinue,
  onPressIn,
  onPressOut,
}: SelectedPlanFooterProps) => (
  <Animated.View entering={FadeInDown.delay(360).duration(500)} style={styles.footerWrap}>
    <View style={styles.footerCard}>
      <View style={styles.footerLeft}>
        <View style={styles.footerIconCircle}>
          <Image
            resizeMode="contain"
            source={require("@/assets/souscription/sewing-machine.png")}
            style={styles.footerSewingMachine}
          />
        </View>

        <View style={styles.footerTextWrap}>
          <Text style={styles.footerEyebrow}>Forfait sélectionné</Text>
          <Text numberOfLines={1} style={styles.footerPlanName}>{selectedPlan?.name ?? "Aucun plan"}</Text>
          <Text style={styles.footerPlanPrice}>{formatXOF(Number(selectedPlan?.price ?? 0))} / mois</Text>
        </View>
      </View>

      <AnimatedPressable
        disabled={!selectedPlan}
        onPress={onContinue}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.continueButton, !selectedPlan && styles.continueButtonDisabled, animatedStyle]}
      >
        <Text style={styles.continueButtonText}>Continuer →</Text>
      </AnimatedPressable>
    </View>

    <Text style={styles.paymentText}>
      🔒 Paiement 100% sécurisé via <Text style={styles.cinetPay}>CinetPay</Text>.
    </Text>
  </Animated.View>
);

type PatternProps = {
  source: "top" | "bottom";
  style: StyleProp<ViewStyle>;
};

const Pattern = ({ source, style }: PatternProps) => (
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

const premiumFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: undefined,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
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
    color: TEXT,
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
    backgroundColor: GOLD,
    borderColor: BG,
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
    // minHeight: Rs(128),
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
    color: GOLD,
    fontSize: Rs(9),
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  heroDiamond: {
    color: GOLD,
    fontSize: Rs(12),
  },
  heroTitle: {
    color: TEXT,
    fontFamily: premiumFont,
    fontSize: Rs(21),
    fontWeight: "800",
    lineHeight: Rs(26),
  },
  heroTitleGold: {
    color: GOLD,
  },
  heroSubtitle: {
    color: MUTED,
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
    tintColor: GOLD,
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
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: Rs(16),
    borderWidth: 1,
    minHeight: Rs(150),
    overflow: "hidden",
    padding: Rs(7),
  },
  proPlanCard: {
    borderColor: colors.orange,
    borderWidth: 1.5,
    height: Rs(150),
    paddingTop: Rs(8),
  },
  selectedPlanCard: {
    backgroundColor: "#FFFCF4",
    borderColor: GOLD,
  },
  selectedBadge: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
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
    color: GOLD,
    fontSize: Rs(7),
    fontWeight: "900",
  },
  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: GOLD_LIGHT,
    borderColor: BORDER,
    borderRadius: Rs(999),
    borderWidth: 1,
    marginBottom: Rs(4),
    paddingHorizontal: Rs(4),
    paddingVertical: Rs(3),
  },
  popularBadgeText: {
    color: GOLD,
    fontSize: Rs(6),
    fontWeight: "900",
    letterSpacing: 0,
  },
  planIconCircle: {
    alignItems: "center",
    backgroundColor: GOLD_LIGHT,
    borderRadius: Rs(18),
    height: Rs(28),
    justifyContent: "center",
    marginBottom: Rs(5),
    width: Rs(28),
  },
  planSewingMachine: {
    height: Rs(16),
    tintColor: GOLD,
    width: Rs(16),
  },
  planName: {
    color: TEXT,
    fontSize: Rs(8),
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: Rs(3),
  },
  planPrice: {
    color: TEXT,
    fontFamily: premiumFont,
    fontSize: Rs(13),
    fontWeight: "800",
    lineHeight: Rs(16),
  },
  planPeriod: {
    color: MUTED,
    fontSize: Rs(8),
    marginTop: Rs(2),
  },
  planDivider: {
    backgroundColor: BORDER,
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
    color: SUCCESS,
    fontSize: Rs(9),
    fontWeight: "900",
    lineHeight: Rs(10),
  },
  featureText: {
    color: MUTED,
    flex: 1,
    fontSize: SIZES.xs,
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
    borderColor: colors.orange,
  },
  planButtonFilled: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  planButtonText: {
    color: colors.orange,
    fontSize: SIZES.xs,
    fontWeight: "900",
    textAlign: "center",
  },
  planButtonTextFilled: {
    color: CARD,
  },
  comparisonCard: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: Rs(22),
    borderWidth: 1,
    marginBottom: Rs(12),
    marginTop: Rs(4),
    overflow: "hidden",
    padding: Rs(10),
  },
  comparisonTitle: {
    color: TEXT,
    fontFamily: premiumFont,
    fontSize: Rs(15),
    fontWeight: "800",
    marginBottom: Rs(8),
  },
  tableHeader: {
    alignItems: "center",
    backgroundColor: "#FFF8EC",
    borderRadius: Rs(14),
    flexDirection: "row",
    paddingHorizontal: Rs(8),
    paddingVertical: Rs(10),
  },
  tableFeatureHeader: {
    color: TEXT,
    flex: 1.45,
    fontSize: Rs(10),
    fontWeight: "900",
  },
  tablePlanHeader: {
    color: TEXT,
    flex: 0.74,
    fontSize: Rs(9),
    fontWeight: "900",
    textAlign: "center",
  },
  tableRow: {
    alignItems: "center",
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: Rs(36),
    paddingHorizontal: Rs(4),
  },
  tableFeatureCell: {
    alignItems: "center",
    flex: 1.45,
    flexDirection: "row",
    gap: Rs(6),
    paddingRight: Rs(6),
  },
  tableFeatureText: {
    color: TEXT,
    flex: 1,
    fontSize: SIZES.xs,
    lineHeight: Rs(12),
  },
  tableValue: {
    color: MUTED,
    flex: 0.74,
    fontSize: Rs(8),
    fontWeight: "800",
    textAlign: "center",
  },
  tableValuePro: {
    color: GOLD,
  },
  tableValueCheck: {
    color: colors.orange,
    fontSize: Rs(12),
  },
  tableValueDash: {
    color: MUTED,
    fontWeight: "700",
  },
  footerWrap: {
    backgroundColor: BG,
    borderTopColor: BORDER,
    borderTopWidth: 1,
    bottom: Rs(30),
    left: 0,
    paddingHorizontal: Rs(10),
    paddingTop: Rs(5),
    position: "absolute",
    right: 0,
  },
  footerCard: {
    alignItems: "center",
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: Rs(20),
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
    backgroundColor: GOLD_LIGHT,
    borderRadius: Rs(19),
    height: Rs(30),
    justifyContent: "center",
    width: Rs(30),
  },
  footerSewingMachine: {
    height: Rs(18),
    tintColor: GOLD,
    width: Rs(18),
  },
  footerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  footerEyebrow: {
    color: MUTED,
    fontSize: Rs(8),
    fontWeight: "800",
  },
  footerPlanName: {
    color: TEXT,
    fontSize: Rs(13),
    fontWeight: "900",
    marginTop: Rs(3),
  },
  footerPlanPrice: {
    color: colors.orange,
    fontSize: Rs(12),
    fontWeight: "900",
    marginTop: Rs(2),
  },
  continueButton: {
    alignItems: "center",
    backgroundColor: colors.orange,
    borderRadius: Rs(14),
    flexBasis: "50%",
    height: Rs(36),
    justifyContent: "center",
  },
  continueButtonDisabled: {
    opacity: 0.55,
  },
  continueButtonText: {
    color: CARD,
    fontSize: Rs(10),
    fontWeight: "900",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  paymentText: {
    color: MUTED,
    fontSize: Rs(9),
    paddingBottom: Rs(4),
    paddingTop: Rs(4),
    textAlign: "center",
  },
  cinetPay: {
    color: CINETPAY,
    fontWeight: "900",
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

export default SubscriptionCompo;
