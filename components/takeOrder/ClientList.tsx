import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  BackwardIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  PlusIcon,
  PlusSmallIcon,
  XMarkIcon,
} from "react-native-heroicons/solid";
import { Colors } from "@/constants/Colors";
import { Rs, size, SIZES } from "@/util/comon";
import OtherInput from "../form/OtherInput";
import { FlashList } from "@shopify/flash-list";
import UserItem from "../user/UserItem";
import { IUser } from "@/interfaces/user";
import { IClient } from "@/interfaces/type";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseURL } from "@/util/axios";
import { QueryKeys } from "@/interfaces/queries-key";
import AddNewClientCompo from "../AddNewClientCompo";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { ZoomIn } from "react-native-reanimated";
import { useUserStore } from "@/stores/user";

type Props = {
  isShowModal: boolean;
  // children: React.ReactNode;
  closeModal: () => void;
  setSelectedUser: (user: IClient) => void;
};

const ClientList = ({ isShowModal, closeModal, setSelectedUser }: Props) => {
  const [filterVal, setFilterVal] = useState("");

  const [isShowAddClient, setIsShowAddClient] = useState(false);

  const {user} = useUserStore()

  const { data, isLoading, error, refetch } = useQuery<IClient[], Error>({
    queryKey: QueryKeys.clients.all,
    queryFn: async (): Promise<IClient[]> => {
      // Explicit return type
      try {
        const resp = await axios.post(baseURL+ "/clients/by-toklo-menId", {Toklo_menId: user?.id});
        //  console.log("ààààààààààààààà", resp.data)
        return resp.data?.reverse(); // Ensure `resp.data` is returned
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch clients"); // Rethrow to handle error properly
      }
    },
  });

  const dataFiltered = useMemo(() => {
    return data?.filter((item) => {
      const searchTerm = filterVal?.toLowerCase();
      return (
        item.name?.toLowerCase().includes(searchTerm) ||
        item.lastname?.toLowerCase().includes(searchTerm)
      );
    });
  }, [data, filterVal]); // Only recalculate when data or filterVal changes

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: IClient) => item.id.toString(), []);

  // Memoize renderItem
  const renderItem = useCallback(
    ({ item }: { item: IClient }) => (
      <UserItem user={item} action={() => setSelectedUser(item)} />
    ),
    []
  );

  // Memoize EmptyComponent
  const ListEmptyComponent = useCallback(
    () => <Text>Pas de client trouvé</Text>,
    []
  );

  function handleShowAddClient() {
    // alert("ok")
    setIsShowAddClient(!isShowAddClient);
  }

  return (
    <Modal
      style={{ flex: 1 }}
      presentationStyle="pageSheet"
      transparent
      visible={isShowModal}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.listDisplay,
            {
              height: Rs(50),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "transparent",
              gap: 6,
            },
          ]}
        >
          <View style={{ flex: 1,  }}>
            <OtherInput
              icon={<MagnifyingGlassIcon color={Colors.app.primary} />}
              placeholder="Rechercher un client"
              value={filterVal}
              setValue={setFilterVal}
            />
          </View>
          <TouchableOpacity
            onPress={() => closeModal()}
            style={{
              width: 40,
              height: Rs(40),
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: Rs(4),
            }}
          >
            <XMarkIcon fill={Colors.app.primary} size={27} />
          </TouchableOpacity>
        </View>
        <View
          style={[styles.listDisplay, { marginTop: Rs(20), padding: Rs(10) }]}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
            >
              <Text style={[styles.listTitle]}>{ isShowAddClient? "Ajouter un client" : "Liste des clients"}</Text>
              {!isShowAddClient && <Text style={[styles.listTitle, { fontSize: SIZES.xs }]}>
                {" "}
                { dataFiltered?.length}{" "}
              </Text>}
            </View>
            <View
              // entering={ZoomIn.delay(300).duration(800)}
              style={styles.avatarContainer}
            >
              <Pressable onPress={() => handleShowAddClient()} style={styles.avatar}>
                <MaterialIcons name="person" size={20} color="#8a8ff5" />
                <View style={[styles.addIconContainer,]}>
                 {!isShowAddClient? <MaterialIcons
                    name="add-circle"
                    size={24}
                    color={Colors.app.primary}
                  /> :
                  <ChevronLeftIcon
                    size={24}
                    color={Colors.app.primary}
                  />}

                </View>
              </Pressable>
            </View>
          </View>

          {!isShowAddClient ? (
            <FlashList
              data={dataFiltered}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onRefresh={refetch}
              refreshing={isLoading}
              ListEmptyComponent={ListEmptyComponent}
              removeClippedSubviews={true}
              estimatedItemSize={200}
            />
          ) : (
            <AddNewClientCompo handleShowAddClient={() => handleShowAddClient()} />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ClientList;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: Rs(20),
  },
  listDisplay: {
    backgroundColor: "white",
    width: "100%",
    height: "80%",
    borderRadius: 8,

    //  padding: Rs(20),
  },
  listTitle: {
    fontSize: SIZES.sm,
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: Rs(30),
    height: Rs(30),
    borderRadius: 50,
    backgroundColor: "#e8e9ff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  addIconContainer: {
    position: "absolute",
    // width: Rs(20),
    // height: Rs(20),
    top: 20,
    right: -10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
