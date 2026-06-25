import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { base } from '@/util/axios';
import { formatXOF, Rs, SCREEN_W, SIZES } from '@/util/comon';
import { formatHour } from '@/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BanknotesIcon, Bars2Icon, CalendarDaysIcon, CalendarIcon, ClockIcon, MinusCircleIcon, PhoneIcon, Square3Stack3DIcon, SunIcon, UserIcon } from 'react-native-heroicons/solid';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { DisplayMeasure } from '../dress/DisplayMeasure';
import ItemChild from '../dress/ItemChild';


type TPaymentInterface = {
 clientfullname: string; 
 quantity: string;
 price: string;
 paid: string;
 solde: string;
 clientphone: string;
 dresstype: string;
 tissu: string;
 fabric: string;
 mesure: unknown;
 date_remise: string | Date;
 date_depot: string | Date;
 deliveryHour: string;

}

type MeasureDisplayValue = {
  value: string;
  url?: string;
};

type MeasureSection = {
  key: string;
  label: string;
  values: Record<string, MeasureDisplayValue>;
};

const measurePartLabels: Record<string, string> = {
  haut: 'Haut',
  bas: 'Bas',
  complet: 'Complet',
};

const measurePartKeys: Record<string, string> = {
  haut: 'haut',
  bas: 'bas',
  complet: 'complet',
};

const splitMeasurePartOrder = ['haut', 'bas'];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const formatMeasureDisplayValue = (value: unknown): MeasureDisplayValue => {
  if (value === null || value === undefined) {
    return { value: '' };
  }

  if (isRecord(value) && 'value' in value) {
    const formattedValue = formatMeasureDisplayValue(value.value);
    const url = typeof value.url === 'string' ? value.url : undefined;

    return { ...formattedValue, url };
  }

  return {
    value: isRecord(value) ? JSON.stringify(value) : String(value),
  };
};

const parseMeasure = (measure: unknown) => {
  let parsedMeasure = measure;

  for (let index = 0; index < 2; index += 1) {
    if (typeof parsedMeasure !== 'string') {
      break;
    }

    try {
      parsedMeasure = JSON.parse(parsedMeasure);
    } catch {
      return {};
    }
  }

  return isRecord(parsedMeasure) ? parsedMeasure : {};
};

const normalizeMeasureSections = (measure: unknown): MeasureSection[] => {
  const parsedMeasure = parseMeasure(measure);
  const normalizedMeasure = Object.entries(parsedMeasure).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );

  const hasSplitMeasure =
    isRecord(normalizedMeasure.haut) || isRecord(normalizedMeasure.bas);

  if (hasSplitMeasure) {
    return splitMeasurePartOrder.map((part) => {
      const partValues = normalizedMeasure[part];

      return {
        key: part,
        label: measurePartLabels[part],
        values: isRecord(partValues)
          ? Object.entries(partValues).reduce<Record<string, MeasureDisplayValue>>(
              (acc, [key, value]) => {
                acc[key] = formatMeasureDisplayValue(value);
                return acc;
              },
              {},
            )
          : {},
      };
    });
  }

  const completValues = normalizedMeasure.complet;

  if (isRecord(completValues)) {
    return [
      {
        key: 'complet',
        label: measurePartLabels.complet,
        values: Object.entries(completValues).reduce<Record<string, MeasureDisplayValue>>(
          (acc, [key, value]) => {
            acc[key] = formatMeasureDisplayValue(value);
            return acc;
          },
          {},
        ),
      },
    ];
  }

  const flatGroupedValues = Object.entries(parsedMeasure).reduce<
    Record<string, Record<string, MeasureDisplayValue>>
  >((acc, [key, value]) => {
    const [partLabel, ...measureNameParts] = key.split(' - ');
    const partKey = measurePartKeys[partLabel?.toLowerCase()];

    if (!partKey) {
      return acc;
    }

    const measureName = measureNameParts.join(' - ') || key;
    acc[partKey] = {
      ...(acc[partKey] ?? {}),
      [measureName]: formatMeasureDisplayValue(value),
    };

    return acc;
  }, {});

  if (flatGroupedValues.haut || flatGroupedValues.bas) {
    return splitMeasurePartOrder.map((part) => ({
      key: part,
      label: measurePartLabels[part],
      values: flatGroupedValues[part] ?? {},
    }));
  }

  if (flatGroupedValues.complet) {
    return [
      {
        key: 'complet',
        label: measurePartLabels.complet,
        values: flatGroupedValues.complet,
      },
    ];
  }

  const flatValues = Object.entries(parsedMeasure).reduce<Record<string, MeasureDisplayValue>>(
    (acc, [key, value]) => {
      acc[key] = formatMeasureDisplayValue(value);
      return acc;
    },
    {},
  );

  return Object.keys(flatValues).length > 0
    ? [{ key: 'mesures', label: 'Mesures', values: flatValues }]
    : [];
};

