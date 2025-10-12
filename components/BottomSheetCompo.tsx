import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

interface Props extends Partial<BottomSheetModalProps> {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onChange?: (index: number) => void;
}

const BottomSheetCompo = ({
  bottomSheetModalRef,
  children,
  snapPoints: customSnapPoints,
  onChange,
  ...props
}: Props) => {
  const snapPoints = useMemo(() => customSnapPoints || ['100%'], [customSnapPoints]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1} // This ensures the backdrop disappears when the sheet is closed
        appearsOnIndex={0} // This ensures the backdrop appears when the sheet is open
      />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={onChange}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        keyboardBlurBehavior="none"
        android_keyboardInputMode="adjustPan"
        keyboardBehavior="interactive"
        // handleHeight={0} // Remove or set to a non-zero value
        {...props}
      >
        <BottomSheetScrollView 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          bounces={false}
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 100 ,
  },
});

export default BottomSheetCompo;