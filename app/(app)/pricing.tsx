import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  AntDesign 
} from '@expo/vector-icons';
import SubscriptionCompo from '@/components/SubscriptionCompo';

const Page = () => {
  const renderPriceCard = (
    title, 
    color, 
    pages, 
    words, 
    price, 
    deliveryDays, 
    urgency
  ) => {
    return (
      <View style={[styles.card, { backgroundColor: color }]}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.packageInfo}>{pages} Pages / {words} Words</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="currency-inr" size={18} color="#333" />
            <Text style={styles.detailLabel}>Price (INR)</Text>
            <Text style={styles.detailValue}>{price}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <AntDesign name="clockcircle" size={16} color="#333" />
            <Text style={styles.detailLabel}>Delivery Time</Text>
            <Text style={styles.detailValue}>{deliveryDays} Days</Text>
          </View>
          
          <View style={styles.detailItem}>
            <FontAwesome5 name="bolt" size={16} color="#333" />
            <Text style={styles.detailLabel}>Urgency</Text>
            <Text style={styles.detailValue}>{urgency} (+24hr)</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SubscriptionCompo redirectURL='pricing' />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  packageInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default Page;