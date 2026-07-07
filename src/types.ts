export interface VariantOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  isChefSpecial?: boolean;
  isPopular?: boolean;
  variants?: {
    spicyLevel?: string[]; // 'Mild', 'Medium', 'Hot', 'Extra Hot'
    extraCheese?: boolean;
    extraButter?: boolean;
  };
  prepTime: number; // in minutes
}

export interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved';
  qrUrl: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  instructions?: string;
  selectedVariants?: {
    spicyLevel?: string;
    extraCheese?: boolean;
    extraButter?: boolean;
  };
}

export interface Order {
  id: string;
  tokenNumber: number;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  serviceCharge: number;
  total: number;
  status: 'pending_payment' | 'accepted' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod: 'pay_now' | 'pay_later';
  paymentDetails?: {
    method: 'upi' | 'card' | 'net_banking' | 'wallet';
    transactionId?: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedTime: number; // in minutes
}

export interface AssistanceRequest {
  id: string;
  tableNumber: number;
  type: 'water' | 'bill' | 'assistance';
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface Feedback {
  id: string;
  rating: number; // 1 to 5
  feedbackText: string;
  name: string;
  phone?: string;
  email?: string;
  tipAmount: number;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_order' | 'assistance' | 'payment_received' | 'cancelled';
  timestamp: string;
  isRead: boolean;
  tableNumber?: number;
}

export interface RestaurantSettings {
  restaurantName: string;
  address: string;
  phone: string;
  openingHours: string;
  gstPercentage: number;
  serviceChargePercentage: number;
  currency: string;
  themeColor: string;
  logoUrl?: string;
  bannerUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  isActive: boolean;
}
