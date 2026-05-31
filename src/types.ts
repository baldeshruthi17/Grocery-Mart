export interface Address {
  id: string;
  fullAddress: string;
  landmark?: string;
  isDefault: boolean;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  phone: string;
  address: Address[];
  createdAt: string;
  role?: 'customer' | 'admin';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  mrp: number;
  unit: string;
  description: string;
  image: string;
  stock: number;
  isAvailable: boolean;
  discount: number; // percentage discount (e.g., 10 for 10%)
  createdAt: string;
  shopId?: string;
  shopName?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  shopId?: string;
  shopName?: string;
}

export interface OrderAddress {
  fullAddress: string;
  landmark?: string;
  deliverySlot: string;
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Picked Up' | 'On the Way' | 'Out for Delivery' | 'Delivered' | 'Rejected';

export interface Order {
  id: string;
  order_id?: string; // Blinkit field representation
  userId: string;
  customerName: string;
  phone: string;
  address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  total_amount?: number; // Blinkit field representation
  paymentMethod: 'COD' | 'ONLINE';
  payment_method?: 'COD' | 'ONLINE';
  payment_status?: 'PENDING' | 'PAID';
  transaction_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  status: OrderStatus;
  order_status?: 'PENDING' | 'ACCEPTED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'; // Blinkit field representation
  orderDate: string;
  deliveryTime?: string;
  deliveryBoyId?: string;
  assignedRiderName?: string;
  customer_lat?: number;
  customer_lng?: number;
  delivery_address?: string;
  shopId?: string;
  shop_id?: string; // Blinkit field representation
  shopName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // Tailwind bg class color style
}

export interface Admin {
  email: string;
  name: string;
  role: 'super-admin' | 'admin';
  createdAt: string;
}
