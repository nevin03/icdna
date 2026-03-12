'use client';

import { useState, useCallback } from 'react';

interface UseAuthModalReturn {
  isOpen: boolean;
  openAuthModal: (redirectUrl?: string) => void;
  closeAuthModal: () => void;
  redirectUrl?: string;
}

export const useAuthModal = (): UseAuthModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>();

  const openAuthModal = useCallback((redirectUrl?: string) => {
    setRedirectUrl(redirectUrl);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    setRedirectUrl(undefined);
  }, []);

  return {
    isOpen,
    openAuthModal,
    closeAuthModal,
    redirectUrl
  };
};