const MeasurePartIcon = ({ part, color }: { part: string; color: string }) => {
  const size = Rs(22);
  const strokeWidth = 1.65;

  if (part === 'haut') {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <Path
          d="M11.4 5.5 5.7 9.3l3.7 6 3-1.7v12.1h7.2V13.6l3 1.7 3.7-6-5.7-3.8-2.8 2.8h-3.6l-2.8-2.8Z"
          fill={color}
          opacity={0.12}
        />
        <Path
          d="M11.4 5.5 5.7 9.3l3.7 6 3-1.7v12.1h7.2V13.6l3 1.7 3.7-6-5.7-3.8-2.8 2.8h-3.6l-2.8-2.8Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.5 8.6c.5 1 1.4 1.7 2.5 1.7s2-.7 2.5-1.7M12.4 17.7h7.2M12.4 21.3h7.2"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.8}
        />
        <Path
          d="M8.7 9.3c.9.9 1.8 1.6 2.7 2M23.3 9.3c-.9.9-1.8 1.6-2.7 2"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.55}
        />
      </Svg>
    );
  }

  if (part === 'bas') {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <Path
          d="M10.5 5.4h11L23.1 26h-5.4L16 15.8 14.3 26H8.9l1.6-20.6Z"
          fill={color}
          opacity={0.12}
        />
        <Path
          d="M10.5 5.4h11L23.1 26h-5.4L16 15.8 14.3 26H8.9l1.6-20.6Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M16 5.4v10.4M10.9 9h10.2M12.2 13.2h2.1M17.7 13.2h2.1"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.8}
        />
        <Circle cx={13.1} cy={7.1} r={0.75} fill={color} opacity={0.75} />
        <Circle cx={18.9} cy={7.1} r={0.75} fill={color} opacity={0.75} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 4.5 7.2 8.7 16 13l8.8-4.3L16 4.5Z"
        fill={color}
        opacity={0.14}
      />
      <Path
        d="M7.2 8.7 16 13l8.8-4.3M7.2 8.7V19.2L16 23.5l8.8-4.3V8.7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 13v10.5M10.2 15.1l3 1.4M21.8 15.1l-3 1.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.75}
      />
      <Path
        d="M10.7 25.7c2.8 1.4 7.8 1.4 10.6 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.55}
      />
    </Svg>
  );
};

