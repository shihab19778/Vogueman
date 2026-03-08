import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Coupon } from './types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  
  // Coupon logic
  appliedCoupon: Coupon | null;
  setCoupon: (coupon: Coupon | null) => void;
  discountAmount: () => number;
  deliveryCharge: number;
  finalTotal: () => number;
}

export const DELIVERY_CHARGE = 99;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      
      addItem: (product, size, color) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id && item.selectedSize === size && item.selectedColor === color
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, selectedSize: size, selectedColor: color, quantity: 1 }] });
        }
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
          ),
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId && item.selectedSize === size && item.selectedColor === color
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      
      subtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),

      setCoupon: (coupon) => set({ appliedCoupon: coupon }),

      deliveryCharge: DELIVERY_CHARGE,

      discountAmount: () => {
        const coupon = get().appliedCoupon;
        const subtotal = get().subtotal();
        if (!coupon) return 0;
        if (coupon.type === 'percentage') {
          return (subtotal * coupon.value) / 100;
        }
        return coupon.value;
      },

      finalTotal: () => {
        const subtotal = get().subtotal();
        const discount = get().discountAmount();
        const delivery = get().items.length > 0 ? get().deliveryCharge : 0;
        return Math.max(0, subtotal - discount + delivery);
      },
    }),
    {
      name: 'voguemen-cart',
    }
  )
);
