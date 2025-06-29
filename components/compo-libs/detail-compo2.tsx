import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const HEADER_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 90;

// Sample data - in a real app this would come from props or context
const recommendationData = {
  id: '1',
  title: 'Sakura Japanese Restaurant',
  category: 'Restaurant',
  subcategory: 'Japanese • Sushi • Ramen',
  rating: 4.8,
  reviewCount: 423,
  priceRange: '$$',
  thumbnail: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d',
  images: [
    'https://images.unsplash.com/photo-1617196034183-421b4917c92d',
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
    'https://images.unsplash.com/photo-1611143669185-af224c5e3252',
  ],
  description: 'Authentic Japanese cuisine with an extensive menu featuring hand-crafted sushi, ramen, and traditional dishes. Our master chef brings 20 years of experience from Tokyo to create an unforgettable dining experience.',
  location: {
    address: '123 Cherry Blossom St',
    city: 'San Francisco, CA 94158',
    coordinates: { latitude: 37.76825, longitude: -122.4324 },
    openHours: 'Open today: 11:30 AM - 10:00 PM',
  },
  amenities: ['Outdoor Seating', 'Takeout', 'Delivery', 'Reservations', 'Wheelchair Accessible'],
  recommendedBy: {
    name: 'David Chen',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    relationship: 'Friend',
    note: 'The Dragon Roll here is absolutely amazing! Perfect place for date night or special occasions.',
  },
};

const page = ({ navigation }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT - 50, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${recommendationData.title}! ${recommendationData.description}`,
        url: `https://yourapp.com/recommendations/${recommendationData.id}`,
        title: `${recommendationData.title} • Recommended by ${recommendationData.recommendedBy.name}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const renderImageDots = () => {
    return (
      <View style={styles.imageDots}>
        {recommendationData.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === activeImageIndex ? '#ffffff' : 'rgba(255,255,255,0.5)' }
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Header with Image */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image
          source={{ uri: recommendationData.images[activeImageIndex] }}
          style={[styles.headerImage, { opacity: headerOpacity }]}
        />
        <View style={styles.imageOverlay} />
        
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          
          <Animated.View style={[styles.titleHeader, { opacity: titleOpacity }]}>
            <Text style={styles.headerTitle} numberOfLines={1}>{recommendationData.title}</Text>
          </Animated.View>
          
          <View style={styles.navBarRight}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#ff4757" : "#fff"} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Image Dots Indicator */}
        {renderImageDots()}
      </Animated.View>
      
      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <View>
            <Text style={styles.title}>{recommendationData.title}</Text>
            <Text style={styles.category}>{recommendationData.subcategory}</Text>
            
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <AntDesign
                    key={star}
                    name={star <= Math.floor(recommendationData.rating) ? "star" : star <= recommendationData.rating ? "staro" : "staro"}
                    size={16}
                    color={star <= recommendationData.rating ? "#FFD700" : "#D3D3D3"}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text style={styles.rating}>
                {recommendationData.rating} • {recommendationData.reviewCount} reviews • {recommendationData.priceRange}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call-outline" size={20} color="#4A6572" />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="navigate-outline" size={20} color="#4A6572" />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={20} color="#4A6572" />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recommended By Section */}
        <View style={styles.recommendedByContainer}>
          <View style={styles.recommendedByHeader}>
            <Text style={styles.sectionTitle}>Recommended By</Text>
            <TouchableOpacity>
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recommenderInfo}>
            <Image source={{ uri: recommendationData.recommendedBy.avatar }} style={styles.recommenderAvatar} />
            <View style={styles.recommenderDetails}>
              <Text style={styles.recommenderName}>{recommendationData.recommendedBy.name}</Text>
              <Text style={styles.recommenderRelation}>{recommendationData.recommendedBy.relationship}</Text>
              <Text style={styles.recommenderNote}>"{recommendationData.recommendedBy.note}"</Text>
            </View>
          </View>
        </View>
        
        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{recommendationData.description}</Text>
        </View>
        
        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Hours</Text>
          <View style={styles.locationContainer}>
            <View style={styles.addressContainer}>
              <MaterialIcons name="location-on" size={20} color="#4A6572" />
              <View style={styles.addressTextContainer}>
                <Text style={styles.address}>{recommendationData.location.address}</Text>
                <Text style={styles.city}>{recommendationData.location.city}</Text>
              </View>
            </View>
            <View style={styles.hoursContainer}>
              <Ionicons name="time-outline" size={20} color="#4A6572" />
              <Text style={styles.hours}>{recommendationData.location.openHours}</Text>
            </View>
          </View>
          
          {/* Map Preview (Placeholder) */}
          <View style={styles.mapPreview}>
            <Image 
              source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?center=${recommendationData.location.coordinates.latitude},${recommendationData.location.coordinates.longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${recommendationData.location.coordinates.latitude},${recommendationData.location.coordinates.longitude}&key=YOUR_API_KEY` }} 
              style={styles.mapImage} 
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.mapButton}>
              <Text style={styles.mapButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Amenities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {recommendationData.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <FontAwesome name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Similar Recommendations (Placeholder) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Similar Places</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarPlacesContainer}
          >
            {[1, 2, 3].map((item) => (
              <TouchableOpacity key={item} style={styles.similarPlaceCard}>
                <Image 
                  source={{ uri: `https://source.unsplash.com/random/300x200?restaurant&sig=${item}` }} 
                  style={styles.similarPlaceImage} 
                />
                <View style={styles.similarPlaceInfo}>
                  <Text style={styles.similarPlaceName}>Restaurant Name</Text>
                  <Text style={styles.similarPlaceCategory}>Japanese • $$</Text>
                  <View style={styles.similarPlaceRating}>
                    <AntDesign name="star" size={12} color="#FFD700" />
                    <Text style={styles.similarPlaceRatingText}>4.5</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="paper-plane" size={24} color="#fff" />
        <Text style={styles.fabText}>Send Recommendation</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    overflow: 'hidden',
    zIndex: 10,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: null,
    height: null,
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navBarRight: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT,
    paddingBottom: 20,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#4A6572',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f8f8f8',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4285F4',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  locationContainer: {
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  address: {
    fontSize: 15,
    color: '#333',
  },
  city: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hours: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  mapPreview: {
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4285F4',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
  },
  recommendedByContainer: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f8f8f8',
  },
  recommendedByHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewProfileText: {
    fontSize: 14,
    color: '#4285F4',
  },
  recommenderInfo: {
    flexDirection: 'row',
  },
  recommenderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  recommenderDetails: {
    flex: 1,
  },
  recommenderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recommenderRelation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  recommenderNote: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#444',
    lineHeight: 22,
  },
  similarPlacesContainer: {
    paddingVertical: 8,
  },
  similarPlaceCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  similarPlaceImage: {
    width: '100%',
    height: 100,
  },
  similarPlaceInfo: {
    padding: 10,
  },
  similarPlaceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  similarPlaceCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  similarPlaceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  similarPlaceRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4285F4',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default page;