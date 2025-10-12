import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import OrderDetails from "@/components/store/OrderDatails";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheetCompo from "@/components/BottomSheetCompo";
import { formatXOF, Rs, SIZES } from "@/util/comon";
import { Colors } from "@/constants/Colors";
import { useQuery } from "@tanstack/react-query";
import { IProductOrder, TOrderStatus } from "@/interfaces/type";
import { StoreKeys } from "@/interfaces/queries-key/store";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import { baseURL } from "@/util/axios";
import useUpdateOrder from "@/hooks/mutations/store/order/useUpdateOrder";
import LoadingScreen from "@/components/Loading";

const Page = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const { user } = useUserStore();
  const [selectedOrder, setSelectedOrder] = useState<0>();

  const { data, isLoading, error, refetch } = useQuery<IProductOrder[], Error>({
    queryKey: StoreKeys.order.all,
    queryFn: async (): Promise<IProductOrder[]> => {
      try {
        const resp = await axios.get(baseURL + "/order/" + user?.id);
        return resp.data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch order");
      }
    },
    enabled: !!user?.id,
  });

  const { mutate, isPending } =useUpdateOrder();


  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#F59E0B";
      // case 'confirmed': return '#10B981';
      case "ONGOING":
        return "#3B82F6";
      case "DELIVERED":
        return "#059669";
       case 'AVOIDED': return '#EF4444';
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente";
      // case 'DELIVERED': return 'Confirmée';
      case "ONGOING":
        return "En attente";
      case "DELIVERED":
        return "Livrée";
      case "AVOIDED":
        return "Annulée";
      default:
        return "Inconnu";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const filteredOrders =
    selectedStatus === "all"
      ? data
      : data?.filter((order) => order.status === selectedStatus);

  const renderStatusFilter = () => {
    const statuses = [
      { key: "all", label: "Toutes" },
      { key: "PENDING", label: "En attente" },
      { key: "DELIVERED", label: "Livrées" },
      { key: "AVOIDED", label: "Annulées" },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {statuses.map((status) => (
          <TouchableOpacity
            key={status.key}
            style={[
              styles.filterButton,
              selectedStatus === status.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(status.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === status.key && styles.filterButtonTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderOrderItem = ({ item }: { item: IProductOrder }) => (
    <>
      <TouchableOpacity style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.customerInfo}>
            {/* <Image source={{ uri: item.customer.avatar }} style={styles.customerAvatar} /> */}
            <View>
              <Text style={styles.customerName}>{item.customer?.fullName}</Text>
              <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            </View>
          </View>
          <View style={styles.orderStatus}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.itemsList}>
            {item.items.map((product, index) => (
              <Text key={index} style={styles.itemText}>
                {product.quantity}x {product.name}
              </Text>
            ))}
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.totalAmount}>{formatXOF(item.total)}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          {item.status === "PENDING" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => {
                Alert.alert(
                  "Confirmation",
                  "Êtes-vous sur de livrer cette commande ?",
                  [
                    { text: "Retour", style: "cancel" },
                    {
                      text: "Confirmez",
                      style: "destructive",
                      onPress: () => {
                        mutate(
                          { orderId: item.id, status: "DELIVERED" },
                          {
                            onSuccess: () => {
                              refetch();
                            },
                          }
                        );
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Livrer</Text>
            </TouchableOpacity>
          )}

          {item.status === "PENDING" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                Alert.alert(
                  "Confirmation",
                  "Êtes-vous sur d'annuler cette commande ?",
                  [
                    { text: "Retour", style: "cancel" },
                    {
                      text: "Annulez",
                      style: "destructive",
                      onPress: () => {
                        mutate(
                          { orderId: item.id, status: "AVOIDED" },
                          {
                            onSuccess: () => {
                              refetch();
                            },
                          }
                        );
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="arrow-undo-circle" size={16} color="#fff" />
              <Text style={styles.actionButtonText}> Annuler </Text>
            </TouchableOpacity>
          )}

          {/* {item.status === "DELIVERED" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.shipButton]}
              onPress={() => updateOrderStatus(item.id, "shipped")}
            >
              <Ionicons name="airplane" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Expédier</Text>
            </TouchableOpacity>
          )} */}
          <TouchableOpacity
            onPress={() => {
              setSelectedOrder(item.id);
              bottomSheetModalRef.current?.present();
            }}
            style={[styles.actionButton, styles.detailsButton]}
          >
            <Ionicons name="eye" size={16} color="#4F46E5" />
            <Text style={[styles.actionButtonText, { color: "#4F46E5" }]}>
              Détails
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
     {isPending  && <LoadingScreen backgroundColor="rgba(0, 0, 0, 0.7" />}
      <View style={styles.header}>
        <Text style={styles.title}>Commandes reçues</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{data?.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.app.error }]}>
              {data?.filter((o) => o.status === "PENDING").length}
            </Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
        </View>
      </View>

      <View
        style={{
          backgroundColor: "white",
          flexDirection: "row",
          height: Rs(60),
          alignItems: "center",
        }}
      >
        {renderStatusFilter()}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>Aucune commande trouvée</Text>
          </View>
        }
      />

      <BottomSheetCompo
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={["90%"]}
      >
        <OrderDetails
          orderId={selectedOrder}
          onBack={() => bottomSheetModalRef.current?.dismiss()}
        />
      </BottomSheetCompo>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  loaing: {
    position: "absolute",
    flex: 1,
    backgroundColor: "rgba(0, 0, 2, 0.5)",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Rs(10),
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexGrow: 0,
    width: "100%",
    justifyContent: "space-between",
  },
  filterButton: {
    paddingHorizontal: 16,
    // paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F3F4F6",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#4F46E5",
  },
  filterButtonText: {
    fontSize: SIZES.xs,
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#fff",
    // fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: Colors.app.error,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  orderNumber: {
    fontSize: 14,
    color: "#6B7280",
  },
  orderStatus: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  orderDetails: {
    marginBottom: 12,
  },
  itemsList: {
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  orderDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  confirmButton: {
    backgroundColor: "#10B981",
  },
  shipButton: {
    backgroundColor: "#3B82F6",
  },
  detailsButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
});

export default Page;
