'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { stores } from '../stores';
import { Routes, TabScreens } from '../routes';

export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { pushToStack, popFromStack, isTabNavigatorUrl, getLastTabScreen } = stores.useNavigationStore();
  const isInitialLoad = useRef(true);
  const [isClient, setIsClient] = useState(false);

  // Ensure this only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track current page in navigation stack only for initial load
  // Subsequent navigation is handled by useTrackedRouter
  useEffect(() => {
    if (isClient && typeof window !== 'undefined' && isInitialLoad.current) {
      // Get search params from window.location to avoid SSR issues
      const searchParams = new URLSearchParams(window.location.search);
      const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      // Push initial page to stack
      pushToStack(currentUrl);
      isInitialLoad.current = false;
    }
  }, [pathname, pushToStack, isClient]);

  const goBack = () => {
    if (!isClient) return;
    
    console.log('🔙 Navigation: Back button clicked');
    const previousUrl = popFromStack();
    
    if (previousUrl) {
      console.log('🎯 Navigation: Navigating to previous URL:', previousUrl);
      // Navigate to the previous URL in the stack
      router.push(previousUrl);
    } else {
      // If no previous URL, go to the last visited tab screen or Home
      const lastTabScreen = getLastTabScreen() || TabScreens.HOME;
      console.log('🏠 Navigation: No previous URL, going to tab screen:', lastTabScreen);
      router.push(`${Routes.TAB_NAVIGATOR}?screen=${lastTabScreen}`);
    }
  };

  const navigateTo = (url: string) => {
    if (!isClient) return;
    
    // Push current URL to stack before navigating (unless it's a tab navigator URL)
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      // Only push current URL if we're not already on tab navigator and not navigating to tab navigator
      if (!isTabNavigatorUrl(currentUrl) && !isTabNavigatorUrl(url)) {
        pushToStack(currentUrl);
      }
    }
    
    router.push(url);
  };

  return {
    goBack,
    navigateTo,
  };
};
