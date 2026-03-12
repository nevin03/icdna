'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthModal } from './AuthModal';
import { useAuthModal } from '../hooks/useAuthModal';
import { createApiService } from '@/lib/axios/apiService';
import authClient from '@/lib/axios/authClient';
import { urls } from '@/lib/config/urls';
import { stores } from '@/stores';
import Cookies from 'js-cookie';

interface AuthContextType {
  openAuthModal: (redirectUrl?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const privateApiService = createApiService(authClient);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isOpen, openAuthModal, closeAuthModal, redirectUrl } = useAuthModal();
  const pathname = usePathname();
  const updateWalletAmount = stores.useWalletStore((state) => state.updateAmount);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get('authToken');
      if (!token) return;

      try {
        const response = await privateApiService.get<any>(urls.profile);
        if (response.status === 1 && response.user_data) {
          const userData = response.user_data;

          if (userData.name) localStorage.setItem('name', userData.name);
          if (userData.email) localStorage.setItem('email', userData.email);
          if (userData.mobile_number) localStorage.setItem('mobile_number', userData.mobile_number.toString());
          if (userData.address) localStorage.setItem('address', userData.address);
          if (userData.pincode) localStorage.setItem('pincode', userData.pincode);
          if (userData.state) localStorage.setItem('state', userData.state);
          if (userData.city) localStorage.setItem('city', userData.city);
          if (userData.landmark) localStorage.setItem('landmark', userData.landmark);
          if (userData.building_number) localStorage.setItem('building_number', userData.building_number);
          if (userData.estimated_delivery_days !== undefined) localStorage.setItem('estimated_delivery_days', userData.estimated_delivery_days.toString());

          if (userData.wallet !== undefined) {
            updateWalletAmount(userData.wallet.toString());
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    fetchProfile();
  }, [pathname, updateWalletAmount]);

  const handleAuthSuccess = () => {
    // You can add any additional logic here after successful authentication
    console.log('Authentication successful');
  };

  return (
    <AuthContext.Provider
      value={{
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen: isOpen,
      }}
    >
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
        redirectUrl={redirectUrl}
      />
    </AuthContext.Provider>
  );
};
