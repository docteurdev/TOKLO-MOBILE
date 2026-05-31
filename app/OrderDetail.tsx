import BottomSheetCompo from '@/components/BottomSheetCompo';
import LoadingScreen from '@/components/Loading';
import PaymentInterface from '@/components/calendar/CardDetails';
import PaymentDetails from '@/components/calendar/OrderDetail';
import BackButton from '@/components/form/BackButton';
import RoundedBtn from '@/components/form/RoundedBtn';
import { Colors } from '@/constants/Colors';
import useChangeOrderStatus from '@/hooks/mutations/useChangeOrderStatus';
import useInvoice from '@/hooks/useInvoice';
import { QueryKeys } from '@/interfaces/queries-key';
import { EDressStatus, IOrder, TInvoice } from '@/interfaces/type';
import { useUserStore } from '@/stores/user';
import { alertMgs } from '@/util/appText';
import { baseURL } from '@/util/axios';
import { generateInvoiceNumber, Rs, SIZES } from '@/util/comon';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  closeSheet?: () => void;
};

type OrderStatusInput = IOrder['status'] | EDressStatus | string | null | undefined;
type MeasureValue = string | number | boolean | null | undefined;
type MeasureDisplayValue = {
  value: string;
  url?: string;
};
type DisplayMeasure = Record<string, Record<string, MeasureDisplayValue>>;

const measurePartLabels: Record<string, string> = {
  haut: 'haut',
  bas: 'bas',
  complet: 'complet',
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const formatMeasureDisplayValue = (value: MeasureValue | object): MeasureDisplayValue => {
  if (value === null || value === undefined) {
    return { value: '' };
  }

  if (isRecord(value) && 'value' in value) {
    const formattedValue = formatMeasureDisplayValue(value.value as MeasureValue | object);
    const url = typeof value.url === 'string' ? value.url : undefined;

    return { ...formattedValue, url };
  }

  return {
    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
  };
};

const parseMeasure = (measure: unknown) => {
  let parsedMeasure = measure;

  for (let index = 0; index < 2; index += 1) {
    if (typeof parsedMeasure !== 'string') {
      break;
    }

    try {
      parsedMeasure = JSON.parse(parsedMeasure);
    } catch {
      return {};
    }
  }

  return isRecord(parsedMeasure) ? parsedMeasure : {};
};

const normalizeMeasureForDisplay = (measure: unknown): DisplayMeasure => {
  const parsedMeasure = parseMeasure(measure);
  const normalizedEntries = Object.entries(parsedMeasure).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );

  const hasSplitMeasure =
    isRecord(normalizedEntries.haut) || isRecord(normalizedEntries.bas);

  if (hasSplitMeasure) {
    return ['haut', 'bas'].reduce<DisplayMeasure>((acc, part) => {
      const partValues = normalizedEntries[part];

      acc[part] = isRecord(partValues)
        ? Object.entries(partValues).reduce<Record<string, MeasureDisplayValue>>(
            (measureAcc, [key, value]) => {
              measureAcc[key] = formatMeasureDisplayValue(value as MeasureValue | object);
              return measureAcc;
            },
            {},
          )
        : {};

      return acc;
    }, {});
  }

  if (isRecord(normalizedEntries.complet)) {
    return {
      complet: Object.entries(normalizedEntries.complet).reduce<Record<string, MeasureDisplayValue>>(
        (acc, [key, value]) => {
          acc[key] = formatMeasureDisplayValue(value as MeasureValue | object);
          return acc;
        },
        {},
      ),
    };
  }

  return Object.entries(parsedMeasure).reduce<DisplayMeasure>((acc, [key, value]) => {
    const [partLabel, ...measureNameParts] = key.split(' - ');
    const partKey = measurePartLabels[partLabel?.toLowerCase()];

    if (!partKey) {
      acc.mesures = {
        ...(acc.mesures ?? {}),
        [key]: formatMeasureDisplayValue(value as MeasureValue | object),
      };
      return acc;
    }

    const measureName = measureNameParts.join(' - ') || key;
    acc[partKey] = {
      ...(acc[partKey] ?? {}),
      [measureName]: formatMeasureDisplayValue(value as MeasureValue | object),
    };

    return acc;
  }, {});
};

const normalizeOrderStatus = (status: OrderStatusInput) => {
  if (!status) {
    return EDressStatus.ONGOING;
  }

  if (typeof status === 'string') {
    return status as EDressStatus;
  }

  return status.status;
};

const dateLikeToString = (value?: Date | string | null) => {
  if (!value) {
    return new Date().toISOString();
  }

  return value instanceof Date ? value.toISOString() : value;
};

