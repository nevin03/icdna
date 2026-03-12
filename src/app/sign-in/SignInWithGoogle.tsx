'use client';

import Link from 'next/link';
import React from 'react';

import { svg } from '../../svg';
// import { Routes } from '../../routes';
import { signIn } from "next-auth/react";
import { components } from '../../components';

export const SignInWithGoogle: React.FC = () => {
  const [statusAuth, setStatusAuth] = React.useState<{
    loading: boolean;
    error: null | string;
    processed: boolean; // Add this to track if we've already processed this session
  }>({
    loading: false,
    error: null,
    processed: false
  });

  const handleGoogleLogin = async () => {
    setStatusAuth(prev => ({
      ...prev,
      loading: true,
      error: null,
      processed: false
    }));

    try {
      // Create a special callback page that handles the routing logic
      const currentUrl = window.location.origin;
      const callbackUrl = `${currentUrl}/sign-in/callback?authorization=processing`;
      
      await signIn('google', {
        callbackUrl: callbackUrl,
        redirect: true // Let NextAuth handle the redirect
      });
      
      // This code won't run because redirect: true will navigate away
      // The routing logic will be handled in the callback page
      
    } catch (error) {
      console.error('Google auth failed from catch:', error);
      setStatusAuth(prev => ({
        ...prev,
        error: 'Google authentication failed',
        loading: false,
        processed: true
      }));
    } finally {
      setTimeout(()=>{
        setStatusAuth(prev => ({
          ...prev,
          loading: false,
          processed: true
        }));
      },10000)
    }
  };

  const renderImageSection = () => {
    return (
      <div style={{ 
        width: '100%', 
        height: '280px',
        marginBottom: '25px',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <div 
          className="logo-bg-animated"
          style={{ width: '100%', height: '100%', fontSize: '32px' }}
        >
          ICDNA
        </div>
      </div>
    );
  };

  const renderWelcomeHeader = () => {
    return (
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333',
          lineHeight: '1.3'
        }}>
          Get in easily with your Google account
        </h1>
      </div>
    );
  };
  
  const renderGoogleButton = () => {
    const isButtonLoading = statusAuth.loading ;
    
    return (
      <div style={{ marginBottom: '25px' }}>
        {statusAuth.error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {statusAuth.error}
          </div>
        )}
        
        <button
          onClick={handleGoogleLogin}
          disabled={isButtonLoading}
          style={{
            width: '100%',
            color: isButtonLoading ? '#999' : '#4285F4', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 0',
            borderRadius: '8px',
            border: '2px solid transparent',
            backgroundImage: isButtonLoading 
              ? 'linear-gradient(#f5f5f5, #f5f5f5)' 
              : 'linear-gradient(white, white), linear-gradient(to right, #4285F4, #DB4437, #F4B400, #0F9D58)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            boxShadow: isButtonLoading 
              ? '0 1px 3px 0 rgba(0,0,0,0.06)' 
              : '0 3px 6px 0 rgba(0,0,0,0.12)',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            cursor: isButtonLoading ? 'not-allowed' : 'pointer',
            opacity: isButtonLoading ? 0.7 : 1
          }}
        >
          <div style={{ marginRight: 20 }}>
            <svg.GOfGoogleSvg />
          </div>
          {isButtonLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    );
  };

  const renderCafeParagraph = () => {
    return (
      <p style={{ 
        textAlign: 'center', 
        marginBottom: '25px',
        fontSize: '15px',
        color: '#666',
        lineHeight: '1.5'
      }}>
        Welcome to our cafe! Sign in to quickly order your favorite food. Track your orders, and enjoy exclusive offers.
      </p>
    );
  };

  const renderFooter = () => {
    return (
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#888',
        marginTop: '15px',
        lineHeight: '1.4',
        paddingTop: '15px',
        borderTop: '1px solid #f0f0f0'
      }}>
        By continuing, you agree to our{' '}
        <Link href="/terms-of-service" style={{ 
          color: 'var(--main-turquoise)', 
          textDecoration: 'underline',
          fontWeight: '500'
        }}>
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy-policy" style={{ 
          color: 'var(--main-turquoise)', 
          textDecoration: 'underline',
          fontWeight: '500'
        }}>
          Privacy Policy
        </Link>
        .
      </div>
    );
  };

  return (
    <components.Screen>
      <components.Header showGoBack={true} /> 
      <main
        className='scrollable container'
        style={{
          paddingTop: '20px',
          paddingBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 'calc(100vh - 120px)', 
        }}
      >
        <section
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '35px',
            borderRadius: '16px',
            backgroundColor: 'var(--white-color)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}
        >
          {renderImageSection()}
          {renderWelcomeHeader()}
          {renderCafeParagraph()}
          {renderGoogleButton()}
          {renderFooter()}
        </section>
      </main>
    </components.Screen>
  );
};
