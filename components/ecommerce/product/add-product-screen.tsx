import BottomSheetCompo from '@/components/BottomSheetCompo'
import { Rs } from '@/util/comon'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ProductStepper } from './add-product-stepper'
import ColorSelector from './color-selector'
import FormSectionCard from './form-section-card'
import GenderSelector from './gender-selector'
import ProductCustomSwitch from './product-custom-switch'
import ProductFooterActions from './product-footer-actions'
import { PRODUCT_COLORS } from './product-theme'
import SizeSelector from './size-selector'
import StockInput from './stock-input'

type DropdownOption = {
  label: string
  value: string
}

const categoryOptions: DropdownOption[] = [
  { label: 'Tenue traditionnelle', value: 'traditional' },
  { label: 'Robe', value: 'dress' },
  { label: 'Chemise', value: 'shirt' },
  { label: 'Pantalon', value: 'pants' },
  { label: 'Costume', value: 'suit' },
  { label: 'Accessoire couture', value: 'accessory' },
]

const fabricOptions: DropdownOption[] = [
  { label: 'Bazin riche', value: 'bazin' },
  { label: 'Wax premium', value: 'wax' },
  { label: 'Bogolan', value: 'bogolan' },
  { label: 'Coton brodé', value: 'cotton' },
  { label: 'Soie', value: 'silk' },
]

const sewingDelayOptions: DropdownOption[] = [
  { label: '24 heures', value: '24h' },
  { label: '2 à 3 jours', value: '2-3-days' },
  { label: '3 à 5 jours', value: '3-5-days' },
  { label: '1 semaine', value: '1-week' },
  { label: 'Sur devis', value: 'custom' },
]

