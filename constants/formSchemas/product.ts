import * as Yup from "yup";
import { InferType } from "yup";

export const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Entrez le du produit"),
  description: Yup.string().required("Entrez le du produit"),
  price: Yup.string().required("Entrez le du produit"),
  stock: Yup.string().required("Entrez le stock"),
  // reduction: Yup.number(),
});

export type INewProduct = InferType<typeof ProductSchema>;
