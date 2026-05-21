import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Share,
  Animated
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const page = ({ navigation, route }) => {
  // You would normally pass recommendation data via route.params
  // Using mock data for this example
  const recommendation = {
    id: '1',
    title: 'Santorini Hideaway Resort',
    category: 'Resort & Spa',
    rating: 4.8,
    reviews: 243,
    price: '$249',
    priceUnit: 'per night',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2874&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2940&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496947850313-7743325fa58c?q=80&w=2940&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2940&auto=format&fit=crop',
    ],
    description: 'Perched on the edge of the caldera, this exclusive resort offers unparalleled views of the Aegean Sea. Enjoy private infinity pools, world-class dining, and personalized service in the heart of Santorini.',
    amenities: [
      'Private Pool', 'Sea View', 'Free Breakfast', 'Spa Access', 'Airport Transfer', 'WiFi'
    ],
    location: 'Oia, Santorini, Greece',
    coordinates: {
      latitude: 36.4618,
      longitude: 25.3760
    },
    isFavorite: false
  };

  const [isFavorite, setIsFavorite] = useState(recommendation.isFavorite);
  const [selectedImage, setSelectedImage] = useState(recommendation.image);
  const scrollY = new Animated.Value(0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [1.2, 1, 0.8],
    extrapolate: 'clamp'
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${recommendation.title} in ${recommendation.location}. It looks amazing!`,
        url: recommendation.image,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'Private Pool':
        return <MaterialIcons name="pool" size={18} color="#0066CC" />;
      case 'Sea View':
        return <MaterialIcons name="water" size={18} color="#0066CC" />;
      case 'Free Breakfast':
        return <Ionicons name="restaurant" size={18} color="#0066CC" />;
      case 'Spa Access':
        return <FontAwesome name="spa" size={16} color="#0066CC" />;
      case 'Airport Transfer':
        return <Ionicons name="car" size={18} color="#0066CC" />;
      case 'WiFi':
        return <Ionicons name="wifi" size={18} color="#0066CC" />;
      default:
        return <Ionicons name="checkmark-circle" size={18} color="#0066CC" />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{recommendation.title}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: selectedImage }}
            style={[styles.heroImage, { transform: [{ scale: imageScale }] }]}
            resizeMode="cover"
          />
          
          <TouchableOpacity style={styles.backButtonOverlay} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#FF3B30" : "#FFF"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#FFF" />
          </TouchableOpacity>

          <View
            // colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />
          
          <View style={styles.imageTitleContainer}>
            <Text style={styles.imageTitle}>{recommendation.title}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#FFF" />
              <Text style={styles.locationText}>{recommendation.location}</Text>
            </View>
          </View>
        </View>

        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
            <TouchableOpacity 
              style={[styles.galleryImageContainer, selectedImage === recommendation.image && styles.galleryImageSelected]}
              onPress={() => setSelectedImage(recommendation.image)}
            >
              <Image 
                source={{ uri: recommendation.image }} 
                style={styles.galleryImage} 
                resizeMode="cover"
              />
            </TouchableOpacity>
            
            {recommendation.gallery.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.galleryImageContainer, selectedImage === image && styles.galleryImageSelected]}
                onPress={() => setSelectedImage(image)}
              >
                <Image 
                  source={{ uri: image }} 
                  style={styles.galleryImage} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <View style={styles.categoryRatingRow}>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{recommendation.category}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{recommendation.rating}</Text>
              <Text style={styles.reviewCount}>({recommendation.reviews} reviews)</Text>
            </View>
          </View>

          <Text style={styles.price}>
            <Text style={styles.priceValue}>{recommendation.price}</Text>
            <Text style={styles.priceUnit}> {recommendation.priceUnit}</Text>
          </Text>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{recommendation.description}</Text>

          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {recommendation.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                {renderAmenityIcon(amenity)}
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color="#999" />
            <Text style={styles.mapText}>Map View</Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 40,
    zIndex: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  imageContainer: {
    width: width,
    height: height * 0.5,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: StatusBar.currentHeight || 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: StatusBar.currentHeight || 40,
    right: 64,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  shareButton: {
    position: 'absolute',
    top: StatusBar.currentHeight || 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    zIndex: 1,
  },
  imageTitleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  imageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 4,
  },
  galleryContainer: {
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  gallery: {
    paddingHorizontal: 16,
  },
  galleryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  galleryImageSelected: {
    borderColor: '#0066CC',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: '#EEF7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#777',
    marginLeft: 4,
  },
  price: {
    marginVertical: 12,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  priceUnit: {
    fontSize: 16,
    color: '#777',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  mapText: {
    color: '#999',
    marginTop: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default page;