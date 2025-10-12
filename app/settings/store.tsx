import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  TextInput,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const Page = () => {
  // State for store parameters
  const [parameters, setParameters] = useState({
    storeOpen: true,
    deliveryAvailable: true,
    pickupAvailable: true,
    operatingHours: '9:00 AM - 9:00 PM',
    minimumOrder: '10.00',
    deliveryRadius: '5',
    deliveryFee: '2.99',
    taxRate: '7.5',
    acceptCashPayments: true
  });

  // Handle toggle switches
  const toggleSwitch = (key) => {
    setParameters(prevParams => ({
      ...prevParams,
      [key]: !prevParams[key]
    }));
  };

  // Handle text input changes
  const handleInputChange = (key, value) => {
    setParameters(prevParams => ({
      ...prevParams,
      [key]: value
    }));
  };

  // Parameter sections with icons
  const sections = [
    {
      title: 'Store Status',
      icon: <MaterialCommunityIcons name="store" size={24} color="#3498db" />,
      items: [
        {
          key: 'storeOpen',
          label: 'Store Open',
          type: 'switch',
          icon: <Ionicons name="power" size={20} color="#9b59b6" />
        }
      ]
    },
    {
      title: 'Delivery Options',
      icon: <FontAwesome5 name="shipping-fast" size={20} color="#3498db" />,
      items: [
        {
          key: 'deliveryAvailable',
          label: 'Delivery Available',
          type: 'switch',
          icon: <MaterialCommunityIcons name="truck-delivery" size={20} color="#e74c3c" />
        },
        {
          key: 'deliveryRadius',
          label: 'Delivery Radius (km)',
          type: 'input',
          icon: <MaterialCommunityIcons name="map-marker-radius" size={20} color="#e74c3c" />,
          keyboardType: 'numeric'
        },
        {
          key: 'deliveryFee',
          label: 'Delivery Fee ($)',
          type: 'input',
          icon: <MaterialCommunityIcons name="cash" size={20} color="#e74c3c" />,
          keyboardType: 'decimal-pad'
        }
      ]
    },
    {
      title: 'Pickup Options',
      icon: <MaterialCommunityIcons name="shopping" size={24} color="#3498db" />,
      items: [
        {
          key: 'pickupAvailable',
          label: 'Pickup Available',
          type: 'switch',
          icon: <MaterialCommunityIcons name="shopping-outline" size={20} color="#2ecc71" />
        }
      ]
    },
    {
      title: 'Store Hours & Limits',
      icon: <Ionicons name="time" size={24} color="#3498db" />,
      items: [
        {
          key: 'operatingHours',
          label: 'Operating Hours',
          type: 'input',
          icon: <Ionicons name="time-outline" size={20} color="#f39c12" />
        },
        {
          key: 'minimumOrder',
          label: 'Minimum Order ($)',
          type: 'input',
          icon: <FontAwesome5 name="dollar-sign" size={18} color="#f39c12" />,
          keyboardType: 'decimal-pad'
        }
      ]
    },
    {
      title: 'Payment Settings',
      icon: <MaterialCommunityIcons name="credit-card" size={24} color="#3498db" />,
      items: [
        {
          key: 'taxRate',
          label: 'Sales Tax Rate (%)',
          type: 'input',
          icon: <FontAwesome5 name="percentage" size={16} color="#16a085" />,
          keyboardType: 'decimal-pad'
        },
        {
          key: 'acceptCashPayments',
          label: 'Accept Cash Payments',
          type: 'switch',
          icon: <MaterialCommunityIcons name="cash-multiple" size={20} color="#16a085" />
        }
      ]
    }
  ];

  // Render each parameter item
  const renderItem = (item) => {
    return (
      <View style={styles.itemContainer} key={item.key}>
        <View style={styles.labelContainer}>
          <View style={styles.iconContainer}>
            {item.icon}
          </View>
          <Text style={styles.itemLabel}>{item.label}</Text>
        </View>
        
        {item.type === 'switch' ? (
          <Switch
            trackColor={{ false: '#e0e0e0', true: '#bde0fe' }}
            thumbColor={parameters[item.key] ? '#3498db' : '#f5f5f5'}
            onValueChange={() => toggleSwitch(item.key)}
            value={parameters[item.key]}
          />
        ) : (
          <TextInput
            style={styles.input}
            value={parameters[item.key]}
            onChangeText={(text) => handleInputChange(item.key, text)}
            keyboardType={item.keyboardType || 'default'}
            placeholder={item.label}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Parameters</Text>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Store Preview Card */}
        <View style={styles.storePreviewCard}>
          <View style={styles.storeHeaderRow}>
            <View style={styles.storeIconContainer}>
              <MaterialCommunityIcons name="store" size={28} color="white" />
            </View>
            <View style={styles.storeInfoContainer}>
              <Text style={styles.storeName}>Your Store Name</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: parameters.storeOpen ? '#4cd137' : '#e84118' }]} />
                <Text style={styles.statusText}>{parameters.storeOpen ? 'Open' : 'Closed'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.storeDetailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#777" />
              <Text style={styles.detailText}>{parameters.operatingHours}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={16} color="#777" />
              <Text style={styles.detailText}>
                {parameters.deliveryAvailable ? `${parameters.deliveryRadius} km` : 'Not available'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="cash-multiple" size={16} color="#777" />
              <Text style={styles.detailText}>Min: ${parameters.minimumOrder}</Text>
            </View>
          </View>
        </View>

        {/* Parameter Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              {section.icon}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionBody}>
              {section.items.map(item => renderItem(item))}
            </View>
          </View>
        ))}
        
        {/* Save Button at Bottom */}
        <TouchableOpacity style={styles.bottomSaveButton}>
          <Text style={styles.bottomSaveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  storePreviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  storeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeInfoContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#555',
  },
  storeDetailsRow: {
    flexDirection: 'row',
    marginTop: 6,
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#555',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 15,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  sectionBody: {
    padding: 6,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    backgroundColor: '#f5f7fa',
    marginRight: 10,
  },
  itemLabel: {
    fontSize: 15,
    color: '#333',
  },
  input: {
    width: '40%',
    height: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'right',
    backgroundColor: '#fafafa',
  },
  bottomSaveButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Page;