'use client';

import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check if there's an update available
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    } else {
      console.log('Service Worker is not supported in this browser');
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistration;
