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
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, Rs, SIZES } from "@/util/comon";
import BackButton from "../form/BackButton";
import { Colors } from "@/constants/Colors";
import useUpload from "@/hooks/useUpload";
import { Image } from "react-native";
import { Formik, useFormikContext } from "formik";
import { INewProduct, ProductSchema } from "@/constants/formSchemas/product";
import { productCategories } from "@/utils";
import useNewProduct from "@/hooks/mutations/store/useNewProduct";
import { SwitchCompo } from "../SwitchCompo";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import RoundedBtn from "../form/RoundedBtn";

type Props = {
  closeModal?: () => void;
};

function ProductImage({
  img,
  pickImage,
  removeImage,
}: {
  img: string | null;
  pickImage: () => void;
  removeImage: () => void;
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
            source={{ uri: img }}
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

const FormikTextInput = React.memo(({ name, placeholder, style, multiline, numberOfLines, ...rest }) => {
  const { handleChange, handleBlur, values, errors, touched } = useFormikContext();

  return (
    <>
      <TextInput
        style={[
          style,
          touched[name] && errors[name] && { borderColor: 'red' },
        ]}
        value={values[name]}
        onChangeText={handleChange(name)}
        onBlur={handleBlur(name)}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...rest}
      />
      {touched[name] && errors[name] && (
        <Text style={{ color: 'red', fontSize: 12 }}>{errors[name]}</Text>
      )}
    </>
  );
});


const AddArticle = ({ closeModal }: Props) => {
  const [selectedCategory, setCategory] = useState(productCategories[1].en);
  const [reduc, setReduc] = useState({ amount: 0, percent: 0 });
  const [isReduc, setisReduc] = useState(false);

  const { singleImage, pickImage } = useUpload(true);
  const {
    singleImage: img1,
    pickImage: pickImage1,
    resetsingleImage: removeImage,
  } = useUpload(true);
  const {
    singleImage: img2,
    pickImage: pickImage2,
    resetsingleImage: removeImage2,
  } = useUpload(true);
  const {
    singleImage: img3,
    pickImage: pickImage3,
    resetsingleImage: removeImage3,
  } = useUpload(true);

  const { mutate, isPending } = useNewProduct(goToArcle);
  const router = useRouter();

  function goToArcle(){
    router.push('/(store)/articles')
  }


  function resetProduct(resetForm: () => void){
    resetForm()
    setCategory(productCategories[0].en)
    setReduc({ amount: 0, percent: 0 })
    setIsReduc(false)
    removeImage1()
    removeImage2()
    removeImage3()
  }
  

  // Helper function to calculate reduction
  const calculateReduction = (amount: number, price: number) => {
    return price > 0 ? (amount / price) * 100 : 0;
  };

  const calculateAmount = (percentage: number, price: number) => {
    return price > 0 ? (percentage * price) / 100 : 0;
  };

  async function handleAddProduct(values: INewProduct, resetForm: () => void) {
    try {
      const productData = {
        ...values,
        category: selectedCategory,
        images: [img1, img2, img3].filter(Boolean),
        reduction: 0 //isReduc ? reduc.percent : null,
      };
      
      // console.log('Product data:', productData);
      mutate(productData, () => {
        resetProduct(resetForm)
      });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }
  return (
    <SafeAreaView style={styles.modalContainer}>
      <Formik
        initialValues={{
          name: "",
          description: "",
          price: "",
          // reduction: "",
          stock: "",
        }}
        validationSchema={ProductSchema}
        onSubmit={(values, restForm) => handleAddProduct(values, restForm)}
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
              <Text style={styles.modalTitle}>Nouvel article</Text>
              <TouchableOpacity onPress={() => {
                console.log("))))))))))))))))", isValid)
                if(!img1 && !img2 && !img3){
                  return alert("Veuillez ajouter au moins une image")
                }else {
                    console.log("))))))))))))))))", values)
                  handleSubmit()
                  
                }

                }}>
               {!isPending? <Text style={styles.saveButton}>Ajouter</Text>: <ActivityIndicator size="small" color={colors.blue} />}
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
                    // contentContainerStyle={{ width: 400 }}
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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

              {/* {values.price && 
              <View style={{ marginBottom: Rs(6) }}>
                <SwitchCompo
                  label="Réduction"
                  value={isReduc}
                  onValueChange={() =>{
                    Keyboard.dismiss()
                    setisReduc(!isReduc)
                  }}
                />
              </View>
}
              {values.price && isReduc && (
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Montant </Text>
                    <TextInput
                      style={styles.input}
                      value={reduc.amount.toString()}
                      onChangeText={(text) => {
                        const amount = parseFloat(text) || 0;
                        const price = parseFloat(values.price) || 0;
                        if(amount >= price){
                          return Alert.alert('Attention', 'Le montant doit être inférieur au prix')
                        }
                        const percentage = price > 0 ? (amount / price) * 100 : 0;

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
                      onChangeText={(text) => {
                        const percentage = parseFloat(text) || 0;
                        const price = parseFloat(values.price) || 0;
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
              )} */}

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
                    img={img1?.uri}
                    pickImage={pickImage1}
                    removeImage={removeImage}
                  />
                  <ProductImage
                    img={img2?.uri}
                    pickImage={pickImage2}
                    removeImage={removeImage2}
                  />
                  <ProductImage
                    img={img3?.uri}
                    pickImage={pickImage3}
                    removeImage={removeImage3}
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

              {/* <RoundedBtn action={handleSubmit} disabled={isPending}  label="Ajouter" /> */}
            </ScrollView>
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default React.memo(AddArticle);

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