export default function AddProductScreen() {
  const router = useRouter()
  const [category, setCategory] = useState('traditional')
  const [gender, setGender] = useState('Femme')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState(12)
  const [isPromo, setIsPromo] = useState(false)
  const [isCustomAvailable, setIsCustomAvailable] = useState(true)
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL'])
  const [selectedColors, setSelectedColors] = useState(['#1F1F1F', '#D9C7A2'])
  const [fabric, setFabric] = useState('bazin')
  const [sewingDelay, setSewingDelay] = useState('3-5-days')

  const toggleSize = (size: string) => {
    setSelectedSizes((current) =>
      current.includes(size) ? current.filter((item) => item !== size) : [...current, size],
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors((current) =>
      current.includes(color) ? current.filter((item) => item !== color) : [...current, color],
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerIconButton}>
            <Ionicons name="chevron-back" size={24} color={PRODUCT_COLORS.text} />
          </Pressable>

          {/* <View style={styles.logoWrap}>
            <Image
              source={require('@/assets/logos/toklo.jpg')}
              resizeMode="cover"
              style={styles.logo}
            />
          </View> */}

          <Pressable style={styles.headerIconButton}>
            <Ionicons name="notifications-outline" size={23} color={PRODUCT_COLORS.text} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Ajouter un produit</Text>
            <Text style={styles.subtitle}>Ajoutez une nouvelle tenue à votre boutique.</Text>
          </View>

          <ProductStepper currentStep={0} />

          <FormSectionCard
            title="Informations générales"
            icon={
              <MaterialCommunityIcons
                name="hanger"
                size={21}
                color={PRODUCT_COLORS.gold}
              />
            }
          >
            <View style={styles.twoColumns} >
              <Field style={{flex: 1}} label="Nom du produit" required>
                <ProductInput placeholder="Ex: Robe boubou brodée" />
              </Field>

              <Field  style={{flex: 1}} label="Catégorie" required>
                <DropdownInput
                  value={category}
                  options={categoryOptions}
                  onChange={setCategory}
                  placeholder="Choisir une catégorie"
                  sheetTitle="Catégorie"
                />
              </Field>

            </View>

            <View style={{flexDirection: "row", gap: Rs(6), alignItems: "center"}}>

              <Field style={{width:"50%" }} label="Genre" required>
                <GenderSelector value={gender} onChange={setGender} />
              </Field>

              <Field style={{flex: 1}} label="Référence (SKU)">
                <ProductInput placeholder="Ex: TOK-RB-001" />
              </Field>
            </View>

            <Field label="Description" required>
              <TextInput
                multiline
                maxLength={500}
                value={description}
                onChangeText={setDescription}
                placeholder="Décrivez la coupe, le tissu et les finitions..."
                placeholderTextColor={PRODUCT_COLORS.placeholder}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
              />
              <Text style={styles.counter}>{description.length}/500</Text>
            </Field>
          </FormSectionCard>

          <FormSectionCard
            title="Prix et stock"
            icon={
              <MaterialCommunityIcons
                name="cash-multiple"
                size={21}
                color={PRODUCT_COLORS.gold}
              />
            }
          >
            <View style={styles.twoColumns}>
              <Field label="Prix (FCFA)" required style={styles.columnField}>
                <ProductInput keyboardType="numeric" placeholder="35 000" />
              </Field>

              <Field label="Ancien prix (FCFA)" style={styles.columnField}>
                <ProductInput keyboardType="numeric" placeholder="45 000" />
              </Field>
            </View>

            <Field label="Stock disponible" required>
              <StockInput value={stock} onChange={setStock} />
            </Field>

            <SwitchRow
              title="Produit en promotion"
              value={isPromo}
              onChange={setIsPromo}
            />
          </FormSectionCard>

          <FormSectionCard
            title="Options"
            icon={
              <MaterialCommunityIcons
                name="palette-outline"
                size={21}
                color={PRODUCT_COLORS.gold}
              />
            }
          >
            <Field label="Tailles disponibles">
              <SizeSelector selectedSizes={selectedSizes} onToggle={toggleSize} />
            </Field>

            <Field label="Couleurs disponibles">
              <ColorSelector selectedColors={selectedColors} onToggle={toggleColor} />
            </Field>

            <View style={styles.twoColumns}>
              <Field style={{flex: 1}} label="Tissu utilisé">
                <DropdownInput
                  value={fabric}
                  options={fabricOptions}
                  onChange={setFabric}
                  placeholder="Choisir un tissu"
                  sheetTitle="Tissu utilisé"
                />
              </Field>

              <Field style={{flex: 1}} label="Délai de confection">
                <DropdownInput
                  value={sewingDelay}
                  options={sewingDelayOptions}
                  onChange={setSewingDelay}
                  placeholder="Choisir un délai"
                  sheetTitle="Délai de confection"
                />
              </Field>

            </View>
          </FormSectionCard>

          <FormSectionCard
            title="Disponibilité sur mesure"
            icon={
              <MaterialCommunityIcons
                name="tape-measure"
                size={21}
                color={PRODUCT_COLORS.gold}
              />
            }
          >
            <View style={styles.customMeasureRow}>
              <View style={styles.customMeasureText}>
                <Text style={styles.customMeasureTitle}>
                  Proposez-vous ce produit sur mesure ?
                </Text>
                <Text style={styles.customMeasureDescription}>
                  Le client pourra vous envoyer ses mesures.
                </Text>
              </View>
              <ProductCustomSwitch value={isCustomAvailable} onChange={setIsCustomAvailable} />
            </View>
          </FormSectionCard>

          <ProductFooterActions />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function Field({
  children,
  label,
  required,
  style,
}: {
  children: React.ReactNode
  label: string
  required?: boolean
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
    </View>
  )
}

function ProductInput({
  placeholder,
  keyboardType,
}: {
  placeholder: string
  keyboardType?: 'default' | 'numeric'
}) {
  return (
    <TextInput
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={PRODUCT_COLORS.placeholder}
      style={styles.input}
    />
  )
}

export function DropdownInput({
  disabled = false,
  emptyLabel = 'Aucune option disponible',
  onChange,
  options,
  placeholder = 'Sélectionner',
  sheetTitle,
  style,
  value,
}: {
  disabled?: boolean
  emptyLabel?: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  sheetTitle?: string
  style?: StyleProp<ViewStyle>
  value?: string
}) {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const selectedOption = options.find((option) => option.value === value)
  const snapPoint = Math.min(440, Math.max(230, 142 + Math.max(options.length, 1) * 54))

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value)
    bottomSheetRef.current?.dismiss()
  }

  return (
    <View style={[styles.dropdownWrap, style]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => bottomSheetRef.current?.present()}
        style={[
          styles.dropdown,
          disabled && styles.dropdownDisabled,
        ]}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedOption && styles.dropdownPlaceholder,
            disabled && styles.dropdownTextDisabled,
          ]}
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={disabled ? PRODUCT_COLORS.placeholder : PRODUCT_COLORS.muted}
        />
      </Pressable>

      <BottomSheetCompo bottomSheetModalRef={bottomSheetRef} snapPoints={[snapPoint]}>
        <View style={styles.dropdownSheet}>
          <View style={styles.dropdownSheetHeader}>
            <View>
              <Text style={styles.dropdownSheetEyebrow}>Sélection</Text>
              <Text style={styles.dropdownSheetTitle}>{sheetTitle ?? placeholder}</Text>
            </View>
            <Pressable
              onPress={() => bottomSheetRef.current?.dismiss()}
              style={styles.dropdownSheetClose}
            >
              <Ionicons name="close" size={20} color={PRODUCT_COLORS.text} />
            </Pressable>
          </View>

          {options.length === 0 ? (
            <Text style={styles.dropdownEmptyText}>{emptyLabel}</Text>
          ) : (
            <View style={styles.dropdownOptions}>
              {options.map((option) => {
                const isSelected = option.value === value

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option)}
                    style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected && styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={17} color={PRODUCT_COLORS.gold} />
                    )}
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>
      </BottomSheetCompo>
    </View>
  )
}

