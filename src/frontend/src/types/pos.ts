
export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface ProductSubCategory {
  id: string;
  name: string;
  additionalPrice: number;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
  description: string;
  status: "available" | "out_of_stock" | "coming_soon";
  subCategories?: ProductSubCategory[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSubCategory?: ProductSubCategory;
  customerNote?: string;
  orderId?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: "pending" | "processing" | "completed" | "cancelled";
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  createdAt: Date;
  completedAt?: Date;
  paymentMethod?: string;
  cryptoToken?: string;
}
