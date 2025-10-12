import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  StatusBar,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  FadeIn,
  FadeInUp,
  SlideInRight,
  BounceIn
} from 'react-native-reanimated';
import { formatXOF, SIZES } from '@/util/comon';
import BackButton from '../form/BackButton';
import axios from 'axios';
import { baseURL } from '@/util/axios';
import { IProductOrder } from '@/interfaces/type';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StoreKeys } from '@/interfaces/queries-key/store';
import useUpdateOrder from '@/hooks/mutations/store/order/useUpdateOrder';

const { width: screenWidth } = Dimensions.get('window');

const OrderDetails = ({ orderId, onBack }:{orderId: number, onBack: () => void}) => {
  const [order, setOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Animated values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.8);
  const statusAnimation = useSharedValue(0);

    const { mutate, isPending } =useUpdateOrder();
  


    const { data, isLoading, error, refetch } = useQuery<IProductOrder, Error>({
      queryKey: StoreKeys.order.byId(orderId),
      queryFn: async (): Promise<IProductOrder> => {
        try {
          const resp = await axios.get(baseURL + "/order/orders/" + orderId);
          return resp.data;
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch order");
        }
      },
      enabled: !!orderId,
    });
  

  useEffect(() => {
    if (!isLoading && data) {
      // Trigger entrance animations
      fadeAnim.value = withTiming(1, { duration: 800 });
      slideAnim.value = withSpring(0);
      scaleAnim.value = withSpring(1);
      statusAnimation.value = withTiming(1, { duration: 1000 });
    }
  }, [isLoading, order]);


  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'DELIVERED': return '#10B981';
      case 'AVOIDED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'DELIVERED': return 'Livrée';
      case 'AVOIDED': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return 'time-outline';
      case 'DELIVERED': return 'gift-outline';
      case 'AVOIDED': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateOrderStatus = (newStatus: string) => {
    // Animate status change
    statusAnimation.value = withSpring(0, {}, () => {
      runOnJS(() => {
        setOrder(prevOrder => ({
          ...prevOrder,
          status: newStatus,
          trackingNumber: newStatus === 'shipped' ? 'FR' + Date.now() : prevOrder.trackingNumber
        }));
      })();
      statusAnimation.value = withSpring(1);
    });
  };

  const sendNotification = (type) => {
    Alert.alert(
      'Notification envoyée',
      `Le client a été notifié par email et SMS`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [
      { translateY: slideAnim.value },
      { scale: scaleAnim.value }
    ]
  }));

  const statusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statusAnimation.value,
    transform: [
      { scale: interpolate(statusAnimation.value, [0, 1], [0.8, 1]) }
    ]
  }));

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <Animated.View 
          style={[styles.loadingContainer]}
          entering={FadeIn.duration(500)}
        >
          <Animated.View 
            style={[styles.loadingSpinner]}
            entering={BounceIn.delay(200)}
          >
            <Ionicons name="refresh" size={32} color="#4F46E5" />
          </Animated.View>
          <Animated.Text 
            style={styles.loadingText}
            entering={FadeInUp.delay(400)}
          >
            Chargement des détails...
          </Animated.Text>
        </Animated.View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <Animated.View 
          style={styles.errorContainer}
          entering={FadeIn.duration(500)}
        >
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Commande introuvable</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrderDetails}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <Animated.View
        style={[styles.header]}
        entering={SlideInRight.duration(600)}
      >
        <BackButton
          backAction={onBack}
          icon={<Ionicons name="close" size={24} color="#4B5563" />}
        />
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Détail de la commande</Text>
          <Text style={styles.orderNumber}>{data?.orderNumber}</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
            colors={["#4F46E5"]}
          />
        }
      >
        <Animated.View style={containerAnimatedStyle}>
          {/* Status Card */}
          <Animated.View
            style={[styles.statusCard, statusAnimatedStyle]}
            entering={FadeInUp.delay(100)}
          >
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(data.status) },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(data.status)}
                  size={16}
                  color="#fff"
                  // style={styles.statusIcon}
                />
                <Text style={styles.statusText}>
                  {getStatusText(data.status)}
                </Text>
              </View>
              <Text style={styles.statusDate}>
                {formatDate(data.createdAt)}
              </Text>
            </View>

            {/* {data.status === "DELIVERED" &&  (
              <Animated.View 
                style={styles.trackingInfo}
                entering={FadeInUp.delay(200)}
              >
                <View style={styles.trackingHeader}>
                  <MaterialIcons name="local-shipping" size={16} color="#4F46E5" />
                  <Text style={styles.trackingLabel}>Numéro de suivi</Text>
                </View>
                <Text style={styles.trackingNumber}>{data.trackingNumber}</Text>
              </Animated.View>
            )} */}

            {/* {data.expectedDelivery && (
              <View style={styles.deliveryInfo}>
                <Feather name="calendar" size={16} color="#059669" />
                <Text style={styles.deliveryLabel}>Livraison prévue:</Text>
                <Text style={styles.deliveryDate}>{formatDate(data.expectedDelivery)}</Text>
              </View>
            )} */}
          </Animated.View>

          {/* Customer Info */}
          <Animated.View style={styles.section} entering={FadeInUp.delay(200)}>
            <Text style={styles.sectionTitle}>Informations client</Text>
            <View style={styles.customerCard}>
              {/* <Image source={{ uri: order.customer.avatar }} style={styles.customerAvatar} /> */}
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>
                  {data.customer.fullName}
                </Text>
                {/* <View style={styles.customerContact}>
                  <MaterialIcons name="email" size={16} color="#6B7280" />
                  <Text style={styles.customerContactText}>{data?.customer.phone}</Text>
                </View> */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <MaterialIcons name="phone" size={16} color="#6B7280" />
                  <Text style={{}}>{data?.customer.phone}</Text>
                </View>
              </View>
              <TouchableOpacity style={{}}>
                <Ionicons name="chatbubble-outline" size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Items List */}
          <Animated.View style={styles.section} entering={FadeInUp.delay(300)}>
            <Text style={styles.sectionTitle}>Articles commandés</Text>
            <View style={styles.itemsContainer}>
              {data.items.map((item, index) => (
                <Animated.View
                  key={index.toString()}
                  style={styles.itemCard}
                  entering={FadeInUp.delay(100 * (index + 1))}
                >
                  {/* <Image source={{ uri: item.image }} style={styles.itemImage} /> */}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.itemSpecs}>
                      {/* <View style={styles.itemSpec}>
                        <Text style={styles.itemSpecText}>Taille: {item.}</Text>
                      </View> */}
                      {/* <View style={styles.itemSpec}>
                        <Text style={styles.itemSpecText}>Couleur: {item.color}</Text>
                      </View> */}
                    </View>
                    <Text style={styles.itemQuantity}>
                      Quantité: {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    {formatXOF(item.price * item.quantity)}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Order Summary */}
          <Animated.View style={styles.section} entering={FadeInUp.delay(400)}>
            <Text style={styles.sectionTitle}>Résumé de la commande</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sous-total:</Text>
                <Text style={styles.summaryValue}>
                  {formatXOF(data?.total)}{" "}
                </Text>
              </View>
              {/* <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais de livraison:</Text>
                <Text style={styles.summaryValue}>{order.shippingCost.toFixed(2)} €</Text>
              </View> */}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRowTotal}>
                <Text style={styles.summaryLabelTotal}>Total:</Text>
                <Text style={styles.summaryValueTotal}>
                  {formatXOF(data?.total)}
                </Text>
              </View>
              {/* <View style={styles.paymentMethod}>
                <MaterialIcons name="payment" size={20} color="#4F46E5" />
                <Text style={styles.paymentLabel}>Paiement:</Text>
                <Text style={styles.paymentValue}>{order.paymentMethod}</Text>
              </View> */}
            </View>
          </Animated.View>

          {/* Addresses */}
          {/* <Animated.View 
            style={styles.section}
            entering={FadeInUp.delay(500)}
          >
            <Text style={styles.sectionTitle}>Adresses</Text>
            <View style={styles.addressCard}>
              <View style={styles.addressSection}>
                <View style={styles.addressHeader}>
                  <MaterialIcons name="local-shipping" size={18} color="#4F46E5" />
                  <Text style={styles.addressTitle}>Adresse de livraison</Text>
                </View>
                <Text style={styles.addressText}>
                  {order.shippingAddress.street}{'\n'}
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}{'\n'}
                  {order.shippingAddress.country}
                </Text>
              </View>
              <View style={styles.addressDivider} />
              <View style={styles.addressSection}>
                <View style={styles.addressHeader}>
                  <MaterialIcons name="receipt" size={18} color="#059669" />
                  <Text style={styles.addressTitle}>Adresse de facturation</Text>
                </View>
                <Text style={styles.addressText}>
                  {order.billingAddress.street}{'\n'}
                  {order.billingAddress.postalCode} {order.billingAddress.city}{'\n'}
                  {order.billingAddress.country}
                </Text>
              </View>
            </View>
          </Animated.View> */}

          {/* Notes */}
          {/* {order.notes && (
            <Animated.View 
              style={styles.section}
              entering={FadeInUp.delay(600)}
            >
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.notesCard}>
                <Feather name="message-circle" size={16} color="#6B7280" />
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            </Animated.View>
          )} */}

          {/* Actions */}
          <Animated.View style={styles.section} entering={FadeInUp.delay(700)}>
            <Text style={styles.sectionTitle}>Actions</Text>
              {data.status === "PENDING" && (
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deliverButton]}
                  onPress={() => {
                    Alert.alert(
                      "Confirmation",
                      "Êtes-vous sur de livrer cette commande ?",
                      [
                        { text: "Retour", style: "cancel" },
                        {
                          text: "Confirmez",
                          style: "destructive",
                          onPress: () => {
                            mutate(
                              { orderId: data.id, status: "DELIVERED" },
                              {
                                onSuccess: () => {
                                  refetch();
                                  queryClient.invalidateQueries({ queryKey: StoreKeys.order.all }); // Refetch orders list

                                },
                              }
                            );
                          },
                        },
                      ]
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="gift" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    Livrer la commande
                  </Text>
                </TouchableOpacity>
             

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  Alert.alert(
                    "Confirmation",
                    "Êtes-vous sur d'annuler cette commande ?",
                    [
                      { text: "Retour", style: "cancel" },
                      {
                        text: "Annulez",
                        style: "destructive",
                        onPress: () => {
                          mutate(
                            { orderId: data.id, status: "AVOIDED" },
                            {
                              onSuccess: () => {
                                refetch();
                                queryClient.invalidateQueries({ queryKey: StoreKeys.order.all }); // Refetch orders list
                                
                              },
                            }
                          );
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Annuler la commande</Text>
              </TouchableOpacity>
            </View>
             )}
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingSpinner: {
    fontSize: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorIcon: {
    fontSize: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    fontWeight: '600',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  },
  statusDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  trackingInfo: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  deliveryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  customerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  customerContact: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemsContainer: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  itemSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 4,
  },
  itemSpec: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    fontWeight: '600',
    fontSize: 16,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  shipButton: {
    backgroundColor: '#3B82F6',
  },
  deliverButton: {
    backgroundColor: '#059669',
  },
  notificationButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default OrderDetails;