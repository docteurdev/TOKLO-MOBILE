import { AppTheme, useAppTheme } from "@/hooks/useAppTheme";
import { QueryKeys } from "@/interfaces/queries-key";
import { IClient } from "@/interfaces/type";
import { useUserStore } from "@/stores/user";
import { baseURL } from "@/util/axios";
import { Rs, SIZES } from "@/util/comon";
import { MaterialIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from "react-native-heroicons/solid";
import { SafeAreaView } from "react-native-safe-area-context";
import AddNewClientCompo from "../AddNewClientCompo";
import OtherInput from "../form/OtherInput";
import UserItem from "../user/UserItem";

type Props = {
  isShowModal: boolean;
  // children: React.ReactNode;
  closeModal: () => void;
  setSelectedUser: (user: IClient) => void;
};

const ClientList = ({ isShowModal, closeModal, setSelectedUser }: Props) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
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
    [setSelectedUser]
  );

  // Memoize EmptyComponent
  const ListEmptyComponent = useCallback(
    () => <Text style={styles.emptyText}>{error ? error.message : "Pas de client trouvé"}</Text>,
    [error, styles.emptyText]
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
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <OtherInput
              icon={<MagnifyingGlassIcon color={theme.primary} />}
              placeholder="Rechercher un client"
              value={filterVal}
              setValue={setFilterVal}
            />
          </View>
          <TouchableOpacity
            onPress={() => closeModal()}
            style={styles.closeButton}
          >
            <XMarkIcon fill={theme.primary} size={27} />
          </TouchableOpacity>
        </View>
        <View style={styles.listDisplay}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
            >
              <Text style={[styles.listTitle]}>{ isShowAddClient? "Ajouter un client" : "Liste des clients"}</Text>
              {!isShowAddClient && <Text style={styles.listCount}>
                {" "}
                { dataFiltered?.length}{" "}
              </Text>}
            </View>
            <View
              // entering={ZoomIn.delay(300).duration(800)}
              style={styles.avatarContainer}
            >
              <Pressable onPress={() => handleShowAddClient()} style={styles.avatar}>
                <MaterialIcons name="person" size={20} color={theme.primary} />
                <View style={[styles.addIconContainer,]}>
                 {!isShowAddClient? <MaterialIcons
                    name="add-circle"
                    size={24}
                    color={theme.primary}
                  /> :
                  <ChevronLeftIcon
                    size={24}
                    color={theme.primary}
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
            />
          ) : (
            <AddNewClientCompo handleShowAddClient={() => handleShowAddClient()} />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ClientList;

const createStyles = (theme: AppTheme) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background === "#FFFDF8" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.72)",
    padding: Rs(20),
  },
  searchRow: {
    alignItems: "center",
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 6,
    height: Rs(50),
    justifyContent: "space-between",
    width: "100%",
  },
  searchInputWrap: {
    flex: 1,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderRadius: Rs(4),
    borderWidth: StyleSheet.hairlineWidth,
    height: Rs(40),
    justifyContent: "center",
    width: 40,
  },
  listDisplay: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    width: "100%",
    height: "80%",
    borderRadius: 8,
    marginTop: Rs(20),
    padding: Rs(10),

    //  padding: Rs(20),
  },
  listTitle: {
    color: theme.text,
    fontSize: SIZES.sm,
    fontWeight: "bold",
  },
  listCount: {
    color: theme.muted,
    fontSize: SIZES.xs,
    fontWeight: "bold",
  },
  emptyText: {
    color: theme.muted,
    fontSize: SIZES.sm,
    paddingVertical: Rs(16),
    textAlign: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: Rs(30),
    height: Rs(30),
    borderRadius: 50,
    backgroundColor: theme.primaryLight,
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
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
