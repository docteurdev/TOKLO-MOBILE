import * as Yup from "yup";

export const loginSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[0-9]+$/, "Le numéro de téléphone ne doit contenir que des chiffres")
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .required("Entrez votre numéro de téléphone"),
  password: Yup.string()
    .min(6, "Le mot de passe doit être au moins 6 caractères")
    .required("Entrez votre mot de passe"),
});

export const signUpSchema = Yup.object().shape({
 name: Yup.string().required("Entrez votre nom "),
 lastname: Yup.string().required("Entrez votre prénom "),
 phone: Yup.string()
    .matches(/^[0-9]+$/, "Le numéro de téléphone ne doit contenir que des chiffres")
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    // .max(10, "Le numéro de téléphone ne peut pas dépasser 15 chiffres")
    .required("Entrez votre numéro de téléphone"),
//  email: Yup.string().email("L'email n'est pas valide").required("Entrez votre email"),
  password: Yup.string()
    .min(6, "Le mot de passe doit être au moins 6 caractères")
    .required("Entrez votre mot de passe"),
});

export const userSchema = Yup.object().shape({
   fullName: Yup.string().required("Entrez le nom complet "),

  phone: Yup.string()
    .matches(/^[0-9]+$/, "Le numéro de téléphone ne doit contenir que des chiffres")
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .required("Entrez votre numéro de téléphone"),
  password: Yup.string()
    .min(6, "Le mot de passe doit être au moins 6 caractères")
    .required("Entrez votre mot de passe"),
});

export const pwForgotSchema = Yup.object().shape({
 phone: Yup.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres").required("Entrez votre numéro de téléphone"),
 
});

export const orderSchema = Yup.object().shape({
 quantite: Yup.string().required("Entrez la quantité"),
 amount: Yup.string().required("Entrez le montant"),
 paiement: Yup.string().required("Entrez l'avance"),
});

export const measurementSchema = Yup.object().shape({
 quantity: Yup.string()
   .required('Quantity is required')
   .matches(/^[0-9]+$/, 'Quantity must be a number'),
 amount: Yup.string()
   .required('Amount is required')
   .matches(/^[0-9]+$/, 'Amount must be a number'),
 paiement: Yup.string()
   .required('Payment is required')
   .matches(/^[0-9]+$/, 'Ce champs doit contenir des chiffres'),
 // Add more fields as needed
});

// Schéma dynamique pour les mesures de vêtements
export const createDressMeasureSchema = (measureTypes: string[]) => {
  const measureFields = measureTypes.reduce((acc, measureType) => {
    acc[measureType] = Yup.string()
      .matches(/^[0-9]*\.?[0-9]*$/, 'Doit être un nombre valide')
      .nullable(); // Permet les valeurs vides
    return acc;
  }, {} as Record<string, any>);

  return Yup.object().shape({
    quantity: Yup.string()
      .required('La quantité est requise')
      .matches(/^[0-9]+$/, 'La quantité doit être un nombre'),
    amount: Yup.string()
      .required('Le montant est requis')
      .matches(/^[0-9]+(\.[0-9]{1,2})?$/, 'Le montant doit être un nombre valide'),
    paiement: Yup.string()
      .matches(/^[0-9]*(\.[0-9]{1,2})?$/, 'Le paiement doit être un nombre valide')
      .test('payment-validation', 'L\'avance ne peut pas être supérieure au montant total', function(value) {
        const { amount, quantity } = this.parent;
        if (!value || !amount || !quantity) return true;
        const total = parseFloat(amount) * parseFloat(quantity);
        return parseFloat(value) <= total;
      }),
    measures: Yup.object().shape(measureFields).optional(), // Rendre les mesures optionnelles
    comment: Yup.string().optional(), // Ajouter le champ commentaire comme optionnel
  });
};

export type DressMeasureFormValues = {
  quantity: string;
  amount: string;
  paiement: string;
  measures?: Record<string, string>; // Optionnel
  comment?: string; // Optionnel
};

export const newClientSchema = Yup.object().shape({
  name: Yup.string().required("Entrez le nom"),
  lastname: Yup.string().required("Entrez le(s) prénom(s)"),
  telephone: Yup.string().required("Champs obligatoire").matches(/^[0-9]+$/, 'Ce champs doit contenir des chiffres'),
 });

 export type newClientValuesType = Yup.InferType<typeof newClientSchema>;


 export const StoreSchema = Yup.object().shape({
   store_name: Yup.string()
     .min(2, 'Trop court!')
     .max(50, 'Trop long!')
     .required('Le nom de la boutique est requis'),
     store_description: Yup.string()
     .min(2, 'Trop court!')
     .max(100, 'Trop long!'),
    //  .required('Le nom de la boutique est requis'),
     store_slogan: Yup.string()
     .min(2, 'Trop court!')
     .max(100, 'Trop long!'),
    //  .required('Le nom de la boutique est requis'),
   phone: Yup.string()
     .matches(/^[0-9]+$/, "Doit être uniquement des chiffres")
     .min(8, 'Trop court!')
     .max(15, 'Trop long!')
     .required('Le numéro de téléphone est requis'),
   whatsapp: Yup.string()
     .matches(/^[0-9]+$/, "Doit être uniquement des chiffres")
     .min(8, 'Trop court!')
     .max(15, 'Trop long!'),
   location: Yup.string(),
 });
 
 
