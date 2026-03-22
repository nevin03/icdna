'use client';

import React, { useEffect, useRef } from 'react'; // Added useRef
import Cookies from 'js-cookie';
import {
  useRouter,
  useSearchParams
} from 'next/navigation';

import { stores } from '../../stores';
import { TabScreens, Routes } from '../../routes';

import { Home } from './(screens)/Home';
import { Order } from './(screens)/Order';
import { Wishlist } from './(screens)/Wishlist';
import { OrderEmpty } from './(screens)/OrderEmpty';
import { WishListEmpty } from './(screens)/WishlistEmpty';
import { Notifications } from './(screens)/Notifications';
import { MenuView } from './(screens)/MenuView';

export const TabNavigator: React.FC = React.memo(() => {
  const screen = stores.useTabStore(state => state.screen);
  const setScreen = stores.useTabStore(state => state.setScreen);
  // const cart = stores.useCartStore(state => state.cart);
  const fetchCart = stores.useCartStore(state => state.fetchCart);
  const getOrderedCartItems = stores.useCartStore(state => state.getOrderedCartItems);
  const { pushToStack, setLastTabScreen } = stores.useNavigationStore();

  // Track navigation when screen changes via tab clicks
  const prevScreenRef = useRef(screen);

  const { list: wishlist, fetchWishlist } = stores.useWishlistStore();
  const { fetchNotifications } = stores.useNotificationStore(); // Re-added for URL-based fetching
  const router = useRouter();
  const searchParams = useSearchParams()

  // Authentication guard - prevent back navigation to auth screens
  useEffect(() => {
    // Check if user came from authentication flow and replace history
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      const currentUrl = window.location.href;
      
      // If user came from Google Auth or sign-in pages, replace the history entry
      if (referrer.includes('accounts.google.com') || 
          referrer.includes('/sign-in') || 
          referrer.includes('/callback')) {
        // Replace current history entry to prevent back navigation to auth screens
        window.history.replaceState(null, '', currentUrl);
      }
    }
  }, []);

  // Handle URL query parameters and screen changes
  useEffect(() => {
    const screenParam = searchParams.get('screen') || 'Home';
    setScreen(screenParam);

    if (screenParam === TabScreens.NOTIFICATIONS && !!Cookies.get('authToken')) {
      fetchNotifications();
    }
  }, [searchParams, setScreen, fetchNotifications]);

  // Track navigation when screen changes via tab clicks and store last tab screen
  useEffect(() => {
    // Always update the last tab screen when screen changes
    setLastTabScreen(screen);

    // Only push to stack if screen changed due to user interaction (not URL parameter)
    if (prevScreenRef.current !== screen && prevScreenRef.current !== undefined) {
      const currentUrl = `${Routes.TAB_NAVIGATOR}?screen=${screen}`;
      pushToStack(currentUrl);
    }
    prevScreenRef.current = screen;
  }, [screen, pushToStack, setLastTabScreen]);

  // Update URL when screen changes
  useEffect(() => {
    // Update URL without causing a page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('screen', screen);
      window.history.replaceState({}, '', url.toString());
    }
  }, [screen]);

  const protectedScreens = [TabScreens.ORDER, TabScreens.FAVORITE];

  const isAuthenticated = () => !!Cookies.get('authToken');

  const requiresAuth = (screenName: TabScreens) => protectedScreens.includes(screenName);

  useEffect(() => {
    if (requiresAuth(screen as TabScreens) && !isAuthenticated()) {
      setScreen(TabScreens.HOME);
      router.push('/sign-in');
    }
  }, [screen, router, setScreen]); // Added dependencies

  useEffect(() => {
    const auth = isAuthenticated();
    if (auth) {
      fetchWishlist();
      fetchCart();
    }
  }, [fetchWishlist, fetchCart]);

  const renderScreens = () => {
    if (requiresAuth(screen as TabScreens) && !isAuthenticated()) {
      return <Home />;
    }
    switch (screen) {
      case TabScreens.HOME:
        return <Home />;
      case TabScreens.MENU:
        return <MenuView />;
      case TabScreens.ORDER:
        return getOrderedCartItems().length === 0 ? <OrderEmpty /> : <Order />;
      case TabScreens.FAVORITE:
        return wishlist.length > 0 ? <Wishlist /> : <WishListEmpty />;
      case TabScreens.NOTIFICATIONS:
        return <Notifications />;
      default:
        return <Home />;
    }
  };

  return renderScreens();
});
