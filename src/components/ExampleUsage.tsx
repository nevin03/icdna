'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { requireAuth } from '../utils/authUtils';

// Example component showing how to use the new AuthModal system
export const ExampleUsage: React.FC = () => {
  const { openAuthModal } = useAuth();

  // Example 1: Simple authentication check with modal
  const handleAddToCart = () => {
    if (!requireAuth(openAuthModal)) {
      return; // User will see auth modal
    }
    
    // Continue with add to cart logic
    console.log('Adding to cart...');
  };

  // Example 2: Authentication with redirect after success
  const handleViewOrders = () => {
    if (!requireAuth(openAuthModal, '/order-history')) {
      return; // User will see auth modal and redirect to orders after auth
    }
    
    // Continue with view orders logic
    console.log('Viewing orders...');
  };

  // Example 3: Direct modal opening
  const handleSignInClick = () => {
    openAuthModal();
  };

  return (
    <div>
      <button onClick={handleAddToCart}>
        Add to Cart (requires auth)
      </button>
      
      <button onClick={handleViewOrders}>
        View Orders (requires auth + redirect)
      </button>
      
      <button onClick={handleSignInClick}>
        Sign In
      </button>
    </div>
  );
};
