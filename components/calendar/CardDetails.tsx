import { Colors } from '@/constants/Colors';
import { formatXOF, Rs, SCREEN_W } from '@/util/comon';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ItemChild from '../dress/ItemChild';
import { BanknotesIcon, Bars2Icon, CalendarDaysIcon, CalendarIcon, ClockIcon, MinusCircleIcon, PhoneIcon, ShieldCheckIcon, Square3Stack3DIcon, SunIcon, UserIcon } from 'react-native-heroicons/solid';
import { base } from '@/util/axios';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';
import { DisplayMeasure } from '../dress/DisplayMeasure';


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
 mesure: {};
 date_remise: Date;
 date_depot: Date;
 deliveryHour: string;

}

const TabButton = ({ title, isActive, onTabPress }:{title: string, isActive: string, onPress: () => void}) => (

  <TouchableOpacity onPress={onTabPress} style={[styles.tabButton, isActive === title && styles.activeTab]}>
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
);

const CardItem = ({ children }: { children: React.ReactNode }) => (


  <Animated.View entering={FadeInLeft} exiting={FadeOutRight} style={styles.cardItem}>
   
      {children}
    
  </Animated.View>
);
const PaymentInterface = ({clientfullname, clientphone, dresstype, tissu, fabric, quantity, mesure, price, paid, solde, date_remise,date_depot, deliveryHour}: TPaymentInterface) => {
 const [activeTab, setActiveTab] = useState('Détail');
 const tabs = ["Détail", "Médias", "Mesures"]

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

           {mesure && <View style={{flexDirection: "row", flexWrap: "wrap", gap: 3, justifyContent: "center"}} >
              {Object?.entries(mesure).map(([key, value]) => <DisplayMeasure value={value} title={key} key={key} />)}
                 
          </View>}
          
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