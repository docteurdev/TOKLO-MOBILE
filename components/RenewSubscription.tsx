import CustomButton from '@/components/form/CustomButton';
import { AppTheme, useAppTheme } from '@/hooks/useAppTheme';
import { Rs, SIZES } from '@/util/comon';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type RenewSubscriptionProps = {
  onPressRenew: () => void;
  onPressLater?: () => void;
};



const RenewSubscription = ({ onPressRenew, onPressLater }: RenewSubscriptionProps) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>

      <Image
        source={require('@/assets/souscription/renew-suscription.png')}
        resizeMode="contain"
        style={styles.image}
      />

      <Text style={styles.title}>Votre abonnement a expiré</Text>
      <Text style={styles.description}>
        Renouvelez votre forfait pour continuer à gérer vos clients, commandes et mesures sans interruption.
      </Text>

      

      <View style={styles.ctaWrap}>
        <CustomButton
          label="Voir les forfaits"
          action={onPressRenew}
          disabled
        />
      </View>

      {onPressLater ? (
        <Pressable onPress={onPressLater} hitSlop={Rs(10)}>
          <Text style={styles.laterText}>Plus tard</Text>
        </Pressable>
      ) : (
        <Text style={styles.laterText}>Plus tard</Text>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.background,
    paddingHorizontal: Rs(20),
  },
  
  image: {
    width: Rs(110),
    height: Rs(110),
    alignSelf: 'center',
    marginTop: Rs(12),
    marginBottom: Rs(12),
  },
  title: {
    fontSize: SIZES.xl + Rs(3),
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
    lineHeight: Rs(32),
  },
  description: {
    fontSize: SIZES.lg,
    color: theme.muted,
    textAlign: 'center',
    lineHeight: Rs(22),
    marginTop: Rs(10),
    paddingHorizontal: Rs(12),
  },
  benefitsRow: {
    flexDirection: 'row',
    gap: Rs(10),
    marginTop: Rs(22),
  },
  benefitItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Rs(18),
    paddingVertical: Rs(14),
  },
  benefitText: {
    color: theme.primary,
    fontWeight: '700',
    fontSize: SIZES.sm,
  },
  ctaWrap: {
    marginTop: Rs(24),
  },
  renewButton: {
    height: Rs(56),
    borderRadius: Rs(16),
    backgroundColor: theme.primary,
    borderWidth: 1,
    borderColor: theme.gold,
  },
  renewButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: SIZES.lg + Rs(1),
  },
  laterText: {
    textAlign: 'center',
    color: theme.muted,
    fontWeight: '600',
    fontSize: SIZES.lg,
    marginTop: Rs(16),
    marginBottom: Rs(8),
  },
});

export default RenewSubscription;
