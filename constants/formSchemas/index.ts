import * as Yup from "yup";
import { getPhoneCountryByValue, getPhoneLocalDigits } from "../phoneCountries";

const phoneByCountrySchema = Yup.string()
  .required("Entrez votre numéro de téléphone")
  .test("valid-country-phone", function (value) {
    if (!value) return true;

    const country = getPhoneCountryByValue(value);

    if (!country) {
      return this.createError({
        message: "Sélectionnez un indicatif pays valide",
      });
    }

    const localDigits = getPhoneLocalDigits(value, country);

    if (!/^\+[1-9][0-9]+$/.test(value)) {
      return this.createError({
        message:
          "Le numéro doit contenir l'indicatif du pays et uniquement des chiffres",
      });
    }

    if (localDigits.length !== country.phoneLength) {
      return this.createError({
        message: `Le numéro ${country.name} doit contenir ${country.phoneLength} chiffres`,
      });
    }

    return true;
  });

const personNameSchema = (fieldName: string) =>
  Yup.string()
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .min(2, `${fieldName} doit contenir au moins 2 caractères`)
    .max(50, `${fieldName} ne doit pas dépasser 50 caractères`)
    .matches(
      /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
      `${fieldName} ne doit contenir que des lettres`,
    )
    .required(`Entrez votre ${fieldName.toLowerCase()}`);

export const loginSchema = Yup.object().shape({
  phone: phoneByCountrySchema,
  password: Yup.string()
    .required("Entrez votre code secret")
    .matches(/^[0-9]+$/, {
      message: "Le code ne doit contenir que des chiffres",
      excludeEmptyString: true,
    })
    .length(5, "Le code secret doit contenir 5 chiffres"),
});

export const signUpSchema = Yup.object().shape({
  name: personNameSchema("Nom"),
  lastname: personNameSchema("Prénom"),
  phone: phoneByCountrySchema,
  //  email: Yup.string().email("L'email n'est pas valide").required("Entrez votre email"),
  password: Yup.string()
    .required("Entrez votre code secret")
    .matches(/^[0-9]+$/, {
      message: "Le code ne doit contenir que des chiffres",
      excludeEmptyString: true,
    })
    .length(5, "Le code secret doit contenir 5 chiffres"),
});

export const userSchema = Yup.object().shape({
  fullName: Yup.string().required("Entrez le nom complet "),

  phone: Yup.string()
    .matches(
      /^[0-9]+$/,
      "Le numéro de téléphone ne doit contenir que des chiffres",
    )
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .required("Entrez votre numéro de téléphone"),
  password: Yup.string()
    .min(6, "Le mot de passe doit être au moins 6 caractères")
    .required("Entrez votre mot de passe"),
});

export const pwForgotSchema = Yup.object().shape({
  phone: phoneByCountrySchema,
});

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("Entrez votre nouveau mot de passe")
    .min(5, "Le mot de passe doit contenir au moins 5 caractères"),
  confirmPassword: Yup.string()
    .required("Confirmez votre nouveau mot de passe")
    .oneOf([Yup.ref("newPassword")], "Les mots de passe ne correspondent pas"),
});

export const orderSchema = Yup.object().shape({
  quantite: Yup.string().required("Entrez la quantité"),
  amount: Yup.string().required("Entrez le montant"),
  paiement: Yup.string().required("Entrez l'avance"),
});

export const measurementSchema = Yup.object().shape({
  quantity: Yup.string()
    .required("Quantity is required")
    .matches(/^[0-9]+$/, "Quantity must be a number"),
  amount: Yup.string()
    .required("Amount is required")
    .matches(/^[0-9]+$/, "Amount must be a number"),
  paiement: Yup.string()
    .required("Payment is required")
    .matches(/^[0-9]+$/, "Ce champs doit contenir des chiffres"),
  // Add more fields as needed
});

export const newClientSchema = Yup.object().shape({
  name: Yup.string().required("Entrez le nom"),
  lastname: Yup.string().required("Entrez le(s) prénom(s)"),
  telephone: Yup.string()
    .required("Champs obligatoire")
    .matches(/^[0-9]+$/, "Ce champs doit contenir des chiffres"),
});

export type newClientValuesType = Yup.InferType<typeof newClientSchema>;

export const StoreSchema = Yup.object().shape({
  store_name: Yup.string()
    .min(2, "Trop court!")
    .max(50, "Trop long!")
    .required("Le nom de la boutique est requis"),
  store_description: Yup.string().min(2, "Trop court!").max(100, "Trop long!"),
  //  .required('Le nom de la boutique est requis'),
  store_slogan: Yup.string().min(2, "Trop court!").max(100, "Trop long!"),
  //  .required('Le nom de la boutique est requis'),
  phone: phoneByCountrySchema,
  whatsapp: Yup.string()
    .matches(/^[0-9]+$/, "Doit être uniquement des chiffres")
    .min(8, "Trop court!")
    .max(15, "Trop long!"),
  location: Yup.string(),
});
