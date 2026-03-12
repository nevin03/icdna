'use client';

import React from 'react';
import { toast } from 'react-hot-toast';
import NotificationToast from './NotificationToast';

const TestNotification = () => {
  const triggerTestNotification = () => {
    toast.custom((t) => (
      <NotificationToast
        title="Test Notification"
        body="This is a test notification to check if the toast is working properly!"
        t={t}
      />
    ), {
      duration: 5000,
    });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000 
    }}>
      <button
        onClick={triggerTestNotification}
        style={{
          padding: '12px 20px',
          backgroundColor: 'var(--main-turquoise)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontFamily: 'var(--font-dm-sans)',
          fontWeight: 'var(--fw-medium)',
          fontSize: '14px',
        }}
      >
        Test Toast 🍴
      </button>
    </div>
  );
};

export default TestNotification;
