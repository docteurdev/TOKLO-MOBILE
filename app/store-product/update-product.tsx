import {
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, Rs, SIZES } from "@/util/comon";
import { Colors } from "@/constants/Colors";
import useUpload from "@/hooks/useUpload";
import { Image } from "react-native";
import { Formik } from "formik";
import { INewProduct, ProductSchema } from "@/constants/formSchemas/product";
import { productCategories } from "@/utils";
import useNewProduct from "@/hooks/mutations/store/useNewProduct";
import { SwitchCompo } from "@/components/SwitchCompo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";
import BackButton from "@/components/form/BackButton";
import { StoreKeys } from "@/interfaces/queries-key/store";
import { useQuery } from "@tanstack/react-query";
import { IProduct } from "@/interfaces/type";
import axios from "axios";
import { base, baseURL } from "@/util/axios";
import useUpdateProduct from "@/hooks/mutations/store/useUpdateProduct";
import BottomSheetCompo from "@/components/BottomSheetCompo";
import RoundedBtn from "@/components/form/RoundedBtn";
import useRemoveFile from "@/hooks/mutations/useRemoveFile";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { s } from "react-native-size-matters";
import useAddFile from "@/hooks/mutations/store/useAddFile";

type Props = {
  closeModal?: () => void;
  id: number;
};

