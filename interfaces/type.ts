export type TInvoice = {
  storeName: string;
  sotreSlogan: string;
  storeAddress: string;
  storePhone: string;
  clientFullName: string;
  clientPhone: string;
  invoiceNumber: string;
  invoiceDate: string;
  staus: string;
  dressName: string;
  quantite: string;
  price: number;
  totalPrice: number;
  paiement: number;
  biTotal: number;
}

export type UploadImgProps = {
 uri: string;
 fileName: string;
 mineType: string;
};

export interface ICountry {
 name: {
   common: string;
   official: string;
 };
 flags: {
   png: string;
 };
 idd: {
   root: string;
   suffixes: string[];
 };
 translations: {
   fra: {
     official: string;
   };
 };
 latlng: [number,number]
}

export enum EDressStatus {
  ONGOING = "ONGOING",
  FINISHED = "FINISHED",
  DELIVERED = "DELIVERED"
}

export interface IDressType {
  status: EDressStatus;
}


export type TImage = {
  uri: string;
  fileName: string;
  mineType: string;
}

export interface IOrder {
  id: number;
  quantite: string;
  tissus: string;
  status: IDressType;
  measure: Measure;
  date_depote: string;
  date_remise: string;
  deliveryHour: string;
  amount: string;
  paiement: string;
  description: string;
  photos: string;
  solde_cal: string;
  client_name?: any;
  client_phone?: any;
  client_lastname?: any;
  Toklo_menId: number;
  client_Id: number;
  Clients: IClient;
  updatedat: Date;
}

export type TNotif ={
  id: number;
  orderId: number;
  fullName: string;
  phone: string;
  remind_date: string;
  remind_time: string;
}


export interface clientOrderStat {
  totalOrders: number;
  totalAmount: number;
  ordersCompleted: number;
}

export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  coverImg: string;
  images: string[];
  reduction: number;
  stock: number;
  category: string;
  isActiveReduction: boolean;
  tokloman_id: number;
  updatedat: string;
}

export enum ProductCategory {
  DRESS = "DRESS",
  PANTS = "PANTS",
  SHIRT = "SHIRT",
  SKIRT = "SKIRT",
  JACKET = "JACKET",
  COAT = "COAT",
  SUIT = "SUIT",
  OTHER = "OTHER"
}

export interface CategoryCount {
  _count: number;
}

export type ProductCategoryCountMap = {
  [key in ProductCategory]: CategoryCount;
};

export interface ProductOrderItem {
  name: string;
  price: number;
  quantity: number;
}

export type TOrderStatus = 'PENDING' | 'DELIVERED' | 'AVOIDED' | 'ONGOING' | 'CANCELLED';
export interface IProductOrder {
  id: number;
  orderNumber: string;
  customer: {
    phone: string;
    fullName: string;
  };
  items: ProductOrderItem[];
  total: number;
  status: TOrderStatus ;
  shippingAdress: string;
  storeId: number;
  reduction?: number;
  createdAt: string; // or Date if parsed
}



export interface IClient {
  id: number;
  name: string;
  lastname: string;
  telephone: string;
  adresse: string;
  Toklo_menId: number;
  _count: {
			orders: number;
		}
}

interface Measure {
  cou: number;
  taille: number;
  'tour-ventre': number;
}

interface TypeMesure {
  id: number;
  nom: string;
  description: string;
  unite: string;
  updatedat: string;
}

export interface CategorieMesure {
  categorieid: number;
  typemesureid: number;
  obligatoire: boolean;
  ordre: number;
  typemesure: TypeMesure;
}

export interface IDress {
  id: number;
  nom: string;
  genre: string;
  updatedat: string;
  categoriemesure: CategorieMesure[];
}

export interface SendOrder {
  quantite: string;
  amount: string;
  paiement: string;
}

export interface ICatalogue {
  id: number;
  name: string,
  image: string,
  description: string
  toklo_menid: number
}

type IStatsDate = {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  isPartialWeek: boolean;
  amount: number;
  count: number;
  statusCounts: {
    FINISHED: number;
    ONGOING: number;
    DELIVERED: number;
    CANCELLED: number;
  };
  statusAmounts: {
    FINISHED: number;
    ONGOING: number;
    DELIVERED: number;
    CANCELLED: number;
  };
  daysInMonth: number;
};


export interface IPlan {
  id: number;
  name: string;
  price: number;
  description: string;
  type: string;
  items: {
    features: string[];
  };
  numb_order: number;
  numb_catalog: number;
}

export interface ISubscription {
  id: number;
  startdate: string;
  enddate: string;
  status: boolean;
  toklo_menid: number;
  numb_order: number;
  numb_catalog: number;
  updatedat: string;
}

export enum EStatsPeriode {
  daily = 'daily',
  weekly = 'weekly',
}

type IStatsSummary = {
  totalAmount: number;
  totalOrders: number;
  totalFinishedAmount: number;
  totalOngoingAmount: number;
  totalDeliveredAmount: number;
  totalCancelledAmount: number;
  totalFinishedOrders: number;
  totalOngoingOrders: number;
  totalDeliveredOrders: number;
  totalCancelledOrders: number;
  percentages: {
				// finishedOrdersPercent: string,
				// ongoingOrdersPercent: string,
				// deliveredOrdersPercent: string,
				// cancelledOrdersPercent: string,
				finishedAmountPercent: string,
				ongoingAmountPercent: string,
				deliveredAmountPercent: string,
				cancelledAmountPercent: string
			}
};

type IStatsMetadata = {
  month: number;
  year: number;
  totalWeeks: number;
  fullWeeks: number;
};

export interface IStats {
  success: boolean;
  data: {
    weekly?: IStatsDate[]; // Present when periode is 'weekly'
    summary: IStatsSummary;
    metadata: IStatsMetadata;
  };
}

// measurement references

// https://dribbble.com/shots/8375158-Kulture-Athletics-Measure/attachments/694941?mode=media

