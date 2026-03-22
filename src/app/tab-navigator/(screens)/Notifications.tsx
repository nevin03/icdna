'use client';

import React from 'react'; // Removed useState as it's no longer needed for readNotifications
import { stores } from '../../../stores'; // Updated import path
import { svg } from '../../../svg';
import { components } from '../../../components';
import { NotificationType } from '@/types/NotificationType'; // Import NotificationType
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export const Notifications: React.FC = () => {
  const router = useRouter();
  const { notifications, error } = stores.useNotificationStore(); // Use the new store

  // Removed useState for readNotifications as is_seen is now part of the API response
  // const [
  //   readNotifications,
  //   // setReadNotifications
  // ] = useState<Set<string>>(
  //   new Set(),
  // );

  // Removed handleMarkAsRead as is_seen is now part of the API response
  // const handleMarkAsRead = (id: string) => {
  //   setReadNotifications((prev) => new Set(prev).add(id));
  // };

  const renderHeader = () => {
    return (
      <components.Header
        user={true}
        showBasket={true}
        title='Notifications'
      />
    );
  };

  const renderContent = () => {
    const isAuthenticated = !!Cookies.get('authToken');

    if (!isAuthenticated) {
      return (
        <main 
          className='container scrollable' 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div 
            style={{
              textAlign: 'center',
              padding: '40px 32px',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              maxWidth: '360px',
              width: '90%',
              margin: '0 auto',
              border: '1px solid #f1f5f9'
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <div 
                style={{
                  width: '80px',
                  height: '80px',
                  background: '#f8fafc',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  border: '2px solid #e2e8f0'
                }}
              >
                <svg.BellTabSvg fillColor='var(--main-color)' />
              </div>
            </div>
            
            <h2 
              style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '12px',
                letterSpacing: '-0.01em'
              }}
            >
              Sign In Required
            </h2>
            
            <p 
              style={{
                color: '#64748b',
                fontSize: '16px',
                lineHeight: '1.5',
                fontWeight: '400',
                marginBottom: '24px'
              }}
            >
              Please sign in to view your notifications and stay updated.
            </p>

            <components.Button 
              label="Sign In"
              onClick={() => router.push('/sign-in')}
            />
          </div>
        </main>
      );
    }

    // Priority 1: Error state
    if (error) {
      return (
        <main className='container scrollable flex flex-col items-center justify-center h-full'>
          <svg.CrossSvg
          //  width={48} height={48} 
           /> {/* Assuming CrossSvg is available */}
          <p className='mt-3 text-lg text-red-600'>Error Fetching Notifications</p>
          <p className='text-sm text-gray-500 px-4 text-center'>{error}</p>
        </main>
      );
    }

    // Priority 2: No notifications (even if loading, show this until data arrives or loading finishes)
    // This covers initial empty state and empty state after a fetch.
    if (notifications.length === 0) {
      // If it's loading for the very first time (initial mount/fetch),
      // we can show a subtle loading directly within the empty state, or just the empty state.
      // For now, let's stick to just the empty state to avoid any flashing.
      // The `TabNavigator` fetches, so this screen will re-render.
      return (
       <main 
        className='container scrollable' 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // height: '100%',
          // minHeight: '100vh'
        }}
      >
        <div 
          style={{
            textAlign: 'center',
            padding: '40px 32px',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            maxWidth: '360px',
            width: '90%',
            margin: '0 auto',
            border: '1px solid #f1f5f9'
          }}
        >
          {/* Icon container */}
          <div 
            style={{
              marginBottom: '24px'
            }}
          >
            <div 
              style={{
                width: '80px',
                height: '80px',
                background: '#f8fafc',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                border: '2px solid #e2e8f0'
              }}
            >
              <svg.BellTabSvg 
                fillColor='var(--main-color)' 
                // style={{ width: '36px', height: '36px' }}
              />
            </div>
          </div>
          
          {/* Main heading */}
          <h2 
            style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '12px',
              letterSpacing: '-0.01em'
            }}
          >
            No Notifications Yet
          </h2>
          
          {/* Beautiful main message */}
          <p 
            style={{
              color: '#64748b',
              fontSize: '16px',
              lineHeight: '1.5',
              fontWeight: '400',
              margin: '0'
            }}
          >
            When you get new notifications, they'll show up here.
          </p>
        </div>
      </main>
      );
    }

    // Priority 3: Notifications are present
    // The loading indicator for background refresh when notifications.length > 0 has been removed
    // to prevent flashing, as requested. The list will just update.
    return (
      <main className='container scrollable'>
        <ul style={{paddingTop: 10, paddingBottom: 20}}>
          {notifications.map((notification: NotificationType, index: number, array: NotificationType[]) => {
            const isLast = index === array.length - 1;
            // Use is_seen from the API response
            const isRead = notification.is_seen;

            return (
              <li
                key={notification.id}
                style={{
                  backgroundColor: 'var(--white-color)',
                  borderRadius: 10,
                  padding: 20,
                  marginBottom: isLast ? 0 : 14,
                  opacity: isRead ? 0.5 : 1, // Apply opacity directly based on is_seen
                }}
              >
                <section> {/* Removed style={{opacity: isRead ? 0.5 : 1}} as it's moved to li */}
                  <div
                    style={{
                      gap: 8,
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {/* Generic icon for now, can be customized later if needed */}
                    <svg.NotificationCheckSvg />
                    <h5 className='number-of-lines-1'>{notification.title}</h5>
                  </div>
                  <p
                    className='t14'
                    style={{marginBottom: 14}}
                  >
                    {notification.description}
                  </p>
                  <div
                    style={{display: 'flex', justifyContent: 'space-between'}}
                  >
                    <span className='t12'>{new Date(notification.created_date).toLocaleDateString()}</span>
                    {/* Removed Mark as read functionality as per API structure */}
                  </div>
                </section>
              </li>
            );
          })}
        </ul>
      </main>
    );
  };

  const renderModal = () => {
    return <components.Modal />;
  };

  const renderBottomTabBar = () => {
    return <components.BottomTabBar />;
  };

  return (
    <components.Screen>
      {renderHeader()}
      {renderContent()}
      {renderModal()}
      {renderBottomTabBar()}
    </components.Screen>
  );
};
