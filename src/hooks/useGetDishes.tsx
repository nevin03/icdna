import {useState, useCallback} from 'react';

import { urls } from '@/lib/config/urls';
import {noAuthClient} from '@/lib/axios/apiClient'
import { createApiService } from '@/lib/axios/apiService';
import { ProductType } from '@/types/DishType';


const publicApiService = createApiService(noAuthClient)

export const useGetDishes = () => {
  const [dishes, setDishes] = useState<ProductType[]>([]);
  const [product, setProduct] = useState<ProductType>();
  const [dishesLoading, setDishesLoading] = useState<boolean>(false);

  const getDishes = useCallback(async () => {
    setDishesLoading(true);

    try {
      const res = await publicApiService.get<{products : ProductType[]}>(urls['recomended-product'], { params: { page_size: 12 } })
      
      setDishes(res.products);
    } catch (error) {
      console.error(error);
    } finally {
      setDishesLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  const getItemById = async (id:number) => {
    setDishesLoading(true);

    try {
      const res = await publicApiService.post<{product : ProductType}>(urls['product-details'],{product_id : id})
      setProduct(res.product)
      
    } catch (error) {
      console.error(error);
    } finally {
      setDishesLoading(false);
    }
  };


  return {
    dishes,
    product,
    getDishes,
    getItemById,
    dishesLoading, 
  };
};
