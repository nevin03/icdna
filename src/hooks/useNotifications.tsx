'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFCMToken,
  getNotificationPermission,
  enableNotifications,
  disableNotifications,
  areNotificationsEnabled,
  // onMessageListener,
  onTokenRefreshListener
} from '@/notification/firebase.js';
import { createApiService } from '@/lib/axios/apiService';
import { authClient } from '@/lib/axios/apiClient';
import { urls } from '@/lib/config/urls';

interface NotificationState {
  isEnabled: boolean;
  isLoading: boolean;
  permission: NotificationPermission | 'unsupported';
  token: string | null;
  error: string | null;
}

interface UseNotificationsReturn extends NotificationState {
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [state, setState] = useState<NotificationState>({
    isEnabled: false,
    isLoading: false,
    permission: 'default',
    token: null,
    error: null
  });

  const privateApiService = useRef(createApiService(authClient));
  const messageListenerCleanup = useRef<(() => void) | null>(null);
  const tokenRefreshCleanup = useRef<(() => void) | null>(null);

  // Initialize state
  useEffect(() => {
    const initializeState = () => {
      const token = getFCMToken();
      const enabled = areNotificationsEnabled();
      const permission = getNotificationPermission();

      setState(prev => ({
        ...prev,
        isEnabled: !!token && enabled && permission === 'granted',
        permission: permission as NotificationPermission | 'unsupported',
        token
      }));
    };

    initializeState();
  }, []);

  // Set up message listener
  useEffect(() => {
    if (state.isEnabled) {
      // Note: Foreground message handling is done by NotificationListener component
      // This hook focuses on token management and state, not message display
      messageListenerCleanup.current = () => { }; // No-op since NotificationListener handles messages

      // Set up token refresh listener
      tokenRefreshCleanup.current = onTokenRefreshListener(async (newToken: any) => {
        setState(prev => ({ ...prev, token: newToken }));

        // Send new token to backend
        try {
          await privateApiService.current._request('post', urls['fcm-token'], {
            fcm_token: newToken
          });
        } catch (error) {
          console.error('Failed to update token on server:', error);
        }
      });
    }

    return () => {
      messageListenerCleanup.current?.();
      tokenRefreshCleanup.current?.();
    };
  }, [state.isEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      messageListenerCleanup.current?.();
      tokenRefreshCleanup.current?.();
    };
  }, []);

  const handleEnableNotifications = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await enableNotifications();

      if (result.success) {
        const token = getFCMToken();

        // Send token to backend
        if (token) {
          await privateApiService.current._request('post', urls['fcm-token'], {
            fcm_token: token
          });
        }

        setState(prev => ({
          ...prev,
          isEnabled: true,
          token,
          permission: 'granted',
          isLoading: false
        }));

        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to enable notifications',
          isLoading: false
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }));
      return false;
    }
  }, []);

  const handleDisableNotifications = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = getFCMToken();

      // Remove token from backend first
      if (token) {
        try {
          await privateApiService.current._request('delete', urls['fcm-token'], {
            fcm_token: token
          });
        } catch (error) {
          console.error('Failed to remove token from server:', error);
        }
      }

      // Disable notifications locally
      await disableNotifications();

      setState(prev => ({
        ...prev,
        isEnabled: false,
        token: null,
        isLoading: false
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disable notifications',
        isLoading: false
      }));
      return false;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Force token refresh by disabling and re-enabling
      await disableNotifications();
      const result = await enableNotifications();

      if (result.success) {
        const newToken = getFCMToken();
        setState(prev => ({
          ...prev,
          token: newToken,
          isLoading: false
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: 'Failed to refresh token',
          isLoading: false
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Token refresh failed',
        isLoading: false
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    enableNotifications: handleEnableNotifications,
    disableNotifications: handleDisableNotifications,
    refreshToken,
    clearError
  };
};