const TabButton = ({
  title,
  isActive,
  onTabPress,
  styles,
}: {
  title: string;
  isActive: string;
  onTabPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) => (

  <TouchableOpacity onPress={onTabPress} style={[styles.tabButton, isActive === title && styles.activeTab]}>
    <Text style={[styles.tabText, isActive === title && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
);

const CardItem = ({
  children,
  styles,
}: {
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) => (


  <Animated.View entering={FadeInLeft} exiting={FadeOutRight} style={styles.cardItem}>
   
      {children}
    
  </Animated.View>
);
const PaymentInterface = ({clientfullname, clientphone, dresstype, tissu, fabric, quantity, mesure, price, paid, solde, date_remise,date_depot, deliveryHour}: TPaymentInterface) => {
 const theme = useAppTheme();
 const styles = useMemo(() => createStyles(theme), [theme]);
 const [activeTab, setActiveTab] = useState('Détail');
 const [activeMeasurePart, setActiveMeasurePart] = useState('');
 const tabs = ["Détail", "Médias", "Mesures"]
 const measureSections = useMemo(() => normalizeMeasureSections(mesure), [mesure]);
 const activeMeasureSection =
   measureSections.find((section) => section.key === activeMeasurePart) ??
   measureSections[0];
 const hasMeasurePartTabs = measureSections.length > 1;


 useEffect(() => {
   setActiveMeasurePart(measureSections[0]?.key ?? '');
 }, [measureSections]);

 const onTabPress = (tab: string) => {
   setActiveTab(tab)
 }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {tabs.map((tab, index) => (
          <TabButton title={tab} isActive={activeTab} onTabPress={() => onTabPress(tab)} styles={styles} key={index} />
        ))}
        
      </View>

      <ScrollView style={styles.cardList}>
       {activeTab === 'Détail' &&
        <View>
         <CardItem styles={styles}>

           <ItemChild label={clientfullname} icon={<UserIcon fill={theme.primary} size={Rs(23)} />} />
           <ItemChild label={clientphone} icon={<PhoneIcon fill={theme.primary} size={Rs(23)} />} />
         </CardItem>

         <CardItem styles={styles}>

           <ItemChild label={`Reception : `+ date_depot} icon={<CalendarDaysIcon fill={theme.primary} size={Rs(23)} />} />
           <ItemChild label={`Livraison : `+ date_remise} icon={<CalendarIcon fill={theme.primary} size={Rs(23)} />} />
           <ItemChild label={`Heure de livraison : ${formatHour(deliveryHour)}`} icon={<ClockIcon fill={theme.primary} size={Rs(23)} />} />
         </CardItem>

         <CardItem styles={styles}>
           <ItemChild label={`Vêtement: ${dresstype}`} icon={<SunIcon fill={theme.primary} size={Rs(23)} />} />
          
           <ItemChild label={`Quantité: ( ${quantity} )`} icon={<Square3Stack3DIcon fill={theme.primary} size={Rs(23)} />} />
           <ItemChild label={`Total: ${formatXOF(Number(price))}`} icon={<BanknotesIcon fill={theme.primary} size={Rs(23)} />} />
           <ItemChild label={`Prix unitaire: ${formatXOF(Number(price))}`} icon={<BanknotesIcon fill={theme.primary} size={Rs(23)} />} />
           <ItemChild label={`Avance: ( ${formatXOF(Number(paid))} )`} icon={<MinusCircleIcon fill={theme.primary} size={Rs(23)} />} />
           <ItemChild label={`Solde: ( ${formatXOF(Number(solde))} )`} icon={<Bars2Icon fill={theme.primary} size={Rs(23)} />} />
         </CardItem>
        </View>
}
       {activeTab === 'Médias' && <CardItem styles={styles}>

          <Text style={styles.mediaTitle}>Tissu</Text>

             {tissu ? (
                 <Image style={styles.mediaImage}
                  source={{uri:base+"uploads/"+tissu}}  /> 
             ) : (
               <Text style={styles.mediaEmptyText}>Aucune photo du tissu</Text>
             )}

         <Text style={styles.mediaTitle}>Modèle</Text>

         {fabric ? (
             <Image style={styles.mediaImage}
              source={{uri:base+"uploads/"+fabric}}  /> 
         ) : (
           <Text style={styles.mediaEmptyText}>Aucune photo du modèle</Text>
         )}
          
        </CardItem>}

         {activeTab === 'Mesures' &&
         <CardItem styles={styles}>

           {hasMeasurePartTabs && (
             <View style={styles.measureTabs}>
               {measureSections.map((section) => {
                 const isActive = section.key === activeMeasureSection?.key;
                 const tabColor = isActive ? '#FFFFFF' : theme.muted;

                 return (
                   <TouchableOpacity
                     key={section.key}
                     activeOpacity={0.85}
                     onPress={() => setActiveMeasurePart(section.key)}
                     style={[styles.measureTab, isActive && styles.measureTabActive]}
                   >
                     <MeasurePartIcon part={section.key} color={tabColor} />
                     <Text
                       style={[
                         styles.measureTabText,
                         isActive && styles.measureTabTextActive,
                       ]}
                     >
                       {section.label}
                     </Text>
                   </TouchableOpacity>
                 );
               })}
             </View>
           )}

           {activeMeasureSection && Object.keys(activeMeasureSection.values).length > 0 ? (
             <View style={styles.measureGrid} >
                {Object.entries(activeMeasureSection.values).map(([key, measure]) => (
                  <View style={styles.measureGridItem} key={key}>
                    <DisplayMeasure
                      image={measure.url}
                      value={measure.value}
                      title={key}
                    />
                  </View>
                ))}
            </View>
           ) : (
             <Text style={styles.measureEmptyText}>
               {activeMeasureSection
                 ? `Aucune mesure pour ${activeMeasureSection.label.toLowerCase()}`
                 : 'Aucune mesure enregistrée'}
             </Text>
           )}
          
         </CardItem> }
        
      </ScrollView>

      {/* <View style={styles.pointsSection}>
        <TouchableOpacity style={styles.pointsButton}>
          <View style={styles.pointsLeft}>
            <Text style={styles.pointsEmoji}>⚡</Text>
            <Text style={styles.pointsTitle}>Solde</Text>
            <Text style={styles.pointsSubtitle}>Use my points</Text>
          </View>
          
        </TouchableOpacity>
      </View> */}

      {/* <TouchableOpacity style={styles.payButton}>
        <Text style={styles.payButtonText}>Pay!</Text>
        <View style={styles.voiceRecognition}>
          <Text style={styles.voiceText}></Text>
          <View style={styles.voiceWaves}>
            <View style={[styles.wave, styles.wave1]} />
            <View style={[styles.wave, styles.wave2]} />
            <View style={[styles.wave, styles.wave3]} />
          </View>
        </View>
      </TouchableOpacity>

      <Text style={styles.bonusText}>And get ⭐ 200 more points!</Text> */}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    borderRadius: Rs(12),
    boxShadow: theme.background === '#FFFDF8'
      ? '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.06)'
      : '0px 5px 18px rgba(0, 0, 0, 0.28)',
    
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabText: {
    color: theme.muted,
    fontSize: 14,
  },
  activeTabText: {
    color: theme.text,
    fontWeight: '600',
  },
  cardList: {
    flex: 1,
  },
  cardItem: {
   // width: "50%",
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    gap: Rs(20),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  measureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: Rs(-4),
    rowGap: Rs(8),
  },
  measureGridItem: {
    width: "50%",
    paddingHorizontal: Rs(4),
  },
  measureTabs: {
    flexDirection: 'row',
    gap: Rs(8),
    backgroundColor: theme.primaryLight,
    borderRadius: Rs(8),
    padding: Rs(4),
  },
  measureTab: {
    flex: 1,
    height: Rs(38),
    borderRadius: Rs(6),
    flexDirection: 'row',
    gap: Rs(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  measureTabActive: {
    backgroundColor: theme.primary,
  },
  measureTabText: {
    color: theme.muted,
    fontSize: SIZES.sm - 1,
    fontWeight: '600',
  },
  measureTabTextActive: {
    color: 'white',
  },
  measureEmptyText: {
    color: theme.muted,
    fontSize: SIZES.sm,
    textAlign: 'center',
    paddingVertical: Rs(12),
  },
  mediaImage: {
    width: SCREEN_W * 0.8,
    aspectRatio: 1,
    alignSelf: "center",
    borderRadius: Rs(10),
  },
  mediaEmptyText: {
    color: theme.muted,
    fontSize: SIZES.sm,
    textAlign: 'center',
    paddingVertical: Rs(20),
    backgroundColor: theme.primaryLight,
    borderRadius: Rs(10),
  },
  mediaTitle: {
    color: theme.text,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  cardInfo: {
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.muted,
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balance: {
    fontSize: 14,
    color: theme.muted,
    marginRight: 8,
  },
  cardCountBadge: {
    backgroundColor: theme.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardCountText: {
    color: '#FFF',
    fontSize: 12,
  },
  pocketSection: {
    marginLeft: 20,
  },
  pointsSection: {
    marginVertical: 16,
  },
  pointsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
  },
  pointsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  pointsSubtitle: {
    fontSize: 14,
    color: theme.muted,
  },
  pointsAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: theme.primary,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  voiceRecognition: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceText: {
    color: '#FFF',
    fontSize: 14,
    marginRight: 8,
  },
  voiceWaves: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wave: {
    width: 3,
    height: 12,
    backgroundColor: '#FFF',
    marginHorizontal: 2,
    borderRadius: 1,
  },
  wave1: {
    height: 8,
  },
  wave2: {
    height: 16,
  },
  wave3: {
    height: 12,
  },
  bonusText: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.muted,
  },
});

export default PaymentInterface;
