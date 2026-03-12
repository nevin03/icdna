import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createApiService } from '@/lib/axios/apiService'
import { authClient } from '@/lib/axios/apiClient'
import { urls } from '@/lib/config/urls'
import {
  CartResponse,
  Cart,
  CartItem,
  Coupon,
  CouponApplyResponse,
  AppliedCoupon,
} from '@/types/CartDataType'

// Extended response type for add to cart that can include error
interface AddToCartResponse extends Partial<CartResponse> {
  status: number;
  message?: string;
  error?: string;
  cart?: Cart;
  coupons?: Coupon[];
}

const privateApiService = createApiService(authClient)

type CartStateType = {
  cart: Cart | null
  total: number
  delivery: number
  discount: number
  subtotal: number
  promoCode: string
  discountAmount: number
  coupons: Coupon[]
  orderType: 'Instant' | 'Pre-Order'
  preOrderDetails: { date: string | undefined; time: string | undefined } | null
  outOfStockErrors: { [key: string]: string }
  walletAmount: number
  selectedCoupon: AppliedCoupon | null
  couponDiscount: number
  isApplyingCoupon: boolean
  itemOrder: string[] // Array to maintain the order of cart items
  fetchCart: () => Promise<void>
  addToCart: (product_id: number, variant_id: number) => Promise<{ success: boolean; error?: string }>
  removeFromCart: (product_id: number, variant_id: number) => Promise<boolean>
  clearItemFromCart: (product_id: number, variant_id: number) => Promise<boolean>
  setDiscount: (amount: number) => void
  resetCart: () => void
  setPromoCode: (code: string) => boolean
  applyWalletAmount: (amount: number) => void
  removeWalletAmount: () => void
  updateOrderType: (type: 'Instant' | 'Pre-Order') => void
  updatePreOrderDetails: (date: string | undefined, time: string | undefined) => void
  cleanUpPreOrderDetails: () => void
  clearOutOfStockError: (product_id: number, variant_id: number) => void
  applyOrRemoveCoupon: (payload: { code?: string; action?: 'remove' }) => Promise<boolean>
  clearCart: () => void
  getOrderedCartItems: () => CartItem[]
}

const initialState = {
  cart: null,
  total: 0,
  delivery: 0,
  discount: 0,
  subtotal: 0,
  promoCode: '',
  discountAmount: 0,
  walletAmount: 0,
  coupons: [],
  orderType: 'Instant' as const,
  preOrderDetails: null,
  outOfStockErrors: {} as { [key: string]: string },
  selectedCoupon: null,
  couponDiscount: 0,
  isApplyingCoupon: false,
  itemOrder: [] as string[],
}

