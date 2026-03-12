'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { hooks } from '@/hooks';
import { Routes } from '../../../routes';
import PuffLoader from 'react-spinners/PuffLoader';
import { enableNotificationsAndSendToken } from '@/utility/notificationUtils';
import { stores } from '@/stores';

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const { login } = hooks.useAuthentication();
  const { updateAmount } = stores.useWalletStore();
  const router = useRouter();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      // Ensure this runs only once
      if (hasProcessed.current) return;

      if (status === 'authenticated' && session?.user?.googleId) {
        hasProcessed.current = true;

        try {
          const result = await login(session.user.googleId);

          if (result.status === 1) {
            // User is already registered - store user data
            const img_url = result.data?.profile_picture?.endsWith("default.svg") || result.data?.profile_picture?.length === 0 ? session.user.image : result?.data?.profile_picture

            // Store user data in localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('name', result.data?.name || session?.user.name || "")
              localStorage.setItem('email', result.data?.email || session?.user.email || "")
              localStorage.setItem('image', img_url || "")
              localStorage.setItem('mobile_number', result.data?.mobile_number?.toString() || "")
              localStorage.setItem('address', result.data?.address || "")
              localStorage.setItem('pincode', result.data?.pincode || "")
              localStorage.setItem('state', result.data?.state || "")
              localStorage.setItem('city', result.data?.city || "")
              localStorage.setItem('landmark', result.data?.landmark || "")
              localStorage.setItem('building_number', result.data?.building_number || "")
            }

            // Sync wallet store with the updated localStorage value
            updateAmount(result.data?.wallet?.toString() || "0");

            // Navigate immediately, don't wait for notifications
            // Use replace to prevent back navigation to Google Auth
            router.replace(Routes.TAB_NAVIGATOR);

            // Handle notifications asynchronously without blocking navigation
            setTimeout(async () => {
              try {
                await enableNotificationsAndSendToken();
              } catch (error) {
                console.error('Notification setup failed:', error);
              }
            }, 100);

          } else if (result.status === 0) {
            router.replace(Routes.CREATE_PROFILE);
          } else {
            router.replace('/sign-in?error=auth_failed');
          }
        } catch (error) {
          console.error('Authentication callback error:', error);
          router.replace('/sign-in?error=unexpected_error');
        }
      } else if (status === 'unauthenticated') {
        hasProcessed.current = true;
        router.replace('/sign-in?error=auth_failed');
      }
    };

    if (status !== 'loading') {
      handleAuth();
    }
  }, [status, session?.user?.googleId, session?.user?.name, session?.user?.email, session?.user?.image, login, router, updateAmount]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        height: '100%',
      }}
      className='flex-center'
    >
      <PuffLoader
        size={40}
        color={'#455A81'}
        aria-label='Loading Spinner'
        data-testid='loader'
        speedMultiplier={1}
      />
    </div>
  );
}
