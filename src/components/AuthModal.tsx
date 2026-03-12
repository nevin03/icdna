'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectUrl?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  redirectUrl
}) => {
  const router = useRouter();
  const popupRef = useRef<Window | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication status
  const checkAuthStatus = () => {
    const token = Cookies.get('authToken');
    if (token) {
      setIsLoading(false);
      onSuccess?.();
      onClose();
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      return true;
    }
    return false;
  };

  // Open popup window for authentication
  const openAuthPopup = () => {
    setIsLoading(true);
    setError(null);

    // Calculate popup position (centered)
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup
    popupRef.current = window.open(
      '/sign-in',
      'auth-popup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popupRef.current) {
      setError('Popup blocked. Please allow popups for this site and try again.');
      setIsLoading(false);
      return;
    }

    // Start polling for authentication and popup status
    checkIntervalRef.current = setInterval(() => {
      // Check if popup was closed by user
      if (popupRef.current?.closed) {
        setIsLoading(false);
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        return;
      }

      // Check if authentication completed
      if (checkAuthStatus()) {
        // Close popup if still open
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
    }, 1000);
  };

  // Handle modal close
  const handleClose = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    setIsLoading(false);
    setError(null);
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  // Auto-open popup when modal opens
  useEffect(() => {
    if (isOpen && !isLoading && !error) {
      // Check if already authenticated
      if (checkAuthStatus()) return;
      
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        openAuthPopup();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Sign In Required</h2>
          <button 
            className="auth-modal-close" 
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="auth-modal-content">
          {!isLoading && !error && (
            <div className="auth-modal-instructions">
              <div className="auth-icon">🔐</div>
              <h3>Authentication Required</h3>
              <p>Please sign in to continue with your action.</p>
              <button 
                className="auth-modal-button"
                onClick={openAuthPopup}
              >
                Open Sign In
              </button>
            </div>
          )}

          {isLoading && (
            <div className="auth-modal-loading">
              <div className="spinner"></div>
              <h3>Authenticating...</h3>
              <p>Please complete the sign-in process in the popup window.</p>
              <button 
                className="auth-modal-button secondary"
                onClick={openAuthPopup}
              >
                Reopen Sign In Window
              </button>
            </div>
          )}
          
          {error && (
            <div className="auth-modal-error">
              <div className="error-icon">⚠️</div>
              <h3>Authentication Error</h3>
              <p>{error}</p>
              <button 
                className="auth-modal-button"
                onClick={openAuthPopup}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