function SwitchRow({
  onChange,
  title,
  value,
}: {
  onChange: (value: boolean) => void
  title: string
  value: boolean
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchTitle}>{title}</Text>
      <ProductCustomSwitch value={value} onChange={onChange} />
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRODUCT_COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRODUCT_COLORS.card,
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: PRODUCT_COLORS.gold,
    backgroundColor: PRODUCT_COLORS.card,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: PRODUCT_COLORS.gold,
    borderWidth: 2,
    borderColor: PRODUCT_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: PRODUCT_COLORS.card,
    fontSize: 9,
    fontWeight: '900',
  },
  content: {
    paddingHorizontal: 18,
    // paddingBottom: 28,
  },
  titleBlock: {
    paddingTop: 24,
    paddingBottom: 4,
  },
  title: {
    color: PRODUCT_COLORS.text,
    fontSize: Rs(15),
    lineHeight: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: PRODUCT_COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: PRODUCT_COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: PRODUCT_COLORS.gold,
  },
  input: {
    minHeight: Rs(40),
    borderRadius: Rs(8),
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.inputBorder,
    backgroundColor: PRODUCT_COLORS.card,
    paddingHorizontal: 16,
    color: PRODUCT_COLORS.muted,
    fontSize: Rs(10),
    fontWeight: '400',

  },
  textArea: {
    minHeight: 122,
    paddingTop: 14,
    paddingBottom: 30,
    lineHeight: 20,
  },
  counter: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    color: PRODUCT_COLORS.placeholder,
    fontSize: 11,
    fontWeight: '700',
  },
  dropdownWrap: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    flexShrink: 1,
  },
  dropdown: {
    width: '100%',
    height: Rs(40),
    borderRadius: Rs(8),
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.inputBorder,
    backgroundColor: PRODUCT_COLORS.card,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownDisabled: {
    backgroundColor: PRODUCT_COLORS.cream,
    opacity: 0.72,
  },
  dropdownText: {
    color: PRODUCT_COLORS.muted,
    fontSize: Rs(10),
    fontWeight: '400',
    flex: 1,
    marginRight: 10,
  },
  dropdownPlaceholder: {
    color: PRODUCT_COLORS.placeholder,
  },
  dropdownTextDisabled: {
    color: PRODUCT_COLORS.placeholder,
  },
  dropdownSheet: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  dropdownSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: PRODUCT_COLORS.border,
  },
  dropdownSheetEyebrow: {
    color: PRODUCT_COLORS.gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dropdownSheetTitle: {
    color: PRODUCT_COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  dropdownSheetClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRODUCT_COLORS.cream,
  },
  dropdownOptions: {
    gap: 8,
  },
  dropdownOption: {
    minHeight: 50,
    borderRadius: Rs(12),
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PRODUCT_COLORS.card,
    borderWidth: 1,
    borderColor: PRODUCT_COLORS.border,
  },
  dropdownOptionSelected: {
    backgroundColor: PRODUCT_COLORS.cream,
    borderColor: PRODUCT_COLORS.gold,
  },
  dropdownOptionText: {
    color: PRODUCT_COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  dropdownOptionTextSelected: {
    color: PRODUCT_COLORS.gold,
    fontWeight: '800',
  },
  dropdownEmptyText: {
    color: PRODUCT_COLORS.placeholder,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 18,
    textAlign: 'center',
  },
  twoColumns: {
    flexDirection: 'row',
    gap: Rs(8),
  },
  columnField: {
    flex: 1,
  },
  switchRow: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: PRODUCT_COLORS.cream,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTitle: {
    color: PRODUCT_COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  customMeasureRow: {
    minHeight: 84,
    borderRadius: 18,
    backgroundColor: PRODUCT_COLORS.cream,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  customMeasureText: {
    flex: 1,
  },
  customMeasureTitle: {
    color: PRODUCT_COLORS.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginBottom: 5,
  },
  customMeasureDescription: {
    color: PRODUCT_COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
})
