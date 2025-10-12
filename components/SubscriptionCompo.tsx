import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar,
  Image,
  Dimensions
} from 'react-native';
import { 
  Ionicons, 
  MaterialIcons,
  MaterialCommunityIcons, 
  FontAwesome5,
  Feather,
  AntDesign
} from '@expo/vector-icons';
import BackButton from './form/BackButton';
import { useQueries, useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/interfaces/queries-key';
import axios from 'axios';
import { IClient, IPlan, ISubscription } from '@/interfaces/type';
import { baseURL } from '@/util/axios';
import { formatXOF, Rs } from '@/util/comon';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useUserStore } from '@/stores/user';
import PaymentLottieCompo from './PaymentLottieCompo';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingScreen from './Loading';

const { width } = Dimensions.get('window');

type TOut = {
  userId?: number,
  userLastname?: string,
  userFirstname?: string,
  phone?: string,
  adress?: string,
  planId?: number,
  planPrice?: string,
  nubm_order?: number,
  numb_catalog?: number,
  status?: boolean,
  notify_token?: string,
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const PlanBadge = ({ type }) => {
  const getBadgeStyle = () => {
    switch(type?.toLowerCase()) {
      case 'premium':
        return {
          colors: ['#FFD700', '#FFA500'],
          text: 'Premium',
          icon: 'crown'
        };
      case 'pro':
        return {
          colors: ['#614385', '#516395'],
          text: 'Pro',
          icon: 'star'
        };
      default:
        return {
          colors: ['#4CA1AF', '#2C3E50'],
          text: 'Basic',
          icon: 'check-circle'
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <LinearGradient
      colors={badge.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.badgeContainer}
    >
      <AntDesign name={badge.icon} size={12} color="#FFF" />
      <Text style={styles.badgeText}>{badge.text}</Text>
    </LinearGradient>
  );
};

const PlanCard = ({ plan, isSelected, onSelect }) => {
  return (
    <AnimatedTouchableOpacity 
      entering={FadeInDown.delay(200 + (plan?.id * 100)).springify()}
      style={[
        styles.planCard,
        isSelected && styles.selectedPlanCard
      ]}
      onPress={() => onSelect(plan)}
    >
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan?.name}</Text>
        <PlanBadge type={plan?.name} />
      </View>

      <Text style={styles.planPrice}>{formatXOF(Number(plan?.price))}</Text>
      
      <View style={styles.divider} />

      <View style={styles.featuresList}>
        {plan?.items.features?.map((feature, index) => {
          // Define icon based on the feature
          let IconComponent = MaterialCommunityIcons;
          let iconName = 'check-circle';
          let iconColor = '#4CAF50';

          // Customize icons based on features
          if (feature.includes('notification')) {
            IconComponent = Ionicons;
            iconName = 'notifications';
            iconColor = '#FFB84D';
          } else if (feature.includes('catalog')) {
            IconComponent = MaterialIcons;
            iconName = 'menu-book';
            iconColor = '#9C27B0';
          } else if (feature.includes('support')) {
            IconComponent = MaterialCommunityIcons;
            iconName = 'headset';
            iconColor = '#5C6BC0';
          } else if (feature.includes('commande')) {
            IconComponent = FontAwesome5;
            iconName = 'shipping-fast';
            iconColor = '#F06292';
          }

          return (
            <View key={index} style={styles.featureItem}>
              <IconComponent name={iconName} size={18} color={iconColor} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          );
        })}
      </View>

      {isSelected && (
        <View style={styles.selectedIndicator}>
          <AntDesign name="checkcircle" size={22} color="#FFF" />
        </View>
      )}
    </AnimatedTouchableOpacity>
  );
};

const SubscriptionCompo = ({redirectURL, closeBottomSheet}: {redirectURL: string, closeBottomSheet?: () => void}) => {
  const [result, setResult] = React.useState(null);
  const [outData, setOutData] = React.useState<TOut | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const { data, isLoading, error } = useQuery<IPlan[]>({
    queryKey: [QueryKeys.subscriptionType.all],
    queryFn: async (): Promise<IPlan[]> => {
      const response = await axios.get(`${baseURL}/subscriptionTypes`);
      return response.data as IPlan[];
    },
  });

  const {user, notify_token} = useUserStore();

  const { data: userSub, isLoading: userLogin, error: userError, refetch } = useQuery<ISubscription>({
    queryKey: [QueryKeys.tokloman.subscriptionType],
    queryFn: async (): Promise<ISubscription> => {
      const response = await axios.get(`${baseURL}/subscriptions/last/${user?.id}`);
      return response.data;
    },
    enabled: user?.id ? true : false,
  });

  const [selectedPlan, setSelectedPlan] = React.useState<IPlan | undefined>(undefined);
  
  useEffect(() => {
    setSelectedPlan(data?.[0]);
  }, [data]);

  useEffect(() => {
    // Register for the URL event listener
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Clean up
    return () => subscription.remove();
  }, []);

  function handleDeepLink(event) {
    console.log("Received deep link:", event.url);
    
    // Parse the URL to get the result data
    const { queryParams } = Linking.parse(event.url);
    
    if (queryParams && queryParams.result) {
      try {
        const resultData = JSON.parse(decodeURIComponent(queryParams?.result));

        if(resultData){
          refetch();
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
          }, 6000);

          setTimeout(() => {
            closeBottomSheet?.();
          }, 8000);
        }
      } catch (error) {
        console.error("Error parsing result data:", error);
      }
    }
  }

  // Open browser with the JSON data
  const openBrowserWithData = async (data: TOut) => {
    // Create your callback/redirect URL
    const redirectUrl = Linking.createURL(redirectURL);
    
    // Construct the URL with the data as query parameters
    const url = `https://cinetpay2.leyorodelimmo.com/?data=${encodeURIComponent(JSON.stringify(data))}&redirect=${encodeURIComponent(redirectUrl)}`;
    
    try {
      // Open the browser - using auth session for redirect handling
      const result = await WebBrowser.openAuthSessionAsync(
        url,
        redirectUrl
      );
      
      console.log('WebBrowser result:', result);
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
      planId: selectedPlan?.id,
      planPrice: selectedPlan?.price,
      nubm_order: userSub?.numb_order ?? 0,
      numb_catalog: userSub?.numb_catalog ?? 0,
      notify_token: notify_token,
    });
  };

  if(!data){
    return <LoadingScreen visible={true} backgroundColor="rgba(0, 0, 0, 0.7)" indicatorColor="#FFFFFF" indicatorSize={48} message="" />
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {showSuccess && <PaymentLottieCompo />}
      
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <Text style={styles.headerTitle}> {selectedPlan?.name} </Text>
        <Text style={styles.headerSubtitle}>{selectedPlan?.description}</Text>
      </Animated.View>
      
      {/* Plans List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.plansContainer}>
          {data && data.map((plan) => (
            <PlanCard 
              key={plan?.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan?.id}
              onSelect={setSelectedPlan}
            />
          ))}
        </View>
        
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Tous les plans incluent:</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="shield-check" size={22} color="#4CAF50" />
              <Text style={styles.benefitText}>Un paiment sécurisé</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="update" size={22} color="#2196F3" />
              <Text style={styles.benefitText}>Une sauvegarde régulière de vos données</Text>
            </View>
            {/* <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="credit-card-refund" size={22} color="#FF9800" />
              <Text style={styles.benefitText}>Money Back Guarantee</Text>
            </View> */}
          </View>
        </View>
      </ScrollView>
      
      {/* Subscribe Button */}
      <Animated.View entering={FadeInDown.delay(500)} style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.subscribeButton}
          onPress={handleSubscribe}
        >
          <LinearGradient
            colors={[Colors.app.primary, Colors.app.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.subscribeButtonText}>Souscrire  {formatXOF(Number(selectedPlan?.price))} </Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
        Les paiements seront effectués de manière sécurisée via <Text style={{color: Colors.app.available.unav_txt}}>CinetPay</Text>.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  plansContainer: {
    paddingVertical: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  selectedPlanCard: {
    borderColor: '#4481eb',
    borderWidth: 2,
    shadowColor: '#4481eb',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#555555',
    marginLeft: 10,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4481eb',
    borderRadius: 12,
    padding: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  benefitsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#555555',
    marginLeft: 10,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  subscribeButton: {
    overflow: 'hidden',
    borderRadius: 12,
    marginBottom: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
  }
});

export default SubscriptionCompo;