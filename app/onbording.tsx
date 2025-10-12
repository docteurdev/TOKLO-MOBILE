import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  Dimensions, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { 
  MaterialIcons, 
  FontAwesome5, 
  Ionicons, 
  MaterialCommunityIcons, 
  AntDesign 
} from '@expo/vector-icons';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Rs, SIZES } from '@/util/comon';
import { Colors } from '@/constants/Colors';
import BlowingBtn from '@/components/form/BlowingBtn';
import { Link } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Enregistrer les commandes',
    description: 'Enregistrez facilement les commandes et planifiez les rendez-vous selon le processus de confection sur mesure.',
    icon: <MaterialIcons name="event-available" size={120} color="#ff9999" />,
    gradientColors: ['transparent', '#ffcce6'],
    image: require("@/assets/onbording/order.png"),
  },
  {
    id: '2',
    title: 'Rappels de rendez-vous',
    description: "Recevez des rappels avant chaque rendez-vous pour éviter les conflits et mieux organiser vos séances de prise de mesures.",
    icon: <Ionicons name="notifications" size={120} color="#4da6ff" />,
    gradientColors: ['transparent', '#ccf2ff'],
    image:require("@/assets/onbording/notif.png"),
  },
  {
    id: '3',
    title: 'Catalogue ',
    description: 'Sauvegardez et gérez tous vos modèles de vêtements  dans un catalogue pratique.',
    icon: <FontAwesome5 name="book-open" size={120} color="#ff6699" />,
    gradientColors: ['transparent', '#ffe6ee'],
    image: require("@/assets/onbording/catalog.png"),
  },
  {
    id: '4',
    title: 'Les statistiques des activité',
    description: "Suivez et analysez les performances de votre entreprise grâce à des indicateurs clairs et faciles à comprendre.",
    icon: <MaterialCommunityIcons name="view-dashboard" size={120} color="#4d79ff" />,
    gradientColors: ['transparent', '#e6f0ff'],
    image: require("@/assets/onbording/dash.png"),
  },
  {
    id: '5',
    title: 'Boutique en ligne',
    description: 'Vendez vos vêtements sur mesure dans votre propre boutique en ligne personnalisée.',
    icon: <AntDesign name="shop" size={120} color="#ff9933" />,
    gradientColors: ['transparent', '#ffe6cc'],
    image: require("@/assets/onbording/store.png"),
  },
];

const Page = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const router = useRouter();

  const renderDot = (index) => {
    return (
      <View
        key={index}
        style={[
          styles.dot,
          { backgroundColor: index === currentIndex ? '#6a5acd' : '#ccc' },
        ]}
      />
    );
  };

  const handleSkip = () => {
    // Navigate to the main app
    console.log('Skip to main app');
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: currentIndex + 1,
      });
    } else {
      // Navigate to the main app
      router.push('/login');
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradientColors}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.image} />
          </View>
        </LinearGradient>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View> */}

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.footer}>
        <View style={styles.dotContainer}>
          {onboardingData.map((_, index) => renderDot(index))}
        </View>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleNext}
          >
          <Text style={styles.buttonText}>
         {currentIndex === onboardingData.length - 1 ? "Commencer" : "Suivant"}
          </Text>
          <MaterialIcons 
            name="arrow-forward" 
            size={22} 
            color="#fff" 
            style={styles.buttonIcon} 
          />
        </TouchableOpacity>
        <Link href={"/login"} style={{marginTop: Rs(50)}} asChild>
         <TouchableOpacity
          style={[styles.button, {backgroundColor: 'transparent', }]} 
         >

           <Text style={{color: Colors.app.primary, fontSize: SIZES.sm, fontWeight: "600", textAlign: "center"}}>Se connecter</Text>
         </TouchableOpacity>
        </Link>
        {/* <BlowingBtn isPending={false} handlePress={handleNext} label={currentIndex === onboardingData.length - 1 ? "Commencer" : "Suivant"}  /> */}

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientContainer: {
    height: Dimensions.get('window').height ,
    width: width,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 100
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
     height: width * 0.8,
     resizeMode: 'contain',
    
  },
  skipContainer: {
    position: 'absolute',
    top: Rs(20),
    right: Rs(20),
    zIndex: 1,
  },
  skipText: {
    fontSize: SIZES.sm,
    color: Colors.app.primary,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
  },
  textContainer: {
    paddingHorizontal: 30,
    marginTop: 40,
    // alignItems: 'center',
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.app.black,
    textAlign: 'left',
  },
  description: {
    fontSize: SIZES.md,
    color: '#666',
    textAlign: 'justify',
    lineHeight: 24,
  },
  footer: {
    padding: 40,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: Colors.app.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default Page;