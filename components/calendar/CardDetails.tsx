import { Colors } from '@/constants/Colors';
import { base } from '@/util/axios';
import { formatXOF, Rs, SCREEN_W, SIZES } from '@/util/comon';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BanknotesIcon, Bars2Icon, CalendarDaysIcon, CalendarIcon, ClockIcon, MinusCircleIcon, PhoneIcon, Square3Stack3DIcon, SunIcon, UserIcon } from 'react-native-heroicons/solid';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
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
  if (part === 'haut') {
    return (
      <Svg width={Rs(17)} height={Rs(17)} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8 4 4 7l3 4 2-1v10h6V10l2 1 3-4-4-3-2 2h-4L8 4Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (part === 'bas') {
    return (
      <Svg width={Rs(17)} height={Rs(17)} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8 4h8l1 16h-4l-1-8-1 8H7L8 4Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 4v8"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return <Square3Stack3DIcon fill={color} size={Rs(15)} />;
};

const TabButton = ({ title, isActive, onTabPress }:{title: string, isActive: string, onTabPress: () => void}) => (

  <TouchableOpacity onPress={onTabPress} style={[styles.tabButton, isActive === title && styles.activeTab]}>
    <Text style={[styles.tabText, isActive === title && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
);

const CardItem = ({ children }: { children: React.ReactNode }) => (


  <Animated.View entering={FadeInLeft} exiting={FadeOutRight} style={styles.cardItem}>
   
      {children}
    
  </Animated.View>
);
const PaymentInterface = ({clientfullname, clientphone, dresstype, tissu, fabric, quantity, mesure, price, paid, solde, date_remise,date_depot, deliveryHour}: TPaymentInterface) => {
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
          <TabButton title={tab} isActive={activeTab } onTabPress={() => onTabPress(tab)} key={index} />
        ))}
        
      </View>

      <ScrollView style={styles.cardList}>
       {activeTab === 'Détail' &&
        <View>
         <CardItem>

           <ItemChild label={clientfullname} icon={<UserIcon fill={Colors.app.primary} size={Rs(23)} />} />
           <ItemChild label={clientphone} icon={<PhoneIcon fill={Colors.app.primary} size={Rs(23)} />} />
         </CardItem>

         <CardItem>

           <ItemChild label={`Reception : `+ date_depot} icon={<CalendarDaysIcon fill={Colors.app.primary} size={Rs(23)} />} />
           <ItemChild label={`Livraison : `+ date_remise} icon={<CalendarIcon fill={Colors.app.primary} size={Rs(23)} />} />
           <ItemChild label={`Heure de livraison : ${deliveryHour}`} icon={<ClockIcon fill={Colors.app.primary} size={Rs(23)} />} />
         </CardItem>

         <CardItem>
           <ItemChild label={`Vêtement: ${dresstype}`} icon={<SunIcon fill={Colors.app.primary} size={Rs(23)} />} />
          
           <ItemChild label={`Quantité: ( ${quantity} )`} icon={<Square3Stack3DIcon fill={Colors.app.primary} size={Rs(23)} />} />
           <ItemChild label={`Total: ${formatXOF(Number(price) * Number(quantity))}`} icon={<BanknotesIcon fill={Colors.app.primary} size={Rs(23)} />} />
           <ItemChild label={`Prix unitaire: ${formatXOF(Number(price))}`} icon={<BanknotesIcon fill={Colors.app.primary} size={Rs(23)} />} />
           <ItemChild label={`Avance: ( ${formatXOF(Number(paid))} )`} icon={<MinusCircleIcon fill={Colors.app.primary} size={Rs(23)} />} />
           <ItemChild label={`Solde: ( ${formatXOF(Number(solde))} )`} icon={<Bars2Icon fill={Colors.app.primary} size={Rs(23)} />} />
         </CardItem>
        </View>
}
       {activeTab === 'Médias' && <CardItem>

          <Text>Tissu</Text>

             {tissu && 
                 <Image style={{width: SCREEN_W * 0.8 , aspectRatio: 1, alignSelf: "center", borderRadius: Rs(10)}}
                  source={{uri:base+"uploads/"+tissu}}  /> 
             }

         <Text>Modèle</Text>

         {fabric && 
             <Image style={{width: SCREEN_W * 0.8 , aspectRatio: 1, alignSelf: "center", borderRadius: Rs(10)}}
              source={{uri:base+"uploads/"+fabric}}  /> 
         }
          
        </CardItem>}

         {activeTab === 'Mesures' &&
          <CardItem>

           {hasMeasurePartTabs && (
             <View style={styles.measureTabs}>
               {measureSections.map((section) => {
                 const isActive = section.key === activeMeasureSection?.key;
                 const tabColor = isActive ? 'white' : Colors.app.texteLight;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: Rs(12),
    boxShadow: Colors.shadow.card
    
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
    borderBottomColor: '#000',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
  },
  activeTabText: {
    color: '#000',
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
    borderBottomColor: '#EEE',
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
    backgroundColor: Colors.app.secondary,
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
    backgroundColor: Colors.app.primary,
  },
  measureTabText: {
    color: Colors.app.texteLight,
    fontSize: SIZES.sm - 1,
    fontWeight: '600',
  },
  measureTabTextActive: {
    color: 'white',
  },
  measureEmptyText: {
    color: Colors.app.texteLight,
    fontSize: SIZES.sm,
    textAlign: 'center',
    paddingVertical: Rs(12),
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
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
    color: '#666',
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balance: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  cardCountBadge: {
    backgroundColor: '#8B0000',
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
    backgroundColor: '#FFF',
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
    color: '#666',
  },
  pointsAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#4A0404',
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
    color: '#666',
  },
});

export default PaymentInterface;
