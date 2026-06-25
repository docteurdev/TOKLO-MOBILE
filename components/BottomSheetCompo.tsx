import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

interface Props extends Partial<BottomSheetModalProps> {
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
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
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const snapPoints = useMemo(() => customSnapPoints || ['100%'], [customSnapPoints]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1} // This ensures the backdrop disappears when the sheet is closed
        appearsOnIndex={0} // This ensures the backdrop appears when the sheet is open
        opacity={theme.background === '#FFFDF8' ? 0.5 : 0.72}
      />
    ),
    [theme.background]
  );

  return (
    <View style={styles.container}>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={onChange}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        enablePanDownToClose
        handleIndicatorStyle={styles.handleIndicator}
        handleStyle={styles.handle}
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  scrollView: {
    backgroundColor: theme.card,
    flex: 1,
  },
  contentContainer: {
    backgroundColor: theme.card,
    flexGrow: 1,
    paddingBottom: 100 ,
  },
  sheetBackground: {
    backgroundColor: theme.card,
  },
  handle: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleIndicator: {
    backgroundColor: theme.muted,
  },
});

export default BottomSheetCompo;
