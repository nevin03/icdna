'use client';

import { useRouter as useNextRouter } from 'next/navigation';
import { stores } from '../stores';

/**
 * Enhanced router hook that automatically tracks navigation history
 * Use this instead of useRouter from next/navigation for automatic history tracking
 */
export const useTrackedRouter = () => {
  const router = useNextRouter();
  const { pushToStack, isTabNavigatorUrl } = stores.useNavigationStore();

  const push = (url: string) => {
    console.log('🚀 TrackedRouter: Pushing to URL:', url);
    
    // Only push to stack if we're not navigating to tab navigator
    // Tab navigator navigation is handled separately in TabNavigator component
    if (!isTabNavigatorUrl(url)) {
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.pathname + window.location.search;
        console.log('📍 TrackedRouter: Current URL before navigation:', currentUrl);
        
        // Push current URL to stack before navigating
        if (!isTabNavigatorUrl(currentUrl)) {
          console.log('✅ TrackedRouter: Pushing current URL to stack:', currentUrl);
          pushToStack(currentUrl);
        } else {
          console.log('⚠️ TrackedRouter: Skipping push - current URL is tab navigator');
        }
      }
    } else {
      console.log('⚠️ TrackedRouter: Skipping push - destination is tab navigator');
    }
    
    router.push(url);
  };

  const replace = (url: string) => {
    router.replace(url);
  };

  const back = () => {
    router.back();
  };

  const forward = () => {
    router.forward();
  };

  const refresh = () => {
    router.refresh();
  };

  const prefetch = (href: string) => {
    router.prefetch(href);
  };

  return {
    push,
    replace,
    back,
    forward,
    refresh,
    prefetch,
  };
};
