import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { Tabs } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { SIZES } from '@/util/comon';
import OngoingList from '@/components/dress/OngoingList';
import { SegmentButtons } from '@/components/SegmentButtons';
import { useOrderStore } from '@/stores/order';
import FinishedList from '@/components/dress/FinishedList';
import DeliveredList from '@/components/dress/DeliveredList';

type Props = {};
const tabs = ['Ongoing', 'Finished', 'Delivered'];

const Page = (props: Props) => {
  const [selectedTab, setSelectedTab] = useState('Ongoing');

  const { ongoingOrderLength, finishedOrderLength, deliveredOrderLength } = useOrderStore();

  const [selectedSegment, setSelectedSegment] = useState<{ label: string; value?: number | null }>({
    label: 'En cours',
    value: ongoingOrderLength,
  });

  const segment = useMemo(
    () => [
      { label: 'En cours', value: ongoingOrderLength },
      { label: 'Terminées', value: finishedOrderLength },
      { label: 'Livrées', value: deliveredOrderLength },
    ],
    [ongoingOrderLength, finishedOrderLength, deliveredOrderLength]
  );

  const onSegmentChange = (segment: { label: string; value?: number | null }) => {
    setSelectedSegment(segment);
    console.log(segment);
  };

  // Memoize the components to prevent unnecessary re-renders
  const renderedComponent = useMemo(() => {
    switch (selectedSegment.label) {
      case 'En cours':
        return <OngoingList key="ongoing" />; // Use key to force re-render only when necessary
      case 'Terminées':
        return <FinishedList key="finished" />;
      case 'Livrées':
        return <DeliveredList key="delivered" />;
      default:
        return null;
    }
  }, [selectedSegment.label]);

  return (
    <>
      <ScreenWrapper>
        {/* Header */}
        <SegmentButtons segments={segment} onSegmentPress={onSegmentChange} />

        {/* Render the memoized component */}
        {renderedComponent}
      </ScreenWrapper>
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  tabsContainer: {
    position: 'relative',
    width: 'auto',
    height: 32,
    backgroundColor: 'light',
  },
  tabsText: {
    fontSize: SIZES.sm,
    color: Colors.app.texte,
  },
  tabsUnderlined: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.app.primary,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});