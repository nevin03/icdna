'use client';

import Cookies from 'js-cookie';

export const isAuthenticated = (): boolean => {
  return !!Cookies.get('authToken');
};

export const requireAuth = (
  openAuthModal: (redirectUrl?: string) => void,
  redirectUrl?: string
): boolean => {
  if (!isAuthenticated()) {
    openAuthModal(redirectUrl);
    return false;
  }
  return true;
};
