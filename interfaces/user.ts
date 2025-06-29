export interface IUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Ttoklo_men {
  toklo_men: Toklomen;
  token: string;
  toklo_user?: ITokloUser;
}

export interface ITokloUser {
  id: number;
  phone: string;
  fullName: string;
  password: string;
  createdat: string;
  updatedat: string;
}

export interface IStore{
  store_name?: string  
  store_slogan?: string  
  store_description?: string  
  store_logo?: string  
  store_coverImg?: string  
  location?: {}
  whatsapp?: string
}

export interface Toklomen extends IStore{
  id: number;
  name: string;
  lastname: string;
  phone: string;
  photo: string;
  subscribe: boolean;
  updatedat: string;
  notif_monrning?: string  | null
  notif_evening?: string  | null
  notif_midday?: string | null;
  notif_remind_days?: number;
  notif_remind_seven?: number;
  notif_remind_three?: number;
  notif_remind_two?: number;
  notif_remind_one?: number;
  
}

