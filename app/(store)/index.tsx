import React, { useState, useEffect, ReactNode, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons, MaterialIcons, Feather, FontAwesome6 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Link, useRouter } from 'expo-router';
import { useUserStore } from '@/stores/user';
import { IProduct, ProductCategoryCountMap } from '@/interfaces/type';
import { useQuery } from '@tanstack/react-query';
import { StoreKeys } from '@/interfaces/queries-key/store';
import axios from 'axios';
import { base, baseURL } from '@/util/axios';
import { formatXOF, Rs } from '@/util/comon';
import useLocation from '@/hooks/useLocation';
import BackButton from '@/components/form/BackButton';
import LoadingScreen from '@/components/Loading';


const { width } = Dimensions.get('window');

type CategoryItem = {
  id: number;
  name: string;
  icon: ReactNode;
  color: string;
  count?: number;
}

const Page = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const scrollY = useSharedValue(0);
  const searchFocused = useSharedValue(0);

  const {user} = useUserStore();
  const {address, getAddressFromCoordinates} = useLocation();

  useEffect(() => {
      const locationJson = JSON.parse(user?.location || '{}');
      
      if(locationJson?.x && locationJson?.y){
        getAddressFromCoordinates(locationJson?.x, locationJson?.y);
        
      }
      
    }, [user?.location]);

  const router = useRouter()
     
  
const { data, isLoading, error, refetch } = useQuery<IProduct[], Error>({
         queryKey: StoreKeys.product.all,
         queryFn: async (): Promise<IProduct[]> => {
          
           try {
             const resp = await axios.get(baseURL+"/product/by-user/"+ user?.id);
            
             return resp.data?.reverse(); 
           } catch (error) {
             console.error(error);
             throw new Error("Failed to fetch clients"); 
           }
         },
         enabled: !!user?.id
});
  