function ProductImage({
  img,
  pickImage,
  removeImage,
  isExistImg,
}: {
  img: string | null;
  pickImage: () => void;
  removeImage: () => void;
  isExistImg: boolean;
}) {
  return (
    <View
      style={{
        width: Rs(100),
        height: Rs(100),
        borderRadius: Rs(20),
        backgroundColor: Colors.app.disabled,
        borderWidth: 1,
        borderColor: Colors.app.disabled,
      }}
    >
      <TouchableOpacity
        onPress={() => pickImage()}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        {!img ? (
          <Ionicons name="image-sharp" size={24} color="#fff" />
        ) : (
          <Image
            source={{ uri: isExistImg? base+'uploads/'+ img : img }}
            style={{ width: Rs(100), height: Rs(100), borderRadius: Rs(20) }}
          />
        )}

        {img && (
          <TouchableOpacity
            onPress={() => removeImage()}
            style={{
              position: "absolute",
              backgroundColor: colors.white,
              top: Rs(5),
              right: Rs(5),
              zIndex: 1000,
              borderRadius: Rs(100),
              padding: Rs(5),
            }}
          >
            <Ionicons name="trash" size={24} color={Colors.app.error} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
}

const Page = () => {
  const [selectedCategory, setCategory] = useState(productCategories[0].en);
  const [reduc, setReduc] = useState({ amount: 0, percent: 0 });

  const {id} = useLocalSearchParams<{id: string}>()

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [selectRemoveImg, setSelectRemoveImg] = useState('')


  const { data, isLoading, error, refetch } = useQuery<IProduct, Error>({
    queryKey: [StoreKeys.product.byId(Number(id))], 
    queryFn: async (): Promise<IProduct> => {
      try {
        const resp = await axios.get(
          baseURL + "/product/" + id
        );
        // console.log("resp", resp.data);
        return resp.data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch product"); 
      }
    },
    enabled: !!id,
  });

  const [isReduc, setisReduc] = useState(data?.isActiveReduction);


    const {mutate: mutateRemoveFile, isPending: isPendingRemove} = useRemoveFile(handleCloseDeleteModal, refetch);

    const {mutate: mutateAddFile, isPending: isPendingAdd} = useAddFile();


  function handleCloseDeleteModal(){
    bottomSheetModalRef.current?.dismiss()
  }

  // Initialize states when data is loaded
  useEffect(() => {
    if (data) {
      setCategory(data.category || productCategories[0].en);
      // setisReduc(!!data.reduction && data.reduction > 0);
      
      if (data.reduction && data.reduction > 0) {
        const reductionAmount = (data.price * data.reduction) / 100;
        setReduc({
          amount: Math.round(reductionAmount * 100) / 100,
          percent: data.reduction
        });
      }
    }
  }, [data]);

  const { singleImage, pickImage } = useUpload(true);
  const {
    singleImage: img1,
    pickImage: pickImage1,
    resetsingleImage: removeImage1, 
  } = useUpload(true);

    useEffect(() => {
    if (img1) {
      mutateAddFile({ id: Number(id), image: img1 });
    }
  }, [img1]);

  const {
    singleImage: img2,
    pickImage: pickImage2,
    resetsingleImage: removeImage2,
  } = useUpload(true);

  useEffect(() => {
  if (img2) {
    mutateAddFile({ id: Number(id), image: img2 });
  }
}, [img2]);

  
  const {
    singleImage: img3,
    pickImage: pickImage3,
    resetsingleImage: removeImage3,
  } = useUpload(true);

   useEffect(() => {
  if (img3) {
    mutateAddFile({ id: Number(id), image: img3 });
  }
}, [img3]);

  const { mutate, isPending, isSuccess } = useUpdateProduct();
  const router = useRouter();

  function goToArcle(){
    router.push('/(store)/articles')
  }

  
  // Helper function to calculate reduction
  const calculateReduction = (amount: number, price: number) => {
    return price > 0 ? (amount / price) * 100 : 0;
  };

  const calculateAmount = (percentage: number, price: number) => {
    return price > 0 ? (percentage * price) / 100 : 0;
  };

  async function handleUpdateProduct(values: INewProduct, resetForm: () => void) {
    try {
      const productData = {
        ...values,
        id: Number(id), 
        category: selectedCategory,
        stock: Number(values.stock),
        price: Number(values.price),
        reduction:  reduc.percent,
        isActiveReduction: isReduc,
      };
      
      // console.log('Product data:', productData);
      mutate(productData, {
        onSuccess: () => {
          refetch();
        }
      });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }

  function handleSelectImage( img: string){
   setSelectRemoveImg(img)
    bottomSheetModalRef.current?.present()
  }

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <BackButton
            backAction={() => goToArcle()}
            icon={<Ionicons name="chevron-back" size={24} />}
          />
          <Text style={styles.modalTitle}>Modifier l'article</Text>
          <View style={{width: 60}} />
        </View>
        <View style={[styles.modalContent, {justifyContent: 'center', alignItems: 'center'}]}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={{marginTop: 10}}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <BackButton
            backAction={() => goToArcle()}
            icon={<Ionicons name="chevron-back" size={24} />}
          />
          <Text style={styles.modalTitle}>Erreur</Text>
          <View style={{width: 60}} />
        </View>
        <View style={[styles.modalContent, {justifyContent: 'center', alignItems: 'center'}]}>
          <Text style={{color: colors.red}}>Erreur lors du chargement du produit</Text>
          <TouchableOpacity onPress={() => refetch()} style={{marginTop: 10}}>
            <Text style={{color: colors.blue}}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render form if no data
  if (!data) {
    return null;
  }

  return (
    <SafeAreaView style={styles.modalContainer}>
      <Formik
        initialValues={{
          name: data.name || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          reduction: data.reduction ? ((data.price * data.reduction) / 100).toString() : '0',
          stock: data.stock?.toString() || '',
        }}
        validationSchema={ProductSchema}
        onSubmit={(values, { resetForm }) => handleUpdateProduct(values, resetForm)}
        enableReinitialize
      >
        {({
          handleSubmit,
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isValid,
          dirty,
        }) => (
          <>
            <View style={styles.modalHeader}>
              <BackButton
                backAction={() => goToArcle()}
                icon={<Ionicons name="chevron-back" size={24} />}
              />
              <Text style={styles.modalTitle}>Modifier l'article</Text>
              <TouchableOpacity onPress={() => handleSubmit()}>
               {!isPending ? (
                 <Text style={styles.saveButton}>Modifier</Text>
               ) : (
                 <ActivityIndicator size="small" color={colors.blue} />
               )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Nom de l'article <Text style={{ color: colors.red }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.name && errors.name && { borderColor: colors.red },
                  ]}
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  placeholder="Ex: Slim Fit Jeans"
                />
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Catégorie <Text style={{ color: colors.red }}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    contentContainerStyle={{ width: 400 }}
                    showsHorizontalScrollIndicator={false}
                  >
                    {productCategories.slice(1, productCategories.length - 1).map((category) => (
                      <TouchableOpacity
                        key={category.en}
                        style={[
                          styles.categoryOption,
                          category.en === selectedCategory &&
                            styles.categoryOptionSelected,
                        ]}
                        onPress={() => setCategory(category.en)}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            category.en === selectedCategory &&
                              styles.categoryOptionTextSelected,
                          ]}
                        >
                          {category.fr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>
                    Prix <Text style={{ color: colors.red }}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.price &&
                        errors.price && { borderColor: colors.red },
                    ]}
                    value={values.price}
                    onChangeText={handleChange("price")}
                    onBlur={handleBlur("price")}
                    placeholder="000"
                    keyboardType="numeric"
                  />
                  {touched.price && errors.price && (
                    <Text style={styles.errorText}>{errors.price}</Text>
                  )}
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>
                    Stock <Text style={{ color: colors.red }}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.stock &&
                        errors.stock && { borderColor: colors.red },
                    ]}
                    value={values.stock}
                    onChangeText={handleChange("stock")}
                    onBlur={handleBlur("stock")}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                  {touched.stock && errors.stock && (
                    <Text style={styles.errorText}>{errors.stock}</Text>
                  )}
                </View>
              </View>

              {values.price && values.price !== '' && (
                <View style={{ marginBottom: Rs(10) }}>
                  <SwitchCompo
                    label="Réduction"
                    value={isReduc}
                    onValueChange={() => {
                      Keyboard.dismiss()
                      setisReduc(!isReduc)
                    }}
                  />
                </View>
              )}

              {values.price && values.price !== '' && isReduc && (
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Montant</Text>
                    <TextInput
                      style={styles.input}
                      value={reduc.amount.toString()}
                      onChangeText={(text) => {
                        const amount = parseFloat(text) || 0;
                        const price = parseFloat(values.price) || 0;
                        if(amount >= price){
                          return Alert.alert('Attention', 'Le montant doit être inférieur au prix')
                        }
                        const percentage =
                          price > 0 ? (amount / price) * 100 : 0;

                        setReduc({
                          amount: amount,
                          percent: Math.round(percentage * 100) / 100,
                        });
                      }}
                      placeholder="Ex: 5000"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Pourcentage %</Text>
                    <TextInput
                      style={styles.input}
                      value={reduc.percent.toString()}
                      editable={false}
                      onChangeText={(text) => {
                        const percentage = parseFloat(text) || 0;
                        const price = parseFloat(values.price) || 0;
                        if(percentage >= 100){
                          return Alert.alert('Attention', 'Le pourcentage doit être inférieur à 100%')
                        }
                        const amount =
                          price > 0 ? (percentage * price) / 100 : 0;

                        setReduc({
                          amount: Math.round(amount * 100) / 100,
                          percent: percentage,
                        });
                      }}
                      placeholder="Ex: 10"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Image(s) du vêtement</Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: Rs(4),
                    marginTop: Rs(5),
                  }}
                >
                  <ProductImage
                    img={img1?.uri || data.images?.[0]}
                    isExistImg={!!data.images?.[0]}
                    pickImage={pickImage1}
                    removeImage={data.images?.[0]? () => handleSelectImage(data.images?.[0]) : removeImage1}
                  />
                  <ProductImage
                    img={img2?.uri || data.images?.[1]}
                    isExistImg={!!data.images?.[1]}
                    pickImage={pickImage2}
                    removeImage={data.images?.[1]? () =>  handleSelectImage(data.images?.[1]): removeImage2}
                  />
                  <ProductImage
                    img={img3?.uri || data.images?.[2]}
                    isExistImg={!!data.images?.[2]}
                    pickImage={pickImage3}
                    removeImage={data.images?.[2]? () =>  handleSelectImage(data.images?.[2]): removeImage3}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Description <Text style={{ color: colors.red }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { height: Rs(100), textAlignVertical: "top" },
                    touched.description &&
                      errors.description && { borderColor: colors.red },
                  ]}
                  value={values.description}
                  multiline={true}
                  numberOfLines={4}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  placeholder="Décrivez votre article..."
                />
                {touched.description && errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>
            </ScrollView>
          </>
        )}
      </Formik>
            <BottomSheetCompo snapPoints={[Rs(200)]} bottomSheetModalRef={bottomSheetModalRef}>
         <View style={{padding: Rs(20), }} >
          <Text style={{marginBottom: Rs(10)}} >Êtes-vous sûr de vouloir supprimer cette image ?</Text>
          <RoundedBtn action={() => mutateRemoveFile({selectRemoveImg, id})} disabled label="Supprimer" loading={isPendingRemove} />
         </View>
      </BottomSheetCompo>

    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    fontSize: SIZES.lg,
    fontWeight: "600",
    color: "#4F46E5",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  errorText:{
    color:"red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    marginTop: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  categoryOptionSelected: {
    backgroundColor: "#4F46E5",
  },
  categoryOptionText: {
    fontSize: SIZES.xs,
    color: "#666",
    fontWeight: "600",
  },
  categoryOptionTextSelected: {
    color: "#fff",
  },
});
