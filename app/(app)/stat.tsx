// App.js
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolateColor,
  runOnJS,
  FadeIn
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { formatXOF, Rs, SIZES } from '@/util/comon';
import { baseURL } from '@/util/axios';
import axios from 'axios';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/interfaces/queries-key';
import { IStats } from '@/interfaces/type';
import { useUserStore } from '@/stores/user';
import LoadingScreen from '@/components/Loading';
import BottomSheetCompo from '@/components/BottomSheetCompo';
import { Colors } from '@/constants/Colors';
import { RefreshControl } from 'react-native';

// Colors and constants
const COLORS = {
  background: '#F5F8FF',
  card: '#FFFFFF',
  text: '#1A1D1F',
  textSecondary: '#6F767E',
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#F43F5E',
  purple: '#8B5CF6',
  lightGray: '#E6E8EC',
};

const STATUS_COLORS = {
  FINISHED: '#10B981',
  ONGOING: '#3B82F6',
  DELIVERED: '#8B5CF6',
  CANCELLED: '#F43F5E',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Helper functions
const formatCurrency = (value) => {
  return `$${value.toLocaleString('en-US')}`;
};

const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const getMonthName = (monthNumber) => {
  return months[monthNumber - 1];
};

// Animated Progress Bar Component
const AnimatedProgressBar = ({ progress, color, delay = 0 }) => {
  const width = useSharedValue(0);
  
  React.useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(progress, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, [progress]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value}%`,
      backgroundColor: color,
    };
  });
  
  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBar, animatedStyle]} />
    </View>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 1500, delay = 0 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const progress = useSharedValue(0);
  
  React.useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: duration,
        easing: Easing.out(Easing.exp),
      })
    );
  }, [value]);
  
  const updateDisplayValue = (p) => {
    setDisplayValue(Math.floor(p * value));
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    runOnJS(updateDisplayValue)(progress.value);
    return {};
  });
  
  return (
    <Animated.View style={animatedStyle}>
      <Text style={styles.counterText}>{prefix}{displayValue.toLocaleString()}{suffix}</Text>
    </Animated.View>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color, small = false }) => {
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  const cardStyle = [
    styles.card,
    small ? { flex: 1 } : { width: '100%' },
    { borderLeftWidth: 4, borderLeftColor: color }
  ];

  const containerStyle = [
    small ? { flex: 1, padding: 4 } : { width: '100%', marginBottom: 12 }
  ];
  
  return (
    <View style={containerStyle}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[cardStyle, animatedStyle]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <Feather name={icon} size={20} color={color} />
            </View>
          </View>
          <AnimatedCounter 
            value={value} 
            prefix={title.includes('Revenue') || title.includes('Value') || title.includes('Montant en cours') ? 'F CFA ' : ''} 
          />
        </Animated.View>
      </Pressable>
    </View>
  );
};

// Status Distribution Card
const StatusDistributionCard = ({ stat }) => {
  const summary = stat?.data.summary;
  const percentages = summary?.percentages || {
    finishedAmountPercent: "0",
    ongoingAmountPercent: "0",
    deliveredAmountPercent: "0",
    cancelledAmountPercent: "0"
  };
  
  const statuses = [
    { 
      label: 'En cours',
      percent: parseFloat(percentages.ongoingAmountPercent),
      count: summary.totalOngoingOrders,
      color: STATUS_COLORS.ONGOING,
      icon: 'clock'
    },
    { 
      label: 'Livrées',
      percent: parseFloat(percentages.deliveredAmountPercent),
      count: summary.totalDeliveredOrders,
      color: STATUS_COLORS.DELIVERED,
      icon: 'package'
    },
    { 
      label: 'Finies',
      percent: parseFloat(percentages.finishedAmountPercent),
      count: summary.totalFinishedOrders,
      color: STATUS_COLORS.FINISHED,
      icon: 'check-circle'
    },
    { 
      label: 'Annulées',
      percent: parseFloat(percentages.cancelledAmountPercent),
      count: summary.totalCancelledOrders,
      color: STATUS_COLORS.CANCELLED,
      icon: 'alert-circle'
    }
  ];
  
  return (
    <View style={styles.card}>
      <Text style={styles.cardHeaderText}>Suivi des commandes</Text>
      
      {statuses.map((status, index) => (
        <View key={index} style={styles.statusItem}>
          <View style={styles.statusHeader}>
            <View style={styles.statusLabelContainer}>
              <Feather name={status.icon} size={14} color={status.color} />
              <Text style={styles.statusLabel}>{status.label}</Text>
            </View>
            <View style={styles.statusCountContainer}>
              <Text style={[styles.statusPercent, { color: status.color }]}>
                {status.percent}%
              </Text>
              <Text style={styles.statusCount}>({status.count})</Text>
            </View>
          </View>
          <AnimatedProgressBar 
            progress={status.percent} 
            color={status.color}
            delay={index * 200}
          />
        </View>
      ))}
    </View>
  );
};

// Weekly Performance Card
const WeeklyPerformanceCard = ({ stat }) => {
  const weeklyData = stat?.data.weekly || [];
  const maxAmount = Math.max(...weeklyData.map(week => week.amount), 1); // Avoid division by zero
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Feather name="trending-up" size={20} color={COLORS.primary} />
        <Text style={[styles.cardHeaderText, { marginLeft: 8 }]}> Bilan de la semaine </Text>
      </View>
      
      {weeklyData.map((week, index) => {
        const heightPercent = (week.amount / maxAmount) * 100;
        
        return (
          <View key={index} style={styles.weekItem}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekLabel}>
                Semaine {week.weekNumber} ({week.weekStart} au {week.weekEnd})
              </Text>
            </View>
              <Text style={[styles.weekAmount, {marginBottom: Rs(10)}]}>{formatXOF(week.amount)}</Text>
            
            <AnimatedProgressBar 
              progress={heightPercent} 
              color={COLORS.primary}
              delay={index * 300}
            />
            
            <View style={styles.statusBadgeContainer}>
              {Object.entries(week.statusCounts).map(([status, count], i) => 
                count > 0 && (
                  <View 
                    key={i} 
                    style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] }]}
                  >
                    <Text style={styles.statusBadgeText}>{count}</Text>
                  </View>
                )
              )}
              <Text style={styles.orderCountText}>
                {week.count} Commande{week.count !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// Amount by status visualization card
const AmountByStatusCard = ({ stat }) => {
  const summary = stat?.data.summary;
  if (!summary) return null;
  
  const total = summary.totalAmount;
  
  // Filter out statuses with 0 amount
  const statusData = [
    { 
      status: 'En cours', 
      amount: summary.totalOngoingAmount, 
      percent: parseFloat(summary.percentages.ongoingAmountPercent),
      color: STATUS_COLORS.ONGOING
    },
    { 
      status: 'Livré', 
      amount: summary.totalDeliveredAmount, 
      percent: parseFloat(summary.percentages.deliveredAmountPercent),
      color: STATUS_COLORS.DELIVERED
    },
    { 
      status: 'Fini',
      amount: summary.totalFinishedAmount, 
      percent: parseFloat(summary.percentages.finishedAmountPercent),
      color: STATUS_COLORS.FINISHED
    },
    { 
      status: 'Annulé',
      amount: summary.totalCancelledAmount, 
      percent: parseFloat(summary.percentages.cancelledAmountPercent),
      color: STATUS_COLORS.CANCELLED
    }
  ].filter(item => item.amount > 0);
  
  // Generate animated segments
  const segments = statusData.map((item, index) => {
    const width = useSharedValue(0);
    
    React.useEffect(() => {
      width.value = withDelay(
        index * 150,
        withTiming(item.percent, {
          duration: 1000,
          easing: Easing.out(Easing.quad),
        })
      );
    }, [item.percent]);
    
    const animatedStyle = useAnimatedStyle(() => {
      return {
        width: `${width.value}%`,
        backgroundColor: item.color,
      };
    });
    
    return { ...item, animatedStyle };
  });
  
  return (
    <View style={styles.card}>
      <Text style={styles.cardHeaderText}> Répartition par statut </Text>
      
      <View style={styles.segmentedBarContainer}>
        {segments.map((segment, index) => (
          <Animated.View key={index} style={[styles.segment, segment.animatedStyle]} />
        ))}
      </View>
      
      <View style={styles.segmentLegendContainer}>
        {segments.map((item, index) => (
          <View key={index} style={styles.segmentLegendItem}>
            <View style={styles.segmentLegendLeftSection}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text style={styles.segmentLegendText}>{item.status}</Text>
            </View>
            <View style={styles.segmentLegendRightSection}>
              <Text style={styles.segmentAmountText}>{formatXOF(item.amount)}</Text>
              <Text style={[styles.segmentPercentText, { color: item.color }]}>
                {item.percent}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Performance summary card
const PerformanceSummaryCard = ({ stat }) => {
  const summary = stat?.data.summary;
  if (!summary) return null;
  
  const items = [
    {
      title: 'Chiffre d\'affaires ',
      value: formatXOF(summary.totalAmount),
      subtitle: `De ${summary.totalOrders} commandes`
    },
    {
      title: 'CA moyen',
      value: formatXOF(summary.totalOrders > 0 ? summary.totalAmount / summary.totalOrders : 0),
      subtitle: 'Par commande'
    },
    {
      title: 'En cours',
      value: summary.totalOngoingOrders,
      subtitle: `${summary.percentages.ongoingOrdersPercent}% of total`,
      color: STATUS_COLORS.ONGOING
    },
    {
      title: 'Livrées',
      value: summary.totalDeliveredOrders,
      subtitle: `Un total de ${summary.percentages.deliveredOrdersPercent}% `,
      color: STATUS_COLORS.DELIVERED
    }
  ];
  
  return (
    <View style={styles.card}>
      <Text style={styles.cardHeaderText}> Résumé des performances </Text>
      
      <View style={styles.summaryGrid}>
        {items.map((item, index) => {
          const opacity = useSharedValue(0);
          const translateY = useSharedValue(20);
          
          React.useEffect(() => {
            opacity.value = withDelay(
              index * 150,
              withTiming(1, { duration: 800 })
            );
            
            translateY.value = withDelay(
              index * 150,
              withTiming(0, { duration: 800 })
            );
          }, []);
          
          const animatedStyle = useAnimatedStyle(() => {
            return {
              opacity: opacity.value,
              transform: [{ translateY: translateY.value }],
            };
          });
          
          return (
            <Animated.View key={index} style={[styles.summaryItem, animatedStyle]}>
              <Text style={styles.summaryItemTitle}>{item.title}</Text>
              <Text style={[
                styles.summaryItemValue,
                item.color && { color: item.color }
              ]}>{item.value}</Text>
              <Text style={styles.summaryItemSubtitle}>{item.subtitle}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

// Main app component
export default function Page() {
  const [date, setDate] = useState(new Date());
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(date.getMonth()+1);
  const {user} = useUserStore();

  const { data: stat, isLoading, error, refetch } = useQuery<IStats, Error>({
    queryKey: [QueryKeys.orders.stats, selectedMonth, date.getFullYear()],
    queryFn: async (): Promise<IStats> => {
      // console.log("changing month", selectedMonth);
      const d = {
        toklo_menid: user?.id,
        month: selectedMonth,
        year: date.getFullYear(),
        status: "DELIVERED"
      };
      
      try {
        const resp = await axios.post(baseURL+"/stats/weekly", d);
        console.log("Weekly stats response:", resp.data);
        return resp.data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch stats");
      }
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    refetch();
  }, [selectedMonth, refetch]);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  
  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    translateY.value = withTiming(0, { duration: 1000 });
  }, []);
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  // Loading state
  if (isLoading) {
    return (
      <LoadingScreen 
      
       
      />
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.contentContainer, styles.errorContainer]}>
          <Text style={styles.errorText}>Failed to load statistics</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
       refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={styles.headerTitle}>Statistiques</Text>
          <TouchableOpacity onPress={() => bottomSheetModalRef.current?.present()}>

            <Text style={styles.headerSubtitle}>
              {getMonthName(stat?.data?.metadata?.month || selectedMonth)} {stat?.data?.metadata?.year || date.getFullYear()} 
              {stat?.data?.metadata?.totalWeeks ? ` • ${stat.data.metadata.totalWeeks} semaines` : ''}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Main KPIs */}
        <StatsCard 
          title="Total Revenu" 
          value={stat?.data?.summary?.totalAmount || 0} 
          icon="dollar-sign" 
          color={COLORS.primary}
        />
        
        <View style={styles.rowContainer}>
          <StatsCard 
            title="Total commandes" 
            value={stat?.data?.summary?.totalOrders || 0} 
            icon="package" 
            color={COLORS.purple}
            small
          />
          <StatsCard 
            title="Montant en cours"
            value={stat?.data?.summary?.totalOngoingAmount || 0} 
            icon="activity" 
            color={COLORS.warning}
            small
          />
        </View>
        
        {/* Status Distribution Card */}
        {stat && <StatusDistributionCard stat={stat} />}
        
        {/* Amount by Status Card */}
        {stat && <AmountByStatusCard stat={stat} />}
        
        {/* Weekly Performance Card */}
        {stat && <WeeklyPerformanceCard stat={stat} />}
        
        {/* Performance Summary Card */}
        {/* {stat && <PerformanceSummaryCard stat={stat} />} */}
      </ScrollView>

      <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={["90%"]} >
          
         <View style={{padding: Rs(20), gap: Rs(20)}} >

         {months?.map((month, index) => (
            <AnimatedTouchableOpacity
            entering={FadeIn.delay(100+ index * 100).duration(600)}
            key={index}
            style={styles.monthItem}
            onPress={() => {
              setSelectedMonth(index+1)
              bottomSheetModalRef.current?.dismiss()
            }}
          >
            <Text style={styles.monthText}>{month}</Text>
          </AnimatedTouchableOpacity>
              
          ))}

         </View>

      </BottomSheetCompo>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    marginBottom: 16,
  },
  monthItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthText: {
    fontSize: SIZES.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  header: {
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.app.primary,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.text,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 50,
  },
  counterText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  // Progress bar styles
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  // Status item styles
  statusItem: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  statusCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPercent: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  // Week item styles
  weekItem: {
    marginBottom: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: Rs(12),
    fontWeight: '500',
    color: COLORS.text,
  },
  weekAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderCountText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  // Segmented bar styles
  segmentedBarContainer: {
    height: 32,
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  segment: {
    height: '100%',
  },
  segmentLegendContainer: {
    marginTop: 8,
  },
  segmentLegendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  segmentLegendLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentLegendRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  segmentLegendText: {
    fontSize: 14,
    color: COLORS.text,
  },
  segmentAmountText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 12,
  },
  segmentPercentText: {
    fontSize: Rs(12),
    fontWeight: 'bold',
    width: Rs(60),
    textAlign: 'right',
  },
  // Summary grid styles
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  summaryItem: {
    width: '50%',
    padding: 6,
  },
  summaryItemInner: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 12,
  },
  summaryItemTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryItemSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});