import ActiveToklomanCompo from "@/components/ActiveToklomanCompo";
import BottomSheetCompo from "@/components/BottomSheetCompo";
import BackButton from "@/components/form/BackButton";
import CustomButton from "@/components/form/CustomButton";
import FullScreenImgScrolling from "@/components/gallery/FullScreenImgScrolling";
import UploadGallery from "@/components/gallery/UploadGallery";
import SubscriptionCompo from "@/components/SubscriptionCompo";
import { Colors } from "@/constants/Colors";
import useDeleteGalery from "@/hooks/mutations/useDeleteGalery";
import { QueryKeys } from "@/interfaces/queries-key";
import { ICatalogue } from "@/interfaces/type";
import { useUserStore } from "@/stores/user";
import { base, baseURL } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { XMarkIcon } from "react-native-heroicons/solid";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// Get device width for responsive layout
const { width } = Dimensions.get("window");
const itemWidth = (width - 32) / 2;


export default function Page() {
  const [selectedItem, setSelectedItem] = useState<ICatalogue | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const scale = useSharedValue(1);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const subscribeBottomSheet = useRef<BottomSheetModal>(null);
  const claimeActiveAccountBottomSheet = useRef<BottomSheetModal>(null);

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

  const openSubscribeBottomSheet = () => {
    bottomSheetModalRef.current?.dismiss();
    setTimeout(() => {
      subscribeBottomSheet.current?.present();
    }, 300);
  };

  const openClaimActiveAccountBottomSheet = () => {
    bottomSheetModalRef.current?.dismiss();
    setTimeout(() => {
      claimeActiveAccountBottomSheet.current?.present();
    }, 300);
  };
    

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
      <View style={styles.container}>
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
          {/* <Text style={styles.subtitle}>
            Enregistrez ce modèle pour le retrouver facilement à tout moment
          </Text> */}
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
          <CustomButton
           label="Séléctionner"
           disabled
           action={() => {
              bottomSheetModalRef.current?.present();
            }}
          />
         
        </View>

        {/* Full Screen Image Modal */}
        {showFullScreen && selectedItem && (
          // <FullScreenImageView
          //   imageUri={selectedItem.image}
          //   onClose={handleCloseFullScreen}
          // />
          <FullScreenImgScrolling initialIndex={initialIndex} visible={visible} items={data} onDelete={() => handleDelete()} onSelect={() => {}} onClose={() => setVisible(false)} />
        )}
      </View>
      <BottomSheetCompo
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={["90%"]}
      >
        <UploadGallery
          closeBottomSheet={() => bottomSheetModalRef.current?.dismiss()}
          subscribeBottomSheet={openSubscribeBottomSheet}
          claimActiveFreeTime={openClaimActiveAccountBottomSheet}
        />
      </BottomSheetCompo>

      <BottomSheetCompo
        bottomSheetModalRef={subscribeBottomSheet}
        snapPoints={["100%"]}
      >
        <View style={{ padding: Rs(20), gap: Rs(20) }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: Colors.app.texte,
                fontSize: SIZES.lg,
                fontWeight: "bold",
              }}
            >
              Votre abonnement a expiré.
            </Text>
            <BackButton
              backAction={() => subscribeBottomSheet.current?.dismiss()}
              icon={<XMarkIcon fill={Colors.app.texte} size={Rs(20)} />}
            />
          </View>
          <Text style={{ color: Colors.app.available.unav_txt }}>
            Pour continuer à profiter de tous nos services et fonctionnalités,
            veuillez renouveler votre abonnement.
          </Text>
        </View>
        <SubscriptionCompo
          redirectURL="gallery"
          closeBottomSheet={() => subscribeBottomSheet.current?.dismiss()}
        />
      </BottomSheetCompo>

      <BottomSheetCompo
        bottomSheetModalRef={claimeActiveAccountBottomSheet}
        snapPoints={["40%"]}
      >
        <ActiveToklomanCompo
          closeBottomSheet={() =>
            claimeActiveAccountBottomSheet.current?.dismiss()
          }
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
    marginBottom: Rs(50),
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