export const useCartStore = create<CartStateType>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchCart: async () => {
        try {
          const res = await privateApiService.get<CartResponse>(urls['cart-page'])
          if (res.status === 1) {
            const couponDiscount = parseFloat(res.cart.coupon_discount as any) || 0;

            set((state) => {
              // Update item order to include any new items while preserving existing order
              const currentOrder = state.itemOrder;
              const newItems: CartItem[] = res.cart.cart_items || [];
              const newItemKeys: string[] = newItems.map((item: CartItem) => `${item.product.id}_${item.variant.id}`);

              // Keep existing order for items that still exist, add new items at the end
              const updatedOrder: string[] = [
                ...currentOrder.filter((key: string) => newItemKeys.includes(key)),
                ...newItemKeys.filter((key: string) => !currentOrder.includes(key))
              ];

              return {
                cart: res.cart,
                subtotal: parseFloat(res.cart.saleprice_total as any),
                discount: parseFloat(res.cart.discount as any),
                delivery: parseFloat(res.cart.delivery_charge as any),
                total: parseFloat(res.cart.payable_amount as any),
                promoCode: res.cart.applied_coupon?.code || '',
                discountAmount: parseFloat(res.cart.discount as any),
                coupons: res.coupons,
                selectedCoupon: res.cart.applied_coupon,
                couponDiscount: couponDiscount,
                walletAmount: 0,
                itemOrder: updatedOrder
              };
            });
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error)
        }
      },

      addToCart: async (product_id, variant_id) => {
        const errorKey = `${product_id}_${variant_id}`;

        // First, check if the variant has available quantity
        const state = get();
        if (state.cart?.cart_items) {
          // Find the product in current cart to get variant info
          const cartItem = state.cart.cart_items.find(item =>
            item.product.id === product_id && item.variant.id === variant_id
          );

          if (cartItem) {
            const actualVariant = cartItem.product.variants.find(v => v.id === variant_id);
            if (actualVariant && actualVariant.quantity === 0) {
              const errorMessage = 'Item is out of stock';
              set((state) => ({ outOfStockErrors: { ...state.outOfStockErrors, [errorKey]: errorMessage } }));
              return { success: false, error: errorMessage };
            }
          }
        }

        set((state) => {
          const newOutOfStockErrors = { ...state.outOfStockErrors };
          delete newOutOfStockErrors[errorKey];
          return { outOfStockErrors: newOutOfStockErrors };
        });

        try {
          const res = await privateApiService.post<AddToCartResponse>(urls['add-to-cart'], { product_id, variant_id });
          if (res.status === 1 && res.cart) {
            set((state) => {
              // Update item order to maintain existing order and add new items
              const currentOrder = state.itemOrder;
              const newItems: CartItem[] = res.cart!.cart_items || [];
              const newItemKeys: string[] = newItems.map((item: CartItem) => `${item.product.id}_${item.variant.id}`);

              // Keep existing order for items that still exist, add new items at the end
              const updatedOrder: string[] = [
                ...currentOrder.filter((key: string) => newItemKeys.includes(key)),
                ...newItemKeys.filter((key: string) => !currentOrder.includes(key))
              ];

              return {
                cart: res.cart!,
                subtotal: parseFloat(res.cart!.saleprice_total as any),
                discount: parseFloat(res.cart!.discount as any),
                delivery: parseFloat(res.cart!.delivery_charge as any),
                total: parseFloat(res.cart!.payable_amount as any),
                promoCode: res.cart!.applied_coupon?.code || '',
                discountAmount: parseFloat(res.cart!.discount as any),
                walletAmount: 0,
                selectedCoupon: res.cart!.applied_coupon,
                itemOrder: updatedOrder
              };
            });
            return { success: true };
          } else if (res.status === 0 && res.error) {
            const errorMessage = res.error;
            set((state) => ({
              outOfStockErrors: { ...state.outOfStockErrors, [errorKey]: errorMessage }
            }));
            return { success: false, error: errorMessage };
          }
          return { success: false, error: 'Unknown error occurred' };
        } catch (error) {
          console.error('Failed to add to cart:', error);
          const errorMessage = 'Failed to add item to cart';
          set((state) => ({ outOfStockErrors: { ...state.outOfStockErrors, [errorKey]: errorMessage } }));
          return { success: false, error: errorMessage };
        }
      },

      removeFromCart: async (product_id, variant_id) => {
        try {
          const res = await privateApiService.post<CartResponse>(urls['remove-from-cart'], { product_id, variant_id });
          if (res.status === 1) {
            set((state) => {
              // Update item order to maintain existing order and remove items with zero quantity
              const currentOrder = state.itemOrder;
              const newItems: CartItem[] = res.cart.cart_items || [];
              const newItemKeys: string[] = newItems.map((item: CartItem) => `${item.product.id}_${item.variant.id}`);

              // Keep existing order for items that still exist (removes items with zero quantity)
              const updatedOrder: string[] = currentOrder.filter((key: string) => newItemKeys.includes(key));

              return {
                cart: res.cart,
                subtotal: parseFloat(res.cart.saleprice_total as any),
                discount: parseFloat(res.cart.discount as any),
                delivery: parseFloat(res.cart.delivery_charge as any),
                total: parseFloat(res.cart.payable_amount as any),
                promoCode: res.cart.applied_coupon?.code || '',
                discountAmount: parseFloat(res.cart.discount as any),
                walletAmount: 0,
                selectedCoupon: res.cart.applied_coupon,
                itemOrder: updatedOrder
              };
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to remove from cart:', error);
          return false;
        }
      },

      clearItemFromCart: async (product_id, variant_id) => {
        try {
          const res = await privateApiService.post<CartResponse>(urls['delete-cart-item'], { product_id, variant_id });
          if (res.status === 1) {
            set((state) => {
              // Update item order to maintain existing order and remove the deleted item
              const currentOrder = state.itemOrder;
              const newItems: CartItem[] = res.cart.cart_items || [];
              const newItemKeys: string[] = newItems.map((item: CartItem) => `${item.product.id}_${item.variant.id}`);

              // Keep existing order for items that still exist (removes the deleted item)
              const updatedOrder: string[] = currentOrder.filter((key: string) => newItemKeys.includes(key));

              return {
                cart: res.cart,
                subtotal: parseFloat(res.cart.saleprice_total as any),
                discount: parseFloat(res.cart.discount as any),
                delivery: parseFloat(res.cart.delivery_charge as any),
                total: parseFloat(res.cart.payable_amount as any),
                promoCode: res.cart.applied_coupon?.code || '',
                discountAmount: parseFloat(res.cart.discount as any),
                walletAmount: 0,
                selectedCoupon: res.cart.applied_coupon,
                itemOrder: updatedOrder
              };
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to clear item from cart:', error);
          return false;
        }
      },

      applyOrRemoveCoupon: async (payload) => {
        set({ isApplyingCoupon: true });
        try {
          const body = payload.action === 'remove' ? { action: 'remove' } : { code: payload.code };
          const res = await privateApiService.post<CouponApplyResponse>(urls['cart-page'], body);
          if (res.status === 1) {
            // Don't update store with API response, let the component call fetchCart()
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to apply/remove coupon:', error);
          return false;
        } finally {
          set({ isApplyingCoupon: false });
        }
      },

      setDiscount: (amount) => {
        const state = get()
        const newTotal = state.subtotal + state.delivery - amount - state.walletAmount
        set({ discount: amount, discountAmount: amount, total: Math.max(0, newTotal) });
      },
      updateOrderType: (type) => set({ orderType: type }),
      updatePreOrderDetails: (date, time) => set({ preOrderDetails: { date: date || undefined, time: time || undefined } }),
      cleanUpPreOrderDetails: () => set({ preOrderDetails: null }),
      resetCart: () => set(initialState),
      setPromoCode: (code) => {
        const state = get()
        if (code) {
          const promoDiscount = state.subtotal * 0.1;
          const totalDiscount = state.discount + promoDiscount;
          const newTotal = state.subtotal + state.delivery - totalDiscount - state.walletAmount;
          set({ promoCode: code, discountAmount: totalDiscount, total: Math.max(0, newTotal) });
        } else {
          const newTotal = state.subtotal + state.delivery - state.discount - state.walletAmount;
          set({ promoCode: '', discountAmount: state.discount, total: Math.max(0, newTotal) });
        }
        return true;
      },
      applyWalletAmount: (balance) => {
        const state = get();
        const currentTotal = state.subtotal + state.delivery - state.discount;
        const deduction = Math.min(balance, currentTotal);
        const newTotal = currentTotal - deduction;
        set({ walletAmount: deduction, total: Math.max(0, newTotal) });
      },
      removeWalletAmount: () => {
        const state = get();
        const newTotal = state.subtotal + state.delivery - state.discount;
        set({ walletAmount: 0, total: Math.max(0, newTotal) });
      },
      clearOutOfStockError: (product_id, variant_id) => {
        const errorKey = `${product_id}_${variant_id}`;
        set((state) => {
          const newOutOfStockErrors = { ...state.outOfStockErrors };
          delete newOutOfStockErrors[errorKey];
          return { outOfStockErrors: newOutOfStockErrors };
        });
      },
      clearCart: () => set(initialState),

      getOrderedCartItems: () => {
        const state = get();
        if (!state.cart?.cart_items) return [];

        const cartItems: CartItem[] = state.cart.cart_items;
        const itemOrder: string[] = state.itemOrder;

        // If no order is stored, return items as they are
        if (itemOrder.length === 0) {
          return cartItems;
        }

        // Create a map for quick lookup
        const itemMap = new Map<string, CartItem>();
        cartItems.forEach((item: CartItem) => {
          const key = `${item.product.id}_${item.variant.id}`;
          itemMap.set(key, item);
        });

        // Build ordered array based on stored order
        const orderedItems: CartItem[] = [];
        const usedKeys = new Set<string>();

        // First, add items in the stored order
        itemOrder.forEach((key: string) => {
          if (itemMap.has(key)) {
            orderedItems.push(itemMap.get(key)!);
            usedKeys.add(key);
          }
        });

        // Then add any new items that weren't in the stored order
        cartItems.forEach((item: CartItem) => {
          const key = `${item.product.id}_${item.variant.id}`;
          if (!usedKeys.has(key)) {
            orderedItems.push(item);
          }
        });

        return orderedItems;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
