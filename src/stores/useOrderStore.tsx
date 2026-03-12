import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OrderType } from '@/types/OrderType'

type OrderStoreType = {
  selectedOrder: OrderType | null
  setSelectedOrder: (order: OrderType) => void
  clearSelectedOrder: () => void
}

const initialState = {
  selectedOrder: null
}

export const useOrderStore = create<OrderStoreType>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedOrder: (order: OrderType) => {
        set({ selectedOrder: order })
      },

      clearSelectedOrder: () => {
        set({ selectedOrder: null })
      },
    }),
    {
      name: 'order-storage',
    }
  )
)
