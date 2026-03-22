import { useState, useEffect } from 'react';
import { MenuType } from '../types';
import { urls } from '@/lib/config/urls';
import { noAuthClient } from '@/lib/axios/apiClient';
import { createApiService } from '@/lib/axios/apiService';

const publicApiService = createApiService(noAuthClient);

export const useGetMenu = (params?: Record<string, any>): { categoryFetchingStatus: boolean; category: MenuType[] } => {
  const [category, setCategory] = useState<MenuType[]>([]);
  const [categoryFetchingStatus, setCategoryFetchingStatus] = useState<boolean>(false);

  useEffect(() => {
    const getMainCategory = async () => {
      setCategoryFetchingStatus(true);
      try {
        const res = await publicApiService.get<{ categories: MenuType[] }>(urls['all-category'], { params });
        setCategory(res.categories);

      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategory([]);
      } finally {
        setCategoryFetchingStatus(false);
      }
    };

    getMainCategory();
  }, [JSON.stringify(params)]); // refetch if params change

  return { categoryFetchingStatus, category };
};

