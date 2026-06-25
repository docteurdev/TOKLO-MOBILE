import StoreInfo from '@/components/settings/StoreInfo'
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme'
import React, { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = {}

const store = (props: Props) => {

    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <SafeAreaView style={styles.safeArea} >
      <StoreInfo  handleClose={() => null} />
    </SafeAreaView>
  )
}

export default store

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  }
})