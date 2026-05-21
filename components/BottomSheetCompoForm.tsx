// BottomSheetCompo.tsx
import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

interface Props extends Partial<BottomSheetModalProps> {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onChange?: (index: number) => void;
}

const BottomSheetCompoForm = ({
  bottomSheetModalRef,
  children,
  snapPoints: customSnapPoints,
  onChange,
  ...props
}: Props) => {
  const snapPoints = useMemo(() => customSnapPoints || ['90%'], [customSnapPoints]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={onChange}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        keyboardBehavior="extend"
        android_keyboardInputMode="adjustResize"
        {...props}
      >

        
        <BottomSheetView style={styles.contentContainer}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});

export default BottomSheetCompoForm;