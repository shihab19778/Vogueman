export type Category = "T-Shirt" | "Panjabi" | "Polo Shirt" | "Pants" | "Trousers";
export type OrderStatus = "Pending" | "Shipped" | "Delivered" | "Cancelled";
export type CouponType = "percentage" | "flat";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  subCategory?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  trending: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: any;
}

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface CartItem extends Product {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface Order {
  id?: string;
  customerName: string;
  phone: string;
  address: string;
  uid?: string;
  items: {
    productId: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod: "COD";
  createdAt: any;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  expiryDate: string;
  active: boolean;
}