const DressDetail = ({ closeSheet }: Props) => {
  const route = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUserStore();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { handleInvoice } = useInvoice();

  const { data, isLoading, error, refetch } = useQuery<IOrder, Error>({
    queryKey: QueryKeys.orders.byId(Number(id)),
    enabled: Boolean(id),
    queryFn: async (): Promise<IOrder> => {
      try {
        const resp = await axios.get(`${baseURL}/orders/${id}`);
        return resp.data;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch order');
      }
    },
  });

  const currentStatus = normalizeOrderStatus(data?.status);
  const { mutate, isPending } = useChangeOrderStatus(closeBottomSheet, currentStatus);
  const measureForDisplay = useMemo(() => {
    return normalizeMeasureForDisplay(data?.measure);
  }, [data?.measure]);

  const invoice = useMemo<TInvoice | undefined>(() => {
    if (!data) {
      return undefined;
    }

    return {
      storeName: user?.store_name ?? '',
      sotreSlogan: user?.store_slogan ?? '',
      storeAddress: '123 Avenue de la Mode, 75008 Paris',
      storePhone: user?.phone ?? '',
      clientFullName: `${data.client_name ?? ''} ${data.client_lastname ?? ''}`.trim(),
      clientPhone: data.client_phone ?? '',
      invoiceNumber: generateInvoiceNumber(
        user?.id || 0,
        dateLikeToString(data.updatedat),
      ),
      invoiceDate: new Date().toLocaleDateString('fr-FR'),
      staus: 'Payée',
      dressName: data.description ?? '',
      quantite: data.quantite ?? '',
      price: Number(data.amount),
      totalPrice: Number(data.amount) * Number(data.quantite),
      paiement: Number(data.paiement),
      biTotal: Number(data.amount) * Number(data.quantite) - Number(data.paiement),
    };
  }, [data, user?.id, user?.phone, user?.store_name, user?.store_slogan]);

  function closeBottomSheet() {
    closeSheet?.();
    refetch();
    bottomSheetModalRef.current?.close();
  }

  const handleChangeStatus = () => {
    if (!data) return;

    const nextStatus =
      currentStatus === EDressStatus.ONGOING
        ? EDressStatus.FINISHED
        : EDressStatus.DELIVERED;

    mutate({ id: data.id, status: nextStatus });
  };

  const handlePrintInvoice = () => {
    if (invoice) {
      handleInvoice(invoice);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        visible={isLoading}
        backgroundColor="#ffffff"
        indicatorColor="#FFFFFF"
        indicatorSize={48}
        message=""
        animationType="slide"
      />
    );
  }

  if (error) {
    return <Text>Erreur: {error.message}</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.backButtonContainer}>
        <BackButton backAction={() => route.replace({ pathname: '/(app)/(tab)/orders' })} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: Rs(50) }}>
        <View style={styles.content}>
          <PaymentDetails
            totalPrice={Number(data?.solde_cal)}
            status={currentStatus}
            date_remise={data?.date_remise ?? ''}
            date_depot={data?.date_depote ?? ''}
            solde_cal={data?.solde_cal ?? '0'}
            paiement={data?.paiement ?? '0'}
          />

          <PaymentInterface
            clientfullname={`${data?.client_name ?? ''} ${data?.client_lastname ?? ''}`.trim()}
            clientphone={data?.client_phone ?? ''}
            dresstype={data?.description ?? ''}
            tissu={data?.tissus ?? ''}
            fabric={data?.photos ?? ''}
            mesure={measureForDisplay}
            quantity={data?.quantite ?? ''}
            solde={data?.solde_cal ?? '0'}
            price={data?.amount ?? '0'}
            paid={data?.paiement ?? '0'}
            date_remise={data?.date_remise ?? ''}
            date_depot={data?.date_depote ?? ''}
            deliveryHour={data?.deliveryHour ?? ''}
          />
        </View>

        {currentStatus !== EDressStatus.DELIVERED && (
          <View style={styles.actionContainer}>
            <View style={{ flex: 1 }}>
              <RoundedBtn
                label={
                  currentStatus === EDressStatus.ONGOING
                    ? 'Terminer le vêtement'
                    : 'Livrer le vêtement'
                }
                disabled
                action={() => bottomSheetModalRef.current?.present()}
              />
            </View>
          </View>
        )}

        {currentStatus === EDressStatus.DELIVERED && (
          <View style={styles.actionContainer}>
            <View style={{ flex: 1 }}>
              <RoundedBtn
                label="Générer la facture"
                disabled
                action={handlePrintInvoice}
              />
            </View>
          </View>
        )}

        <BottomSheetCompo bottomSheetModalRef={bottomSheetModalRef} snapPoints={[Rs(220)]}>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetText}>
              {currentStatus === EDressStatus.ONGOING
                ? alertMgs.order.order.statussChanging.finish.fr
                : alertMgs.order.order.statussChanging.deliver.fr}
            </Text>
            <RoundedBtn
              label={currentStatus === EDressStatus.ONGOING ? 'Terminer' : 'Livrer'}
              disabled
              loading={isPending}
              action={handleChangeStatus}
            />
          </View>
        </BottomSheetCompo>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DressDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Rs(40),
  },
  backButtonContainer: {
    position: 'absolute',
    top: Rs(40),
    left: Rs(10),
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: Rs(50),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  bottomSheetContent: {
    height: Rs(150),
    justifyContent: 'center',
    alignItems: 'center',
    gap: Rs(20),
    paddingHorizontal: Rs(20),
  },
  bottomSheetText: {
    fontSize: SIZES.sm,
    color: Colors.app.texteLight,
  },
});
