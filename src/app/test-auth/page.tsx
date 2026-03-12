'use client';

import React from 'react';
import { useAuth } from '../../components/AuthProvider';
import { requireAuth, isAuthenticated } from '../../utils/authUtils';

export default function TestAuthPage() {
  const { openAuthModal } = useAuth();

  const handleTestAuth = () => {
    if (!requireAuth(openAuthModal, '/test-auth')) {
      return;
    }
    alert('You are authenticated! This action would proceed.');
  };

  const handleTestAuthWithRedirect = () => {
    if (!requireAuth(openAuthModal, '/order-history')) {
      return;
    }
    alert('You are authenticated! Redirecting to order history...');
  };

  const handleDirectSignIn = () => {
    openAuthModal();
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'var(--font-dm-sans)'
    }}>
      <h1 style={{ marginBottom: '20px', color: '#111827' }}>
        Auth Modal Test Page
      </h1>
      
      <div style={{ 
        background: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>
          Current Status:
        </h3>
        <p style={{ 
          margin: 0, 
          color: isAuthenticated() ? '#059669' : '#dc2626',
          fontWeight: '500'
        }}>
          {isAuthenticated() ? '✅ Authenticated' : '❌ Not Authenticated'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button
          onClick={handleTestAuth}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Test Auth Required Action (Stay on Page)
        </button>

        <button
          onClick={handleTestAuthWithRedirect}
          style={{
            background: '#059669',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Test Auth + Redirect to Order History
        </button>

        <button
          onClick={handleDirectSignIn}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Direct Sign In Modal
        </button>
      </div>

      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #f59e0b'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#92400e' }}>
          How it works:
        </h4>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#92400e' }}>
          <li>Click any button above</li>
          <li>If not authenticated, a modal opens</li>
          <li>Click "Open Sign In" to launch popup</li>
          <li>Complete Google authentication in popup</li>
          <li>Modal automatically closes when auth completes</li>
          <li>You're redirected to intended page (if specified)</li>
        </ol>
      </div>
    </div>
  );
}
