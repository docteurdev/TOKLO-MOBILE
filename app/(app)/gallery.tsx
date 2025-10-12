import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FullScreenImageView } from "@/components/gallery/FullScreenImg";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import BottomSheetCompo from "@/components/BottomSheetCompo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import UploadGallery from "@/components/gallery/UploadGallery";
import useGalery from "@/hooks/mutations/useGalery";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/interfaces/queries-key";
import { base, baseURL } from "@/util/axios";
import { useUserStore } from "@/stores/user";
import { ICatalogue, IOrder } from "@/interfaces/type";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import FullScreenImgScrolling from "@/components/gallery/FullScreenImgScrolling";
import { RefreshControl } from "react-native";
import useDeleteGalery from "@/hooks/mutations/useDeleteGalery";
import { Rs, SIZES } from "@/util/comon";

// Get device width for responsive layout
const { width } = Dimensions.get("window");
const itemWidth = (width - 32) / 2;

// Categories with Unsplash images
const categories = [
  {
    id: "1",
    name: "Graphic Design",
    icon: "pencil-ruler",
    image:
      "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=400&auto=format",
  },
  {
    id: "2",
    name: "Fine Arts",
    icon: "palette",
    image:
      "https://images.unsplash.com/photo-1578926288207-a90a5366759d?q=80&w=400&auto=format",
  },
  {
    id: "3",
    name: "Photography",
    icon: "camera",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format",
  },
  {
    id: "4",
    name: "Interior Design",
    icon: "sofa",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400&auto=format",
  },
  {
    id: "5",
    name: "Icon Design",
    icon: "shape",
    image:
      "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=400&auto=format",
  },
  {
    id: "6",
    name: "Street Art",
    icon: "spray",
    image:
      "https://images.unsplash.com/photo-1572887183090-2a3a87839b25?q=80&w=400&auto=format",
  },
  {
    id: "7",
    name: "UI/UX",
    icon: "monitor-cellphone",
    image:
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=400&auto=format",
  },
  {
    id: "8",
    name: "Typography",
    icon: "format-text",
    image:
      "https://images.unsplash.com/photo-1633774712923-c813e83a3d72?q=80&w=400&auto=format",
  },
];

export default function Page() {
  const [selectedItem, setSelectedItem] = useState<ICatalogue | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const scale = useSharedValue(1);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const { user } = useUserStore();
  const [visible, setVisible] = useState(false);

    const {mutate, isPending, isSuccess} = useDeleteGalery(() => setVisible(false));
  

  const { data, isLoading, error, refetch } = useQuery<ICatalogue[], Error>({
    queryKey: QueryKeys.gallery.all,
    queryFn: async (): Promise<ICatalogue[]> => {
      try {
        const resp = await axios.get(baseURL + "/catalogue/" + user?.id);

        return resp.data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients");
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const onImagePress = (item: ICatalogue) => {
    setSelectedItem(item);
    setShowFullScreen(true);
  };

  const handleDelete = () => {
    if(selectedItem?.id) mutate(selectedItem?.id);
  }
    

  const renderCategoryItem = ({ item }: { item: ICatalogue }) => (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.8}
      onPress={() =>{

         onImagePress(item);
         setVisible(true)
        }}
    >
      <Image
        source={{ uri: base + "uploads/" + item?.image }}
        style={styles.gridImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      {/* <View style={styles.textContainer}>
        <MaterialCommunityIcons 
          name={item.icon || "palette"} 
          size={24} 
          color="#fff" 
          style={styles.categoryIcon} 
        />
        <Text style={styles.categoryName}>{item?.name}</Text>
      </View> */}
    </TouchableOpacity>
  );

  const initialIndex = selectedItem 
  ? Math.max(0, data.findIndex(item => item.id === selectedItem.id))
  : 0;

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        {/* <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.time}> {data?.length} </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.signIn}>Sign In</Text>
          </View>
        </View> */}

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Catalogue</Text>
          <Text style={styles.subtitle}>
            🧵 Enregistrez ce modèle pour le retrouver facilement à tout moment
          </Text>
        </View>

        {/* Categories Grid using FlatList */}
        <FlatList
          data={data}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          refreshControl={ <RefreshControl refreshing={isLoading} onRefresh={refetch} /> }
           ListEmptyComponent={() => (
                    <View style={{ flex: 1, marginTop: Rs(100) , justifyContent: "center", alignItems: "center", }} >
                      <Text style={{ fontSize: SIZES.md, color: Colors.app.texteLight }}>Pas de modèle enregistré</Text>
                    </View>
                  )}
        />

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => {
              bottomSheetModalRef.current?.present();
            }}
            // activeOpacity={0.8}
            style={styles.button}
          >
            <View>
              <LinearGradient
                colors={[Colors.app.primary, "#5E50EE"]}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.saveButton}
              >
                {/* <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color="#333"
                /> */}
                <Text style={styles.buttonText}>Séléctionner</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>

        {/* Full Screen Image Modal */}
        {showFullScreen && selectedItem && (
          // <FullScreenImageView
          //   imageUri={selectedItem.image}
          //   onClose={handleCloseFullScreen}
          // />
          <FullScreenImgScrolling initialIndex={initialIndex} visible={visible} items={data} onDelete={() => handleDelete()} onSelect={() => {}} onClose={() => setVisible(false)} />
        )}
      </SafeAreaView>
      <BottomSheetCompo
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={["90%"]}
      >
        <UploadGallery
          closeBottomSheet={() => bottomSheetModalRef.current?.dismiss()}
        />
      </BottomSheetCompo>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#7367F0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  time: {
    fontWeight: "bold",
  },
  signIn: {
    color: "#0066CC",
    fontWeight: "500",
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  gridContainer: {
    paddingHorizontal: 12,
  },
  gridItem: {
    width: itemWidth,
    aspectRatio: 1.3,
    margin: 4,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 8,
  },
  textContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomContainer: {
    padding: 16,
    marginTop: "auto",
  },
  button: {
    // backgroundColor: Colors.app.primary,
    // paddingVertical: 14,
    // borderRadius: 8,
    // alignItems: "center",
    // justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
   
      color: 'white',
      fontSize: 16,
      fontWeight: '600',

  },
});
