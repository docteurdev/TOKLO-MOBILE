import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import { formatXOF, Rs, SIZES } from "@/util/comon";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { ComponentProps, useMemo } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "./form/CustomButton";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type PaymentResultProps = {
  amount?: number;
  paidAt?: Date | string;
  paymentMethod?: string;
  planName?: string;
  transactionId?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
};

type DetailRow = {
  icon: IconName;
  label: string;
  value: string;
  isStrong?: boolean;
};

const premiumFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: undefined,
});

const formatPaidAt = (paidAt?: Date | string) => {
  const date = paidAt ? new Date(paidAt) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "Aujourd'hui";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(",", " ·");
};

const PaymentResult = ({
  amount,
  paidAt,
  paymentMethod,
  planName,
  transactionId,
  onPrimaryPress,
  onSecondaryPress,
}: PaymentResultProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusBarStyle = theme.background === "#FFFDF8" ? "dark-content" : "light-content";
  const safePlanName = planName?.trim() || "Toklo Pro";
  const safePaymentMethod = paymentMethod?.trim() || "Jeko";
  const safeTransactionId = transactionId?.trim() || "En cours de synchronisation";

  const details: DetailRow[] = [
    { icon: "crown-outline", label: "Forfait", value: safePlanName },
    { icon: "wallet-outline", label: "Montant", value: formatXOF(Number(amount ?? 0)), isStrong: true },
    { icon: "credit-card-check-outline", label: "Moyen de paiement", value: safePaymentMethod },
    { icon: "calendar-clock", label: "Date et heure", value: formatPaidAt(paidAt) },
    { icon: "pound", label: "Transaction ID", value: safeTransactionId },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ZoomIn.duration(500).springify().damping(14)} style={styles.successIllustration}>
          <Image width={28} height={28} style={{width: 150, height: 150}} source={require("@/assets/souscription/subscription-check.png")} />
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(200).duration(450)} style={styles.title}>
          Paiement <Text style={styles.titleAccent}>réussi</Text> !
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(260).duration(450)} style={styles.subtitle}>
          Votre abonnement {safePlanName} a été activé avec succès.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(300).duration(500).springify()} style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Détails du paiement</Text>
          <View style={styles.detailsList}>
            {details.map((item, index) => (
              <View
                key={item.label}
                style={[styles.detailRow, index === details.length - 1 && styles.detailRowLast]}
              >
                <View style={styles.detailLabelWrap}>
                  <View style={styles.detailIconCircle}>
                    <MaterialCommunityIcons name={item.icon} size={Rs(17)} color={theme.primary} />
                  </View>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                </View>
                <Text
                  numberOfLines={2}
                  style={[styles.detailValue, item.isStrong && styles.detailValueStrong]}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500).springify()} style={styles.secureCard}>
          <View style={styles.secureIcon}>
            <MaterialCommunityIcons name="shield-check-outline" size={Rs(23)} color={theme.primary} />
          </View>
          <View style={styles.secureTextWrap}>
            <Text style={styles.secureTitle}>Paiement sécurisé</Text>
            <Text style={styles.secureSubtitle}>Votre transaction est 100% sécurisée via Jeko.</Text>
          </View>
          <View style={styles.lockWrap}>
            <Image style={{height: 20, width: 20}} source={require("@/assets/souscription/jko_logo.jpeg")} />
          </View>
        </Animated.View>

       <View style={{marginTop: Rs(10)}}>

        <CustomButton label="Retournez à votre activité" action={onPrimaryPress} disabled={true} />
       </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: {
    backgroundColor: theme.background,
    flex: 1,
  },
  content: {
    paddingBottom: Rs(36),
    paddingHorizontal: Rs(20),
  },
  successIllustration: {
    alignItems: "center",
    alignSelf: "center",
    height: Rs(150),
    justifyContent: "center",
    marginBottom: Rs(-15),
    marginTop: -Rs(26),
    width: Rs(150),
  },
  checkCircle: {
    alignItems: "center",
    backgroundColor: theme.primary,
    borderColor: theme.gold,
    borderRadius: Rs(52),
    borderWidth: 2,
    height: Rs(104),
    justifyContent: "center",
    shadowColor: theme.primary,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    width: Rs(104),
  },
  starTop: {
    position: "absolute",
    right: Rs(20),
    top: Rs(18),
  },
  starBottom: {
    bottom: Rs(28),
    left: Rs(24),
    position: "absolute",
  },
  title: {
    color: theme.text,
    fontFamily: premiumFont,
    fontSize: SIZES.lg + 8,
    fontWeight: "700",
    textAlign: "center",
  },
  titleAccent: {
    color: theme.primary,
  },
  subtitle: {
    color: theme.muted,
    fontSize: SIZES.md,
    lineHeight: Rs(24),
    marginTop: Rs(10),
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: Rs(10),
    borderWidth: 1,
    marginTop: Rs(32),
    padding: Rs(20),
  },
  cardTitle: {
    color: theme.text,
    fontSize: SIZES.lg,
    fontWeight: "700",
  },
  detailsList: {
    marginTop: Rs(8),
  },
  detailRow: {
    alignItems: "center",
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Rs(6),
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabelWrap: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: Rs(9),
    paddingRight: Rs(10),
  },
  detailIconCircle: {
    alignItems: "center",
    backgroundColor: theme.primaryLight,
    borderRadius: Rs(17),
    height: Rs(30),
    justifyContent: "center",
    width: Rs(30),
  },
  detailLabel: {
    color: theme.muted,
    flex: 1,
    fontSize: SIZES.xs + 2,
    fontWeight: "500",
  },
  detailValue: {
    color: theme.text,
    flex: 1,
    fontSize: Rs(12),
    fontWeight: "500",
    textAlign: "right",
  },
  detailValueStrong: {
    color: theme.primary,
  },
  secureCard: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: Rs(10),
    borderWidth: 1,
    flexDirection: "row",
    gap: Rs(12),
    marginTop: Rs(10),
    padding: Rs(10),
  },
  secureIcon: {
    alignItems: "center",
    backgroundColor: theme.primaryLight,
    borderRadius: Rs(21),
    height: Rs(30),
    justifyContent: "center",
    width: Rs(30), 
  },
  secureTextWrap: {
    flex: 1,
  },
  secureTitle: {
    color: theme.text,
    fontSize: Rs(14),
    fontWeight: "800",
  },
  secureSubtitle: {
    color: theme.muted,
    fontSize: Rs(11),
    lineHeight: Rs(16),
    marginTop: Rs(3),
  },
  lockWrap: {
    alignItems: "center",
    gap: Rs(4),
  },
  providerText: {
    color: theme.gold,
    fontSize: Rs(11),
    fontWeight: "900",
  },
  welcomeCard: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.gold,
    borderRadius: Rs(10),
    borderWidth: 1,
    marginTop: Rs(18),
    overflow: "hidden",
    padding: Rs(10),
  },
  welcomePattern: {
    bottom: Rs(-4),
    flexDirection: "row",
    gap: Rs(7),
    opacity: 0.08,
    position: "absolute",
    right: Rs(12),
    transform: [{ rotate: "-12deg" }],
  },
  patternText: {
    color: theme.gold,
    fontSize: Rs(42),
    fontWeight: "900",
  },
  welcomeIconCircle: {
    alignItems: "center",
    backgroundColor: theme.goldLight,
    borderRadius: Rs(21),
    height: Rs(42),
    justifyContent: "center",
    marginBottom: Rs(12),
    width: Rs(42),
  },
  welcomeTitle: {
    color: theme.text,
    fontFamily: premiumFont,
    fontSize: SIZES.lg,
    fontWeight: "800",
  },
  welcomeSubtitle: {
    color: theme.muted,
    fontSize: Rs(13),
    lineHeight: Rs(20),
  },
  actions: {
    // marginTop: Rs(28),
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.primary,
    borderColor: theme.gold,
    borderRadius: Rs(16),
    borderWidth: 1,
    height: Rs(56),
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: Rs(16),
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.gold,
    borderRadius: Rs(16),
    borderWidth: 1,
    height: Rs(54),
    justifyContent: "center",
    marginTop: Rs(12),
  },
  secondaryButtonText: {
    color: theme.gold,
    fontSize: Rs(13),
    fontWeight: "700",
  },
});

export default PaymentResult;
