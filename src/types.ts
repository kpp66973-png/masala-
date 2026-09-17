export interface RestaurantSettings {
  id: number;
  restaurantName: string;
  address: string;
  phone: string;
  instagramUsername: string;
  instagramUrl: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  description?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  vegOrNonveg: 'veg' | 'non-veg';
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  itemTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number | null;
  userUid?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'received' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  notes?: string | null;
  razorpayOrderId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
}

export interface UserProfile {
  id?: number;
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin';
  createdAt?: string;
}
