import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WalletStoreType = {
  amount: string;
  updateAmount: (amount: string) => void;
};

const initialState: Omit<WalletStoreType, 'updateAmount'> = {
  amount: '0',
};

export const useWalletStore = create<WalletStoreType>()(
  persist(
    (set) => ({
      ...initialState,
      updateAmount: (amount: string) => {
        set({ amount });
      },
    }),
    {
      name: 'wallet-data-storage',
    }
  )
);