const { data: catData, isLoading: isLoadingCat, error: errorCat, refetch: refetchCat } = useQuery<ProductCategoryCountMap, Error>({
    queryKey: [StoreKeys.product.byCategory], 
    queryFn: async (): Promise<ProductCategoryCountMap> => {
      try {
        const resp = await axios.get(
          baseURL + "/product/by-category/" + user?.id
        );
        return resp.data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch product"); 
      }
    },
    enabled: !!user?.id, 
  });


  // Animations
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolate(
        scrollY.value,
        [0, 50],
        [1, 0.95],
        'clamp'
      ) === 1 ? '#fff' : 'rgba(255, 255, 255, 0.95)',
      shadowOpacity: interpolate(
        scrollY.value,
        [0, 50],
        [0, 0.1],
        'clamp'
      ),
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(searchFocused.value === 1 ? 1.02 : 1),
        },
      ],
    };
  });

  const categoryPressAnimation = useSharedValue(0);

  const handleCategoryPress = (category) => {
    categoryPressAnimation.value = withSpring(1, {}, () => {
      categoryPressAnimation.value = withSpring(0);
    });
    setSelectedCategory(category);
  };

  const categories: CategoryItem[] = [
  {
    id: 1,
    name: 'Pantalon',
    icon: <Ionicons name="body-outline" size={24} color="#fff" />,
    color: '#4F46E5',
    count: catData?.PANTS?._count
  },
  {
    id: 2,
    name: 'Robe',
    icon: <Ionicons name="woman-outline" size={24} color="#fff" />,
    color: '#EF4444',
    count: catData?.DRESS?._count
  },
  {
    id: 3,
    name: 'Chapeau',
    icon: <Ionicons name="umbrella-outline" size={24} color="#fff" />,
    color: '#8B5CF6'
  },
  {
    id: 4,
    name: 'Costume',
    icon: <Ionicons name="man-outline" size={24} color="#fff" />,
    color: '#EC4899',
    count: catData?.SUIT?._count
  },
  {
    id: 5,
    name: 'Jupe',
    icon: <FontAwesome6 name="person-dress" size={24} color="#ffffff" />,
    color: '#10B981',
    count: catData?.SHIRT?._count
  },
  {
    id: 6,
    name: 'Chemise',
    icon: <Ionicons name="shirt-outline" size={24} color="#fff" />,
    color: '#F59E0B',
    count: catData?.SHIRT?._count
  },
  {
    id: 7,
    name: 'Menteau',
    icon: <Ionicons name="bag-outline" size={24} color="#fff" />,
    color: '#06B6D4',
    count: catData?.JACKET?._count
  },
  {
    id: 8,
    name: 'Autre',
    icon: <Ionicons name="diamond-outline" size={24} color="#fff" />,
    color: '#84CC16',
    count: catData?.COAT?._count
  }
  ];

  const renderCategory = (category: CategoryItem, index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * 100,
        index * 100,
        (index + 1) * 100,
      ];
      
      return {
        transform: [
          {
            scale: withSpring(
              selectedCategory === category.name ? 1.1 : 1,
              { damping: 15, stiffness: 150 }
            ),
          },
        ],
      };
    });

    return (
      <Animated.View key={category.id} style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            { backgroundColor: category.color + '15' },
            selectedCategory === category.name && styles.selectedCategory
          ]}
          onPress={() => handleCategoryPress(category.name)}
        >
          <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
            {category.icon}
          </View>
          <Text style={styles.categoryText}> {category.count} </Text>
          <Text style={styles.categoryText}>{category.name}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const RenderProduct = (product: IProduct) => {
    const cardScale = useSharedValue(1);
    
    const cardAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: cardScale.value }],
      };
    });

    const handlePressIn = () => {
      cardScale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      cardScale.value = withSpring(1);
    };

    return (
      <Animated.View key={product.id} style={[styles.productCard, cardAnimatedStyle]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPress={() => router.push({pathname: '/store-product/update-product', params: {id: product.id.toString()}})}
          onPressOut={handlePressOut}
          style={styles.productContent}
        >
         {product.isActiveReduction && (<View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.reduction}%</Text>
          </View>)}
          <Image source={{ uri: base+'uploads/'+ product.images[0] }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text numberOfLines={1} style={styles.productName}>{product.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatXOF(product.price)}</Text>
              {/* <Text style={styles.originalPrice}>${product.price}</Text> */}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // if (isLoading) {
  //   return (
  //     <LoadingScreen
  //       visible={isLoading}
  //       indicatorColor="#FFFFFF"
  //       indicatorSize={48}
  //       message=""
  //       animationType="slide"
  //     />
  //   );
  // }

  return (

      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Image source={{ uri: base+ 'uploads/'+ user?.store_logo }} style={{width: "100%", height: "100%"}} />
              </View>
              <Text numberOfLines={1} style={styles.brandName}> {user?.store_name} </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={24} color="#333" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <BackButton backAction={() => router.push("/(app)/(tab)")} icon={ <Feather name="arrow-left" size={24} color="#333" /> } />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>{address} </Text>
          </View>

          {/* Search Bar */}
          {/* <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
            <TouchableOpacity
              style={styles.searchBar}
              onPressIn={() => { searchFocused.value = 1; }}
              onPressOut={() => { searchFocused.value = 0; }}
            >
              <Feather name="search" size={20} color="#666" />
              <Text style={styles.searchPlaceholder}>Find you need...</Text>
            </TouchableOpacity>
          </Animated.View> */}
        </Animated.View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
          onScroll={(event) => {
            scrollY.value = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => renderCategory(category, index))}
            </View>
          </View>

          {/* Flash Sale Banner */}
          <View style={styles.flashSaleContainer}>
            <View style={styles.flashSaleBanner}>
              <View style={styles.flashSaleContent}>
                <Text style={styles.flashSaleTitle}>Réduction sur toutes les commandes</Text>
                <Text style={styles.flashSaleSubtitle}> -15% à partir de 25 000 XOF</Text>
                <TouchableOpacity style={styles.flashSaleButton}>
                  <Text style={styles.flashSaleButtonText}>Voir </Text>
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop' }}
                style={styles.flashSaleImage}
              />
            </View>
          </View>

          {/* Flash Sale Products */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Derniers articles</Text>
              
              </View>
              <Link asChild href={{pathname: '/(store)/articles'}}>
                <Text style={styles.seeAllText}>Voir tous</Text>
              </Link>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScrollView}>
              {data?.slice(0, 4).map((product, index) => <RenderProduct key={index.toString()} {...product} />)}
            </ScrollView>
          </View>
        </ScrollView>

      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: Rs(32),
    height: Rs(32),
    borderRadius: 16,
    // backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - 48) / 4,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
    borderRadius: 12,
  },
  selectedCategory: {
    backgroundColor: '#4F46E5',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  flashSaleContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  flashSaleBanner: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flashSaleContent: {
    flex: 1,
  },
  flashSaleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  flashSaleSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
  },
  flashSaleButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  flashSaleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  flashSaleImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  seeAllText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  productsScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  productContent: {
    padding: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.app.reduction,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,

  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default Page;