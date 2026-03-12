import React, { useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { createApiService } from '@/lib/axios/apiService';
import noAuthClient from '@/lib/axios/noAuthClient';
import { urls } from '@/lib/config/urls';
import { UserAuhType, UserDataType } from '@/types/UserType';
import { useSession } from 'next-auth/react';
import { stores } from '@/stores';

export interface UserFormDataType {
  name: string
  email: string
  mobile_number?: string
  address?: string
  pincode?: string
  referral_code?: string
  wallet?: number
  state?: string
  city?: string
  landmark?: string
  building_number?: string
}


interface UseAuthenticationReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (id: string) => Promise<{ status: number, message: string, data: UserFormDataType | null, error?: any }>;
  login: (id: string) => Promise<{ status: number, message: string, data: UserDataType | null, error?: any }>;
  logout: () => void;
  getAuthToken: () => string | undefined;
  handleFormInput: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void

}

const publicApiService = createApiService(noAuthClient);

export const useAuthentication = (): UseAuthenticationReturn => {

  const { data: session, status } = useSession()

  const userFormData = React.useRef<UserFormDataType>({
    name: '',
    email: '',
    mobile_number: '',
    address: '',
    pincode: '',
    referral_code: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false); // :check
  const [isRegistrationInProgress, setIsRegistrationInProgress] = useState<boolean>(false) // :check
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!Cookies.get('authToken');
  });

  const handleFormInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    userFormData.current = {
      ...userFormData.current,
      [name]: value,
    };
  };

  const register = useCallback(async (id: string): Promise<{ status: number, message: string, data: UserFormDataType | null, error?: any }> => {
    if (isRegistrationInProgress) {
      return { status: 0, message: 'Process denied!, Registration already in progress', data: null }
    }
    if (status === 'authenticated') {
      userFormData.current = {
        ...userFormData.current,
        name: userFormData.current.name.length > 0 ? userFormData.current.name : session.user.name || "",
        email: userFormData.current.email.length > 0 ? userFormData.current.email : session.user.email || ""
      }
    }
    setIsRegistrationInProgress(true)
    try {
      // return {status:7,message:""}
      const res = await publicApiService.post<UserAuhType>(urls['registration'], {
        google_id: id,
        ...userFormData.current
      })
      if (res.status === 1) {
        Cookies.set('authToken', res.access_token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        setIsAuthenticated(true)
        return {
          status: 1,
          message: res.message || 'User registration successfull, Allowed to access protected data',
          data: userFormData.current || null
        }
      } else if (res.status === 0) {
        return {
          status: 0,
          message: res.error || res.message || 'Error occured during registration',
          data: null
        }
      } else {
        return {
          status: res.status,
          message: res.error || res.message || 'Unexpected response from server',
          data: null
        }
      }

    } catch (error) {
      return { status: 0, message: 'An error occured!', error: error, data: null }
    } finally {
      setIsRegistrationInProgress(false)
    }

  }, [isRegistrationInProgress])

  const login = useCallback(async (id: string): Promise<{ status: number, message: string, data: UserDataType | null, error?: any }> => {
    if (isLoading) {
      return { status: 2, message: 'Process denied!, Login already in progress', data: null };
    }
    setIsLoading(true);
    try {
      const res = await publicApiService.post<UserAuhType>(urls['login'], {
        google_id: id
      });

      if (res.status === 1) {
        Cookies.set('authToken', res.access_token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        setIsAuthenticated(true)

        return {
          status: 1,
          message: res.message || 'User authorized to access protected data',
          data: res.user_data
        }
      } else if (res.status === 0) {
        return {
          status: 0,
          message: res.message || 'New user detected, please register',
          data: null
        }
      } else {
        return {
          status: res.status,
          message: res.message || 'Unexpected response from server',
          data: null
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)

      let errorMessage = 'An error occurred, please try again'

      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
      } else if (error.request) {
        errorMessage = 'Network error, please check your connection'
      } else {
        errorMessage = error.message || 'An unexpected error occurred'
      }

      return {
        status: 2,
        message: errorMessage,
        error: error,
        data: null
      }
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  // const updateProfile = useCallback(()=>{

  // },[])

  const logout = useCallback(() => {
    Cookies.remove('authToken')
    localStorage.removeItem('name')
    localStorage.removeItem('email')
    localStorage.removeItem('image')
    localStorage.removeItem('mobile_number')
    localStorage.removeItem('address')
    localStorage.removeItem('pincode')
    localStorage.removeItem('landmark')
    localStorage.removeItem('building_number')
    localStorage.removeItem('state')
    localStorage.removeItem('city')

    // Clear cart and wishlist data
    stores.useCartStore.getState().clearCart()
    stores.useWishlistStore.getState().clearWishlist()

    setIsAuthenticated(false)
  }, [])

  const getAuthToken = useCallback((): string | undefined => {
    return Cookies.get('authToken')
  }, [])

  return {
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    getAuthToken,
    handleFormInput
  };
};
