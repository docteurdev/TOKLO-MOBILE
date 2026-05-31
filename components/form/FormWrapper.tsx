import { Rs } from '@/util/comon';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, findNodeHandle, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../ScreenWrapper';

type Props = {
  children: React.ReactNode;
};

type FormScrollTarget = TextInput | View;
type FormScrollTargetRef = React.RefObject<FormScrollTarget | null>;

type FormScrollContextValue = {
  scrollToInput: (targetRef: FormScrollTargetRef) => void;
};

const FormScrollContext = createContext<FormScrollContextValue | null>(null);

export const useFormScroll = () => useContext(FormScrollContext);

const KEYBOARD_FOCUSED_FIELD_GAP = Rs(64);
const KEYBOARD_CONTENT_PADDING = Rs(130);

const FormWrapper = ({ children }: Props) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const currentScrollYRef = useRef(0);
  const keyboardTopRef = useRef(Dimensions.get('window').height);
  const focusedTargetRef = useRef<FormScrollTargetRef | null>(null);
  const pendingScrollTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardVerticalOffset = Platform.OS === 'ios' ? insets.top : 0;

  const clearPendingScrolls = useCallback(() => {
    pendingScrollTimeoutsRef.current.forEach(clearTimeout);
    pendingScrollTimeoutsRef.current = [];
  }, []);

  const scheduleScrollToTarget = useCallback((
    targetRef: FormScrollTargetRef,
    delay: number,
    options: { animated: boolean; useNativeScroll: boolean },
  ) => {
    const timeout = setTimeout(() => {
      if (!targetRef.current) return;

      const ensureInputVisible = () => {
        if (!targetRef.current) return;

        targetRef.current.measureInWindow((_x, y, _width, height) => {
          const windowHeight = Dimensions.get('window').height;
          const keyboardTop = keyboardTopRef.current || windowHeight;
          const visibleBottom = Math.min(keyboardTop, windowHeight) - KEYBOARD_FOCUSED_FIELD_GAP;
          const visibleTop = insets.top + Rs(16);
          const targetBottom = y + height;
          let nextScrollY = currentScrollYRef.current;

          if (targetBottom > visibleBottom) {
            nextScrollY += targetBottom - visibleBottom;
          } else if (y < visibleTop) {
            nextScrollY -= visibleTop - y;
          } else {
            return;
          }

          scrollViewRef.current?.scrollTo({
            y: Math.max(0, nextScrollY),
            animated: options.animated,
          });
        });
      };

      const nodeHandle = findNodeHandle(targetRef.current);

      if (nodeHandle && options.useNativeScroll) {
        scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
          nodeHandle,
          KEYBOARD_FOCUSED_FIELD_GAP,
          true,
        );
      }

      ensureInputVisible();
    }, delay);

    pendingScrollTimeoutsRef.current.push(timeout);
  }, [insets.top]);

  const scrollToInput = useCallback((targetRef: FormScrollTargetRef) => {
    focusedTargetRef.current = targetRef;
    clearPendingScrolls();

    scheduleScrollToTarget(targetRef, Platform.OS === 'ios' ? 70 : 120, {
      animated: true,
      useNativeScroll: true,
    });
    scheduleScrollToTarget(targetRef, Platform.OS === 'ios' ? 180 : 260, {
      animated: false,
      useNativeScroll: false,
    });
  }, [clearPendingScrolls, scheduleScrollToTarget]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      keyboardTopRef.current = event.endCoordinates.screenY || Dimensions.get('window').height;
      setKeyboardHeight(event.endCoordinates.height);
      clearPendingScrolls();

      if (focusedTargetRef.current) {
        scheduleScrollToTarget(focusedTargetRef.current, Platform.OS === 'ios' ? 20 : 60, {
          animated: true,
          useNativeScroll: true,
        });
        scheduleScrollToTarget(focusedTargetRef.current, Platform.OS === 'ios' ? 140 : 180, {
          animated: false,
          useNativeScroll: false,
        });
      }
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      clearPendingScrolls();
      keyboardTopRef.current = Dimensions.get('window').height;
      setKeyboardHeight(0);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      clearPendingScrolls();
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [clearPendingScrolls, scheduleScrollToTarget]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScreenWrapper>
        <FormScrollContext.Provider value={{ scrollToInput }}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            contentInsetAdjustmentBehavior='always'
            onScroll={(event) => {
              currentScrollYRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: insets.top + Rs(24),
                paddingBottom: insets.bottom + KEYBOARD_CONTENT_PADDING + keyboardHeight,
              },
            ]}
          >
            {children}
          </ScrollView>
        </FormScrollContext.Provider>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

export default FormWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  }
});
