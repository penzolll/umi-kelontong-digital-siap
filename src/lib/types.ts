
export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  stock: number;
  description: string;
  isFeatured?: boolean;
  isPromo?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'cod' | 'bank-transfer';

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  customerName: string;
  address: string;
  phone: string;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'customer';
}
