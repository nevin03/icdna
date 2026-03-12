import React, { useState, useCallback } from 'react';
import { createApiService } from '@/lib/axios/apiService';
import { urls } from '@/lib/config/urls';
import { UserDataType } from '@/types/UserType';
import authClient from '@/lib/axios/authClient';

export interface UserFormDataType {
  name: string
  email: string
  mobile_number?: string
  address?: string
  pincode?: string
  referral_code?: string
  state?: string
  city?: string
  landmark?: string
  building_number?: string
}

export type UpdateProfileReturn = {
  status: number
  message: string
  data: UserDataType | null
  error?: any
}


interface UseUpdateProfileReturn {
  updateProfile: () => Promise<UpdateProfileReturn>;
  handleFormInput: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  syncInitialData: (data: Partial<UserFormDataType>) => void;
}

const privateApiService = createApiService(authClient);

export const useUpdateProfile = (): UseUpdateProfileReturn => {

  const initialUserData = React.useRef<UserFormDataType>({
    name: localStorage.getItem('name') || "",
    email: localStorage.getItem('email') || "",
    mobile_number: localStorage.getItem('mobile_number') || "",
    address: localStorage.getItem('address') || "",
    pincode: localStorage.getItem('pincode') || "",
    state: localStorage.getItem('state') || "",
    city: localStorage.getItem('city') || "",
    landmark: localStorage.getItem('landmark') || "",
    building_number: localStorage.getItem('building_number') || "",
  })

  const userFormData = React.useRef<UserFormDataType>({
    ...initialUserData.current
  })

  const [isUpdateInProgress, setIsUpdateInProgress] = useState<boolean>(false) // :check

  const handleFormInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    userFormData.current = {
      ...userFormData.current,
      [name]: value,
    };
  };

  const getChangedData = (): Partial<UserFormDataType> => {
    const changedData: Partial<UserFormDataType> = {}

    Object.keys(userFormData.current).forEach((key) => {
      const typedKey = key as keyof UserFormDataType
      const currentValue = userFormData.current[typedKey]
      const initialValue = initialUserData.current[typedKey]
      if (currentValue !== initialValue) {
        changedData[typedKey] = currentValue
      }
    })
    return changedData
  }

  const updateProfile = useCallback(async (): Promise<UpdateProfileReturn> => {
    if (isUpdateInProgress) {
      return { status: 0, message: 'Process denied!, update already in progress', data: null }
    }

    setIsUpdateInProgress(true)
    try {
      const changedData = getChangedData()
      if (Object.keys(changedData).length === 0) {
        return {
          status: 0,
          message: 'No changes detected in profile data',
          data: null
        };
      }

      const res = await privateApiService.put<{ error: string, status: number, user_data: UserDataType }>(urls['profile'], {
        ...changedData
      })
      if (res.status === 1) {
        const relevantUserData: Partial<UserFormDataType> = {
          name: res.user_data?.name || userFormData.current.name,
          email: res.user_data?.email,
          mobile_number: res.user_data?.mobile_number.toString() || userFormData.current.mobile_number,
          address: res.user_data.address,
          pincode: res.user_data?.pincode,
          state: res.user_data?.state,
          city: res.user_data?.city,
          landmark: res.user_data?.landmark,
          building_number: res.user_data?.building_number,
        };
        initialUserData.current = ({
          ...initialUserData.current,
          ...relevantUserData
        })
        userFormData.current = {
          ...userFormData.current,
          ...relevantUserData
        };
        return {
          status: 1,
          message: 'User profile updated successfully',
          data: res.user_data
        }
      } else if (res.status === 0) {
        return {
          status: 0,
          message: res.error || 'Error Occurred during profile update',
          data: null
        }
      } else {
        return {
          status: res.status,
          message: res.error || 'Unexpected response from server',
          data: null
        }
      }

    } catch (error) {
      return { status: 0, message: 'An error occured!', error: error, data: null }
    } finally {
      setIsUpdateInProgress(false)
    }

  }, [setIsUpdateInProgress])

  const syncInitialData = useCallback((data: Partial<UserFormDataType>) => {
    initialUserData.current = {
      ...initialUserData.current,
      ...data
    };
    userFormData.current = {
      ...userFormData.current,
      ...data
    };
  }, []);

  return {
    updateProfile,
    handleFormInput,
    syncInitialData
  };
};
