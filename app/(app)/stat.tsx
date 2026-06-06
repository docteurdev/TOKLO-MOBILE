import BottomSheetCompo from '@/components/BottomSheetCompo';
import LoadingScreen from '@/components/Loading';
import { Colors } from '@/constants/Colors';
import { QueryKeys } from '@/interfaces/queries-key';
import { IStats } from '@/interfaces/type';
import { useUserStore } from '@/stores/user';
import { baseURL } from '@/util/axios';
import { colors, formatXOF, Rs, SCREEN_W, SIZES } from '@/util/comon';
import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

const GOLD = '#D8A032';
const INK = '#211A13';
const MUTED = '#756B5C';
const BORDER = '#EADFCB';
const BEIGE = '#f4e8d380';
const CARD = '#FFFFFF';
const CHART_HEIGHT = 128;
const CHART_WIDTH = 320;
const WEEK_ACTIVE_CARD_WIDTH = Rs(108);
const WEEK_CARD_GAP = Rs(10);
const WEEK_CARD_WIDTH = Rs(96);

const STATUS_COLORS = {
  ongoing: GOLD,
  delivered: '#4E9F74',
  finished: '#4D83B8',
  cancelled: '#CF5F59',
};

const months = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const createYearOptions = (currentYear: number) => {
  return Array.from({ length: 7 }, (_, index) => currentYear - 4 + index).reverse();
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type IconName = keyof typeof Feather.glyphMap;

type KpiCardProps = {
  icon: IconName;
  label: string;
  value: string | ReactNode;
};

type StatusCardProps = {
  color: string;
  icon: IconName;
  label: string;
  showDivider?: boolean;
  value: number;
};

type DistributionItem = {
  color: string;
  icon: IconName;
  label: string;
  percent: number;
  value: number;
  watermarkIcon: IconName;
};

type WeeklyCard = {
  amount: number;
  count: number;
  isCurrent: boolean;
  weekNumber: number;
};

const getMonthName = (monthNumber?: number) => {
  if (!monthNumber) {
    return months[new Date().getMonth()];
  }

  return months[monthNumber - 1] ?? months[0];
};

const getCurrentWeekNumber = (month: number, year: number) => {
  const today = new Date();
  const isSelectedMonth = today.getMonth() + 1 === month && today.getFullYear() === year;

  return isSelectedMonth ? Math.ceil(today.getDate() / 7) : 0;
};

const PatternCorner = () => (
  <View style={styles.patternCorner}>
    <View style={styles.patternDiamond} />
    <View style={[styles.patternDiamond, styles.patternDiamondSmall]} />
    <View style={styles.patternLine} />
  </View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const KpiCard = ({ icon, label, value }: KpiCardProps) => (
  <View style={styles.kpiCard}>
    <Image source={require("@/assets/images/measure/app-bar.png")} style={styles.kpiAccent} />
    <View style={styles.iconCircle}>
      <Feather name={icon} size={Rs(17)} color={GOLD} />
    </View>

    <Text style={styles.kpiLabel} numberOfLines={2}>
      {label}
    </Text>

    <Text style={styles.kpiValue} numberOfLines={1}>
      {value}
    </Text>
    
  </View>
);

const StatusCard = ({ color, icon, label, showDivider = false, value }: StatusCardProps) => (
  <View style={styles.statusCard}>
    <View style={[styles.statusIcon, { backgroundColor: `${color}18` }]}>
      <Feather name={icon} size={Rs(15)} color={color} />
    </View>
    <Text style={styles.statusLabel}>{label}</Text>
    <Text style={[styles.statusValue, { color }]}>{value}</Text>
    <View style={{height: 2, width: 30, backgroundColor: color}} />
    {showDivider && <View style={styles.statusDivider} />}
  </View>
);

const DistributionHeader = () => (
  <View style={styles.distributionHeader}>
    <View style={styles.distributionHeaderLeft}>
      <View style={styles.distributionHeaderIcon}>
        <Feather name="bar-chart-2" size={Rs(15)} color={GOLD} />
      </View>
      <Text style={styles.sectionTitle}>Répartition par statut</Text>
    </View>
  </View>
);

const DistributionStatusCard = ({
  color,
  icon,
  label,
  percent,
  value,
  watermarkIcon,
}: DistributionItem) => (
  <View style={[styles.distributionStatusCard, { borderColor: `${color}55` }]}>
    <Feather name={watermarkIcon} size={Rs(52)} color={color} style={styles.watermarkIcon} />
    <View style={styles.distributionCardTop}>
      <View style={styles.distributionIconCircle}>
        <Feather name={icon} size={Rs(17)} color={color} />
      </View>
      <View style={[styles.percentBadge, { backgroundColor: `${color}16` }]}>
        <Text style={[styles.percentBadgeText, { color }]}>{percent}%</Text>
      </View>
    </View>
    <Text style={styles.distributionCardLabel}>{label}</Text>
    <Text style={[styles.distributionCardValue, { color }]}>{value}</Text>
  </View>
);

const createChartPaths = (weeks: WeeklyCard[]) => {
  const maxAmount = Math.max(...weeks.map((week) => week.amount), 1);
  const left = 20;
  const right = CHART_WIDTH - 20;
  const top = 20;
  const bottom = CHART_HEIGHT - 32;
  const gap = (right - left) / Math.max(weeks.length - 1, 1);
  const points = weeks.map((week, index) => {
    const x = left + index * gap;
    const y = bottom - (week.amount / maxAmount) * (bottom - top);

    return { x, y };
  });
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? right} ${bottom} L ${left} ${bottom} Z`;

  return { areaPath, bottom, linePath, points };
};

const WeeklyTrendChart = ({ weeks }: { weeks: WeeklyCard[] }) => {
  const { areaPath, bottom, linePath, points } = createChartPaths(weeks);

  return (
    <View style={styles.weekChartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Évolution des revenus</Text>
        <Text style={styles.chartSubtitle}>S1 - S2 - S3 - S4 - S5</Text>
      </View>
      <Svg width="100%" height={Rs(CHART_HEIGHT)} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        {[1, 2, 3].map((line) => (
          <Line
            key={line}
            x1="20"
            x2={CHART_WIDTH - 20}
            y1={20 + line * 24}
            y2={20 + line * 24}
            stroke="#EFE5D3"
            strokeWidth="1"
          />
        ))}
        <Path d={areaPath} fill="#FFF4DB" opacity={0.75} />
        <Path d={linePath} fill="none" stroke={GOLD} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {points.map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r="4" fill={CARD} stroke={GOLD} strokeWidth="2" />
        ))}
        {weeks.map((week, index) => (
          <SvgText
            key={week.weekNumber}
            x={points[index]?.x ?? 20}
            y={bottom + 22}
            fill={week.isCurrent ? GOLD : MUTED}
            fontSize="11"
            fontWeight={week.isCurrent ? '800' : '600'}
            textAnchor="middle"
          >
            S{week.weekNumber}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

const WeeklyReportCard = ({ amount, count, isCurrent, weekNumber }: WeeklyCard) => (
  <View style={[styles.weekCard, isCurrent && styles.weekCardCurrent]}>
    <View style={styles.weekCardTop}>
      <Text style={[styles.weekTitle, isCurrent && styles.weekTitleCurrent]}>
        Semaine {weekNumber}
      </Text>
      {isCurrent && (
        <View style={styles.currentBadge}>
          <View style={styles.currentDot} />
          <Text style={styles.currentBadgeText}>Actuelle</Text>
        </View>
      )}
    </View>
    <Text style={[styles.weekAmount, isCurrent && styles.weekAmountCurrent]}>
      {formatXOF(amount)}
    </Text>
    <View style={styles.weekDivider} />
    <Text style={styles.weekOrders}>
      {count} commande{count > 1 ? 's' : ''}
    </Text>
  </View>
);

const WeeklySection = ({ weeks }: { weeks: WeeklyCard[] }) => {
  const scrollRef = useRef<ScrollView>(null);
  const activeIndex = Math.max(
    weeks.findIndex((week) => week.isCurrent),
    0,
  );

  useEffect(() => {
    const x = weeks.slice(0, activeIndex).reduce((offset, week) => {
      return offset + (week.isCurrent ? WEEK_ACTIVE_CARD_WIDTH : WEEK_CARD_WIDTH) + WEEK_CARD_GAP;
    }, 0);
    const activeWidth = weeks[activeIndex]?.isCurrent ? WEEK_ACTIVE_CARD_WIDTH : WEEK_CARD_WIDTH;
    const centeredOffset = Math.max(0, x - (SCREEN_W - Rs(32) - activeWidth) / 2);

    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: centeredOffset, animated: true });
    }, 250);

    return () => clearTimeout(timeout);
  }, [activeIndex, weeks]);

  return (
    <View style={styles.weekSectionCard}>
      <PatternCorner />
      <View style={styles.weekPatternBottom}>
        <View style={styles.patternDiamond} />
        <View style={[styles.patternDiamond, styles.patternDiamondSmall]} />
      </View>
      <Feather name="tool" size={Rs(116)} color={GOLD} style={styles.weekWatermark} />
      <View style={styles.weekSectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Bilan hebdomadaire</Text>
          <Text style={styles.weekSectionSubtitle}>
            Suivi de l&apos;activité sur les {weeks.length} semaines du mois
          </Text>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekScrollerContent}
      >
        {weeks.map((week) => (
          <WeeklyReportCard key={week.weekNumber} {...week} />
        ))}
      </ScrollView>
      {/* <WeeklyTrendChart weeks={weeks} /> */}
    </View>
  );
};

export default function Page() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const monthSheetRef = useRef<BottomSheetModal>(null);
  const yearSheetRef = useRef<BottomSheetModal>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { user } = useUserStore();
  const yearOptions = useMemo(() => createYearOptions(currentYear), [currentYear]);

  const { data: stat, isLoading, error, refetch } = useQuery<IStats, Error>({
    queryKey: [QueryKeys.orders.stats, selectedMonth, selectedYear],
    queryFn: async (): Promise<IStats> => {
      const response = await axios.post(`${baseURL}/stats/weekly`, {
        toklo_menid: user?.id,
        month: selectedMonth,
        year: selectedYear,
        status: 'DELIVERED',
      });

      return response.data;
    },
    enabled: Boolean(user?.id),
  });

  const summary = stat?.data?.summary;
  const metadata = stat?.data?.metadata;
  const displayYear = metadata?.year ?? selectedYear;
  const selectedMonthName = getMonthName(metadata?.month ?? selectedMonth);
  const currentWeekNumber = getCurrentWeekNumber(selectedMonth, displayYear);
  const totalStatusCount =
    (summary?.totalOngoingOrders ?? 0) +
    (summary?.totalDeliveredOrders ?? 0) +
    (summary?.totalFinishedOrders ?? 0) +
    (summary?.totalCancelledOrders ?? 0);

  const distributionItems = useMemo<DistributionItem[]>(() => {
    const total = totalStatusCount || summary?.totalOrders || 0;
    const toPercent = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

    return [
      {
        color: STATUS_COLORS.ongoing,
        icon: 'clock',
        label: 'En cours',
        percent: toPercent(summary?.totalOngoingOrders ?? 0),
        value: summary?.totalOngoingOrders ?? 0,
        watermarkIcon: 'tool',
      },
      {
        color: STATUS_COLORS.delivered,
        icon: 'package',
        label: 'Livrées',
        percent: toPercent(summary?.totalDeliveredOrders ?? 0),
        value: summary?.totalDeliveredOrders ?? 0,
        watermarkIcon: 'user',
      },
      {
        color: STATUS_COLORS.finished,
        icon: 'check-circle',
        label: 'Terminées',
        percent: toPercent(summary?.totalFinishedOrders ?? 0),
        value: summary?.totalFinishedOrders ?? 0,
        watermarkIcon: 'scissors',
      },
      {
        color: STATUS_COLORS.cancelled,
        icon: 'x-circle',
        label: 'Annulées',
        percent: toPercent(summary?.totalCancelledOrders ?? 0),
        value: summary?.totalCancelledOrders ?? 0,
        watermarkIcon: 'circle',
      },
    ];
  }, [summary, totalStatusCount]);

  const weeklyCards = useMemo<WeeklyCard[]>(() => {
    const weeklyData = stat?.data?.weekly ?? [];

    return Array.from({ length: 5 }, (_, index) => {
      const weekNumber = index + 1;
      const week = weeklyData.find((item) => item.weekNumber === weekNumber);

      return {
        amount: week?.amount ?? 0,
        count: week?.count ?? 0,
        isCurrent: weekNumber === currentWeekNumber,
        weekNumber,
      };
    });
  }, [currentWeekNumber, stat?.data?.weekly]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Impossible de charger les statistiques.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={GOLD} />}
      >
        <View style={styles.header}>
          <PatternCorner />
          <Text style={styles.headerTitle}>Statistiques</Text>
          <View style={styles.periodRow}>
             <TouchableOpacity
              activeOpacity={0.8}
              style={styles.periodButton}
              onPress={() => yearSheetRef.current?.present()}
            >
              <Text style={styles.periodText}>{displayYear}</Text>
              <Feather name="chevron-down" size={Rs(16)} color={GOLD} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.periodButton}
              onPress={() => monthSheetRef.current?.present()}
            >
              <Text style={styles.periodText}>
                {selectedMonthName}
              </Text>
              <Feather name="chevron-down" size={Rs(16)} color={GOLD} />
            </TouchableOpacity>
           
          </View>
        </View>

        <View style={styles.kpiRow}>
          <KpiCard
            icon="scissors"
            label="Revenu total"
            value={formatXOF(summary?.totalAmount ?? 0)}
          />
          <KpiCard
            icon="shopping-bag"
            label="Commandes"
            value={`${summary?.totalOrders ?? 0}`}
          />
          <KpiCard
            icon="clock"
            label="Montant en cours"
            value={formatXOF(summary?.totalOngoingAmount ?? 0)}
          />
        </View>

        <View style={styles.card}>
          <SectionTitle title="Suivi des commandes" />
          <View style={styles.statusGrid}>
            <StatusCard
              color={STATUS_COLORS.ongoing}
              icon="clock"
              label="En cours"
              showDivider
              value={summary?.totalOngoingOrders ?? 0}
            />
            <StatusCard
              color={STATUS_COLORS.delivered}
              icon="truck"
              label="Livrées"
              showDivider
              value={summary?.totalDeliveredOrders ?? 0}
            />
            <StatusCard
              color={STATUS_COLORS.finished}
              icon="check-circle"
              label="Terminées"
              showDivider
              value={summary?.totalFinishedOrders ?? 0}
            />
            <StatusCard
              color={STATUS_COLORS.cancelled}
              icon="x-circle"
              label="Annulées"
              value={summary?.totalCancelledOrders ?? 0}
            />
          </View>
        </View>

        {/* <View style={styles.card}>
          <PatternCorner />
          <DistributionHeader />
          <View style={styles.distributionGrid}>
            {distributionItems.map((item) => (
              <DistributionStatusCard key={item.label} {...item} />
            ))}
          </View>
        </View> */}

        <WeeklySection weeks={weeklyCards} />
      </ScrollView>

      <BottomSheetCompo bottomSheetModalRef={monthSheetRef} snapPoints={['75%']}>
        <View style={styles.monthSheet}>
          {months.map((month, index) => {
            const isActive = selectedMonth === index + 1;

            return (
              <AnimatedTouchableOpacity
                entering={FadeIn.delay(80 + index * 45).duration(350)}
                key={month}
                style={[styles.monthItem, isActive && styles.monthItemActive]}
                onPress={() => {
                  setSelectedMonth(index + 1);
                  monthSheetRef.current?.dismiss();
                }}
              >
                <Text style={[styles.monthText, isActive && styles.monthTextActive]}>
                  {month}
                </Text>
              </AnimatedTouchableOpacity>
            );
          })}
        </View>
      </BottomSheetCompo>

      <BottomSheetCompo bottomSheetModalRef={yearSheetRef} snapPoints={['45%']}>
        <View style={styles.monthSheet}>
          {yearOptions.map((year) => {
            const isActive = selectedYear === year;

            return (
              <AnimatedTouchableOpacity
                entering={FadeIn.delay(80).duration(350)}
                key={year}
                style={[styles.monthItem, isActive && styles.monthItemActive]}
                onPress={() => {
                  setSelectedYear(year);
                  yearSheetRef.current?.dismiss();
                }}
              >
                <Text style={[styles.monthText, isActive && styles.monthTextActive]}>
                  {year}
                </Text>
              </AnimatedTouchableOpacity>
            );
          })}
        </View>
      </BottomSheetCompo>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Rs(16),
    paddingBottom: Rs(28),
  },
  header: {
    paddingTop: Rs(18),
    paddingBottom: Rs(20),
    position: 'relative',
    gap: 10
  },
  headerTitle: {
    color: INK,
    fontSize: Rs(25),
    fontWeight: '800',
    letterSpacing: 0,
  },
  periodButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Rs(4),
    marginTop: Rs(8),
    paddingHorizontal: Rs(12),
    paddingVertical: Rs(7),
    borderRadius: Rs(18),
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent:'space-between',
    gap: Rs(8),
  },
  periodText: {
    color: GOLD,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: MUTED,
    fontSize: SIZES.xs,
    marginTop: Rs(9),
  },
  patternCorner: {
    position: 'absolute',
    top: Rs(16),
    right: Rs(8),
    width: Rs(52),
    height: Rs(52),
    opacity: 0.18,
  },
  patternDiamond: {
    position: 'absolute',
    top: Rs(6),
    right: Rs(12),
    width: Rs(14),
    height: Rs(14),
    borderWidth: 1,
    borderColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
  patternDiamondSmall: {
    top: Rs(25),
    right: Rs(28),
    width: Rs(9),
    height: Rs(9),
  },
  patternLine: {
    position: 'absolute',
    top: Rs(39),
    right: Rs(8),
    width: Rs(34),
    height: 1,
    backgroundColor: GOLD,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Rs(8),
    marginBottom: Rs(14),
  },
  kpiCard: {
    flex: 1,
    minHeight: Rs(140),
    backgroundColor: CARD,
    borderRadius: Rs(8),
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: Rs(8),
    paddingVertical: Rs(15),
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(33, 26, 19, 0.06)',
    flexDirection: "column",
    alignItems: "center",
    gap: Rs(6)
  },
  kpiAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Rs(8),
    width: "130%"
  },
  iconCircle: {
    width: Rs(34),
    height: Rs(34),
    borderRadius: Rs(17),
    backgroundColor: BEIGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Rs(12),
  },
  kpiValue: {
    color: INK,
    fontSize: Rs(12),
    fontWeight: '800',
    letterSpacing: 0,
  },
  kpiLabel: {
    color: MUTED,
    fontSize: Rs(10),
    fontWeight: '600',
    marginTop: Rs(6),
    lineHeight: Rs(13),
  },
  card: {
    backgroundColor: CARD,
    borderRadius: Rs(10),
    borderWidth: 1,
    borderColor: BORDER,
    padding: Rs(14),
    marginBottom: Rs(14),
    boxShadow: '0px 4px 12px rgba(33, 26, 19, 0.05)',
    overflow: 'hidden',
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Rs(12),
  },
  sectionTitle: {
    color: INK,
    fontSize: SIZES.sm,
    fontWeight: '800',
  },
  sectionRule: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
    marginLeft: Rs(10),
  },
  statusGrid: {
    flexDirection: 'row',
    gap: Rs(0),
    justifyContent: "space-between"
  },
  statusCard: {
    flex: 1,
    minHeight: Rs(92),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Rs(6),
    position: 'relative',
  },
  statusDivider: {
    position: 'absolute',
    right: 0,
    top: Rs(14),
    bottom: Rs(14),
    width: 1,
    backgroundColor: '#F0E6D6',
  },
  statusIcon: {
    width: Rs(30),
    height: Rs(30),
    borderRadius: Rs(15),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Rs(6),
  },
  statusValue: {
    fontSize: Rs(18),
    fontWeight: '800',
  },
  statusLabel: {
    color: MUTED,
    fontSize: Rs(9),
    textAlign: 'center',
    marginTop: Rs(3),
  },
  distributionRow: {
    marginBottom: Rs(12),
  },
  distributionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Rs(7),
  },
  distributionLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionDot: {
    width: Rs(9),
    height: Rs(9),
    borderRadius: Rs(5),
    marginRight: Rs(7),
  },
  distributionLabel: {
    color: INK,
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  distributionValue: {
    color: MUTED,
    fontSize: Rs(10),
    fontWeight: '600',
  },
  distributionTrack: {
    height: Rs(7),
    borderRadius: Rs(6),
    backgroundColor: '#F4EFE7',
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: Rs(6),
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Rs(14),
  },
  distributionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionHeaderIcon: {
    width: Rs(30),
    height: Rs(30),
    borderRadius: Rs(15),
    backgroundColor: BEIGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Rs(8),
  },
  distributionHeaderRule: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
    marginLeft: Rs(10),
  },
  distributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Rs(10),
  },
  distributionStatusCard: {
    width: '48%',
    minHeight: Rs(116),
    borderRadius: Rs(16),
    borderWidth: 1,
    backgroundColor: '#FFFEFB',
    padding: Rs(12),
    overflow: 'hidden',
    position: 'relative',
  },
  distributionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Rs(12),
  },
  distributionIconCircle: {
    width: Rs(34),
    height: Rs(34),
    borderRadius: Rs(17),
    backgroundColor: BEIGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentBadge: {
    borderRadius: Rs(14),
    paddingHorizontal: Rs(8),
    paddingVertical: Rs(4),
  },
  percentBadgeText: {
    fontSize: Rs(10),
    fontWeight: '800',
  },
  distributionCardLabel: {
    color: MUTED,
    fontSize: SIZES.xs,
    fontWeight: '700',
    marginBottom: Rs(5),
  },
  distributionCardValue: {
    fontSize: Rs(24),
    fontWeight: '800',
    letterSpacing: 0,
  },
  watermarkIcon: {
    position: 'absolute',
    right: Rs(-8),
    bottom: Rs(-10),
    opacity: 0.08,
  },
  weekSectionCard: {
    backgroundColor: CARD,
    borderRadius: Rs(10),
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: Rs(15),
    marginBottom: Rs(14),
    boxShadow: '0px 4px 12px rgba(33, 26, 19, 0.05)',
    overflow: 'hidden',
    position: 'relative',
  },
  weekSectionHeader: {
    paddingHorizontal: Rs(14),
    marginBottom: Rs(12),
    zIndex: 2,
  },
  weekSectionSubtitle: {
    color: MUTED,
    fontSize: Rs(10),
    fontWeight: '600',
    marginTop: Rs(4),
  },
  weekScrollerContent: {
    paddingHorizontal: Rs(14),
    gap: WEEK_CARD_GAP,
    paddingTop: Rs(18),
    paddingBottom: Rs(14),
  },
  weekCard: {
    width: WEEK_CARD_WIDTH,
    minHeight: Rs(112),
    borderRadius: Rs(18),
    backgroundColor: '#FFFEFB',
    borderWidth: 1,
    borderColor: '#F0E6D6',
    padding: Rs(10),
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'visible',
  },
  weekCardCurrent: {
    width: WEEK_ACTIVE_CARD_WIDTH,
    minHeight: Rs(124),
    backgroundColor: '#FFF8E9',
    borderColor: GOLD,
    boxShadow: '0px 6px 14px rgba(216, 160, 50, 0.16)',
  },
  weekCardTop: {
    alignItems: 'flex-start',
    gap: Rs(8),
  },
  weekTitle: {
    color: INK,
    fontSize: SIZES.sm,
    fontWeight: '800',
  },
  weekTitleCurrent: {
    color: GOLD,
  },
  weekOrders: {
    color: MUTED,
    fontSize: Rs(9),
    fontWeight: '700',
  },
  weekAmount: {
    color: INK,
    fontSize: Rs(11),
    fontWeight: '800',
    letterSpacing: 0,
  },
  weekAmountCurrent: {
    fontSize: Rs(12),
    color: INK,
  },
  weekDivider: {
    width: '100%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#EFE5D3',
    marginVertical: Rs(6),
  },
  currentBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: -Rs(18),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Rs(14),
    backgroundColor: '#F6E4B9',
    paddingHorizontal: Rs(6),
    paddingVertical: Rs(4),
    zIndex: 100,
  },
  currentDot: {
    width: Rs(5),
    height: Rs(5),
    borderRadius: Rs(3),
    backgroundColor: GOLD,
    marginRight: Rs(5),
  },
  currentBadgeText: {
    color: GOLD,
    fontSize: Rs(8),
    fontWeight: '800',
  },
  weekChartCard: {
    marginHorizontal: Rs(14),
    borderRadius: Rs(18),
    borderWidth: 1,
    borderColor: '#F0E6D6',
    backgroundColor: '#FFFDF8',
    paddingTop: Rs(12),
    overflow: 'hidden',
    zIndex: 2,
  },
  chartHeader: {
    paddingHorizontal: Rs(12),
    marginBottom: Rs(4),
  },
  chartTitle: {
    color: INK,
    fontSize: SIZES.xs,
    fontWeight: '800',
  },
  chartSubtitle: {
    color: MUTED,
    fontSize: Rs(9),
    fontWeight: '600',
    marginTop: Rs(2),
  },
  weekWatermark: {
    position: 'absolute',
    right: Rs(8),
    top: Rs(70),
    opacity: 0.06,
  },
  weekPatternBottom: {
    position: 'absolute',
    right: Rs(10),
    bottom: Rs(10),
    width: Rs(42),
    height: Rs(42),
    opacity: 0.16,
    transform: [{ rotate: '180deg' }],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Rs(24),
  },
  errorText: {
    color: Colors.app.error,
    fontSize: SIZES.sm,
    textAlign: 'center',
    marginBottom: Rs(14),
  },
  retryButton: {
    backgroundColor: GOLD,
    paddingHorizontal: Rs(18),
    paddingVertical: Rs(10),
    borderRadius: Rs(18),
  },
  retryButtonText: {
    color: CARD,
    fontWeight: '800',
  },
  monthSheet: {
    padding: Rs(20),
    gap: Rs(8),
  },
  monthItem: {
    paddingVertical: Rs(12),
    borderRadius: Rs(14),
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  monthItemActive: {
    borderColor: GOLD,
    backgroundColor: '#FFF8E9',
  },
  monthText: {
    color: MUTED,
    fontSize: SIZES.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  monthTextActive: {
    color: GOLD,
  },
});
