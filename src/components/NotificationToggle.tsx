'use client';

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationToggleProps {
  onClick?: (enabled: boolean) => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ onClick }) => {
  const {
    isEnabled,
    isLoading,
    permission,
    error,
    enableNotifications,
    disableNotifications,
    clearError
  } = useNotifications();

  const handleToggle = async () => {
    // Clear any previous errors
    if (error) {
      clearError();
    }

    // Check if browser permission is blocked
    if (permission === 'denied') {
      const userAgent = navigator.userAgent;
      let instructions = '';

      if (userAgent.includes('Chrome')) {
        instructions = 'Chrome: Click the 🔒 lock icon in the address bar → Site settings → Notifications → Allow';
      } else if (userAgent.includes('Firefox')) {
        instructions = 'Firefox: Click the 🛡️ shield icon in the address bar → Permissions → Notifications → Allow';
      } else if (userAgent.includes('Safari')) {
        instructions = 'Safari: Safari menu → Settings for This Website → Notifications → Allow';
      } else {
        instructions = 'Please check your browser settings to allow notifications for this site.';
      }

      alert(`Notifications are blocked in your browser settings.\n\nTo enable:\n${instructions}\n\nThen refresh the page and try again.`);
      return;
    }

    try {
      let success = false;
      
      if (isEnabled) {
        success = await disableNotifications();
        if (success) {
          onClick?.(false);
        }
      } else {
        success = await enableNotifications();
        if (success) {
          onClick?.(true);
        } else if (error) {
          // Show user-friendly error messages
          let errorMessage = '';
          
          switch (error) {
            case 'permission_denied':
              errorMessage = 'Please allow notifications when prompted by your browser.';
              break;
            case 'unsupported':
            case 'unsupported_browser':
              errorMessage = 'Notifications are not supported in this browser. Please try using Chrome, Firefox, or Safari.';
              break;
            case 'messaging_unavailable':
              errorMessage = 'Firebase messaging is not available. Please refresh the page and try again.';
              break;
            case 'no_token':
              errorMessage = 'Unable to generate notification token. This may be due to browser restrictions. Please try:\n\n• Refreshing the page\n• Clearing browser cache\n• Using a different browser';
              break;
            case 'permission_blocked':
              errorMessage = 'Notifications are blocked. Please check your browser settings and allow notifications for this site.';
              break;
            case 'vapid_key_error':
              errorMessage = 'Notification configuration error. Please contact support.';
              break;
            case 'ios_safari_unsupported':
              errorMessage = 'iOS Safari has limited notification support. For better experience:\n\n• Add this app to your home screen\n• Use Chrome browser instead\n• Enable notifications in iOS Settings';
              break;
            default:
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
              
              if (isIOS || isSafari) {
                errorMessage = 'iOS/Safari detected. Please ensure:\n\n• You\'re using Safari 16.4+ or Chrome\n• Notifications are enabled in device settings\n• The website is added to home screen (for better compatibility)\n\nTry refreshing and enabling again.';
              } else {
                errorMessage = `Failed to enable notifications: ${error}\n\nPlease try:\n• Refreshing the page\n• Clearing browser cache\n• Using a different browser`;
              }
              break;
          }
          
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <button
      style={{
        width: 39,
        backgroundColor: isEnabled ? 'var(--main-turquoise)' : '#DCE2E7',
        borderRadius: 12,
        padding: '1.5px 1.5px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: isEnabled ? 'flex-end' : 'flex-start',
        opacity: isLoading ? 0.6 : 1,
        transition: 'all 0.3s ease',
        border: 'none',
      }}
      onClick={handleToggle}
      disabled={isLoading}
      title={error ? `Error: ${error}` : isEnabled ? 'Disable notifications' : 'Enable notifications'}
    >
      <div
        style={{
          width: 20.9,
          height: 20.9,
          backgroundColor: isEnabled
            ? 'var(--white-color)'
            : 'var(--text-color)',
          borderRadius: 11,
          alignSelf: isEnabled ? 'flex-end' : 'flex-start',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        {isLoading && (
          <div style={{
            width: '10px',
            height: '10px',
            border: '1.5px solid #ccc',
            borderTop: '1.5px solid var(--main-turquoise)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        )}
      </div>
    </button>
  );
};

export default NotificationToggle;
