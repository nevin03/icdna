import {
  getFCMToken,
  getNotificationPermission,
  enableNotifications,
} from '@/notification/firebase.js';
import { createApiService } from '@/lib/axios/apiService';
import { authClient } from '@/lib/axios/apiClient';
import { urls } from '@/lib/config/urls';

// Reusable function to enable notifications and send FCM token to backend
export const enableNotificationsAndSendToken = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if browser permission is already denied
    const permission = getNotificationPermission();
    
    if (permission === 'denied') {
      console.log('Notifications are blocked in browser settings');
      return { success: false, error: 'permission_denied' };
    }

    // Enable notifications (this will request permission and generate token)
    const result = await enableNotifications();

    if (result.success) {
      // Create private API service for authenticated requests
      const privateApiService = createApiService(authClient);
      
      // Call FCM token API on successful notification enable
      const fcmToken = getFCMToken();
      if (!fcmToken) {
        console.error('No FCM token available after enabling notifications');
        return { success: false, error: 'no_token' };
      }

      const response = await privateApiService._request<any>(
        'post',
        urls['fcm-token'],
        { fcm_token: fcmToken }
      );

      if (response.status === 1) {
        console.log('FCM token API success:', response.message);
        return { success: true };
      } else {
        console.error('FCM token API error:', response.error);
        return { success: false, error: 'api_error' };
      }
    } else {
      console.error('Failed to enable notifications:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error enabling notifications and sending token:', error);
    return { success: false, error: 'unexpected_error' };
  }
};
