import React, { Suspense, useRef, useState, useCallback } from 'react';
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
  Modal,
  Alert,
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
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import AddArticle from '@/components/store/AddArticle';
import { formatXOF, Rs, SIZES } from '@/util/comon';
import BottomSheetCompo from '@/components/BottomSheetCompo';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheetCompoForm from '@/components/BottomSheetCompoForm';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { IOrder, IProduct } from '@/interfaces/type';
import { StoreKeys } from '@/interfaces/queries-key/store';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import { base, baseURL } from '@/util/axios';
import { productCategories } from '@/utils';
import { Colors } from '@/constants/Colors';
import { FlashList } from '@shopify/flash-list';
import { geaCodingUrl } from './../../util/comon';
import { TrashIcon } from 'react-native-heroicons/solid';
import useDeleteProduct from '@/hooks/mutations/store/useDelete';
import FlatBtn from '@/components/FlatBtn';

const { width } = Dimensions.get('window');

const categoryLabels = {
  DRESS: 'Robe',
  PANTS: 'Pantalon',
  SHIRT: 'Chemise',
  SKIRT: 'Jupe',
  JACKET: 'Veste',
  COAT: 'Manteau',
  SUIT: 'Costume',
  OTHER: 'Autre',
};

const Page = () => {
  const [articles, setArticles] = useState([
    {
      id: 1,
      name: 'Slim Fit Jeans',
      category: 'Pants',
      price: 89.99,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop',
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Summer Dress',
      category: 'Dress',
      price: 159.99,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
      status: 'active',
      createdAt: '2024-01-14',
    },
    {
      id: 3,
      name: 'Baseball Cap',
      category: 'Hats',
      price: 29.99,
      stock: 0,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&h=200&fit=crop',
      status: 'out_of_stock',
      createdAt: '2024-01-13',
    },
    {
      id: 4,
      name: 'Business Blazer',
      category: 'Blazer',
      price: 299.99,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      status: 'active',
      createdAt: '2024-01-12',
    },
    {
      id: 5,
      name: 'Silk Tie',
      category: 'Ties',
      price: 45.99,
      stock: 18,
      image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=200&fit=crop',
      status: 'active',
      createdAt: '2024-01-11',
    },
    {
      id: 6,
      name: 'Leather Shoes',
      category: 'Shoes',
      price: 179.99,
      stock: 5,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
      status: 'low_stock',
      createdAt: '2024-01-10',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(productCategories[0].en);
  const [sortBy, setSortBy] = useState('name');

   const router = useRouter();
   const {user} = useUserStore();
   
   const {mutate, isPending} = useDeleteProduct()

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
   

  const scrollY = useSharedValue(0);
  const addButtonScale = useSharedValue(1);

  const categories = ['All', 'Pants', 'Dress', 'Hats', 'Blazer', 'Ties', 'Shoes', 'Bags', 'Jewelry'];

  // Filter and sort articles
  const filteredArticles = data?.filter(article => {
      const matchesSearch = article.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL'  || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'stock':
          return b.stock - a.stock;
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  // Animations
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 50],
            [0, -5],
            'clamp'
          ),
        },
      ],
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0.95],
        'clamp'
      ),
    };
  });

  const addButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: addButtonScale.value }],
    };
  });


  const handleDeleteArticle = (id: number) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet article?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            mutate(id, {
              onSuccess: () => {
                refetch()
              }
            })
          },
        },
      ]
    );
  };

  const getStatusColor = (status: number) => {
    if(status > 0){
      return '#10B981';
    }else {
      return '#EF4444';
    }

  };

  const getStatusText = (stock: number) => {
    if(stock > 0){
      return 'En stock';
    }else if(stock === 0){
      return 'Rupture';
    }
  };

  const keyExtractor = useCallback((item: IProduct) => item.id.toString(), []);
  

  const ReactenderArticleCard = ({article}:{article: IProduct}) => {
    const cardScale = useSharedValue(1);

    
    const cardAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: cardScale.value }],
      };
    });

    const handleCardPress = () => {
      cardScale.value = withSpring(0.98, {}, () => {
        cardScale.value = withSpring(1);
      });
    };

    return (
      <Animated.View key={article.id} style={[styles.articleCard, cardAnimatedStyle]}>

      {article.isActiveReduction &&
      ( <View style={styles.reduction}>
              <Text style={{color: "white", fontSize: SIZES.xs, fontWeight: 'bold'}}>-{article.reduction}</Text>
      </View> )
      }

        <TouchableOpacity onPress={handleCardPress} style={styles.cardContent}>
          <Image source={{ uri:base+'uploads/'+ article.images[0] }} style={styles.articleImage} />
          
          <View style={styles.articleInfo}>
            <Text style={styles.articleName} numberOfLines={2}>
              {article.name}
            </Text>
            <Text style={styles.articleCategory}>
              {categoryLabels[article?.category]}
            </Text>
            
            <View style={styles.priceStockContainer}>
              <Text style={styles.articlePrice}> {formatXOF(article.price)} </Text>
              <Text style={styles.articleStock}>Stock: {article.stock}</Text>
            </View>
            
            <Suspense fallback={<Text>Loading...</Text>}>

              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(article.stock) }]}>
                  <Text style={styles.statusText}>{getStatusText(article.stock)}</Text>
                </View>
              
              </View>
            </Suspense>
          </View>
          
          <View style={styles.articleActions}>
            <TouchableOpacity  style={styles.actionButton}>
              <Link asChild href={{pathname: '/store-product/update-product', params: {id: article.id.toString()}}}>
                <Ionicons name="create-outline" size={22} color="#4F46E5" />
              </Link>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteArticle(article.id)}
            >
              <TrashIcon size={22} color={Colors.app.error} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Mes Articles</Text>
          <Text style={styles.articleCount}>{filteredArticles?.length} article{filteredArticles && filteredArticles?.length > 1 ? 's': ''} </Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {productCategories.map(category => (
              <TouchableOpacity
                key={category.en}
                style={[
                  styles.filterChip,
                  selectedCategory === category.en && styles.filterChipSelected
                ]}
                onPress={() => setSelectedCategory(category.en)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === category.en && styles.filterChipTextSelected
                ]}>
                  {category.fr}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="filter-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </Animated.View>

       <FlashList
              data={filteredArticles}
              keyExtractor={keyExtractor}
              renderItem={({item}) => <ReactenderArticleCard  article={item} />}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{padding: Rs(16)}}
              onRefresh={refetch}
              refreshing={isLoading}
              ListEmptyComponent={() => (
                <View style={{ flex: 1, marginTop: Rs(100) , justifyContent: "center", alignItems: "center", }} >
                  <Text style={{ fontSize: SIZES.md, color: Colors.app.texteLight }}>Pas de produit trouvé</Text>
                </View>
              )}
              removeClippedSubviews={true} // Optimisation de performance
              estimatedItemSize={200}
            />

      {/* Add Button */}
      <FlatBtn action={() => router.push('/store-product')} />

      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reduction: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: Rs(-10),
    left: Rs(10),
    // padding: Rs(2),
    width: Rs(40),
    backgroundColor: Colors.app.reduction,
    borderRadius: Rs(3),
    zIndex: 100,
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: "700",
    color: "#333",
  },
  articleCount: {
    fontSize: 14,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.sm,
    color: "#333",
    marginLeft: 8,
  },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: "#4F46E5",
  },
  filterChipText: {
    fontSize: SIZES.xs,
    color: "#666",
    fontWeight: "500",
  },
  filterChipTextSelected: {
    color: "#fff",
  },
  sortButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  articlesContainer: {
    padding: 16,
  },
  articleCard: {
    backgroundColor: "#fff",
    borderRadius: Rs(12),
    marginBottom: Rs(18),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f5f5f5",
  },
  articleInfo: {
    flex: 1,
  },
  articleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  articleCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  priceStockContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  articlePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F46E5",
  },
  articleStock: {
    fontSize: 12,
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  articleDate: {
    fontSize: 10,
    color: "#999",
  },
  articleActions: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    padding: 8,
    marginBottom: 8,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    marginTop: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  categoryOptionSelected: {
    backgroundColor: "#4F46E5",
  },
  categoryOptionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryOptionTextSelected: {
    color: "#fff",
  },
});

export default Page;