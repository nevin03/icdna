'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { toast } from 'react-hot-toast';

import { svg } from '../../svg';
import { components } from '../../components';
import { stores } from '../../stores';
import { Routes } from '../../routes';
import { createApiService } from '@/lib/axios/apiService';
import authClient from '@/lib/axios/authClient';
import { urls } from '@/lib/config/urls';
import NotificationToast from '../../components/NotificationToast';

const privateApiService = createApiService(authClient);

export const TopupWallet: React.FC = () => {
  const router = useRouter();
  const { amount: walletAmount, updateAmount } = stores.useWalletStore();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(true);



  // Predefined amounts for quick selection
  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setCustomAmount(numericValue);
    setSelectedAmount(numericValue ? parseInt(numericValue) : null);
  };

  const handleTopup = async () => {
    if (!selectedAmount || selectedAmount < 10) {
      console.log('Invalid amount:', selectedAmount);
      return;
    }

    console.log('🔵 Starting wallet top-up for amount:', selectedAmount);
    setIsLoading(true);

    try {
      console.log('🔵 Step 1: Creating Razorpay order...');
      const razorpayOrderResponse = await privateApiService.post<any>(
        urls["create-razorpay-order"],
        {
          amount: selectedAmount,
          use_wallet: "false", // Not using wallet for payment; we're adding money to it
          request_type: "wallet_recharge" // Specify this is a wallet recharge request
        }
      );

      console.log('🔵 Razorpay order response:', razorpayOrderResponse);

      // Check if order was created successfully (response contains razorpay_order_id)
      if (!razorpayOrderResponse.razorpay_order_id) {
        throw new Error('Failed to create Razorpay order - no order ID received');
      }

      const { razorpay_order_id } = razorpayOrderResponse;
      console.log('✅ Razorpay order created:', razorpay_order_id);

      // Get user details from localStorage (client-side only)
      const userName = typeof window !== 'undefined' ? (localStorage.getItem('name') || 'Customer') : 'Customer';
      const userEmail = typeof window !== 'undefined' ? (localStorage.getItem('email') || '') : '';
      const userPhone = typeof window !== 'undefined' ? (localStorage.getItem('mobile_number') || '') : '';

      console.log('🔵 Step 2: Configuring Razorpay options...');
      console.log('Razorpay Key:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

      // Step 2: Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: selectedAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'Thomson\'s Casa Store',
        description: `Wallet top-up of ₹${selectedAmount}`,
        order_id: razorpay_order_id,
        handler: async function (response: any) {
          try {
            console.log('✅ Payment successful. Response:', response);

            // Step 3: Call wallet recharge API AFTER successful payment
            const rechargeResponse = await privateApiService.post<any>(
              urls["wallet-recharge"],
              {
                amount: selectedAmount,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }
            );

            console.log('Wallet recharge response:', rechargeResponse);

            if (rechargeResponse.status === 1) {
              // Update local wallet balance if returned, or fetch profile
              if (rechargeResponse.new_balance) {
                updateAmount(rechargeResponse.new_balance.toString());
              } else {
                // Fallback: fetch profile to get updated balance
                try {
                  const profileResponse = await privateApiService.get<any>(urls.profile);
                  if (profileResponse.status === 1 && profileResponse.user_data) {
                    updateAmount(profileResponse.user_data.wallet?.toString() || "0");
                  }
                } catch (e) {
                  console.error("Failed to refresh balance", e);
                }
              }

              setIsLoading(false);

              // Show success toast notification
              toast.custom((t) => (
                <NotificationToast
                  title="Wallet Top-up Successful! 🎉"
                  body={`Your wallet has been topped up with ₹${selectedAmount} successfully!`}
                  t={t}
                />
              ));

              // Navigate back after a short delay
              setTimeout(() => {
                router.push(Routes.TAB_NAVIGATOR);
              }, 1500);

            } else {
              throw new Error(rechargeResponse.message || 'Wallet recharge failed');
            }

          } catch (error) {
            console.error("❌ Wallet top-up verification failed:", error);
            setIsLoading(false);

            // Show error toast notification
            toast.custom((t) => (
              <NotificationToast
                title="Verification Failed ⚠️"
                body="Payment successful but wallet update failed. Please contact support."
                t={t}
              />
            ));
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: '#06402B',
        },
        modal: {
          ondismiss: function () {
            console.log('⚠️ Wallet top-up payment modal dismissed by user');
            setIsLoading(false);
          }
        }
      };

      console.log('🔵 Step 3: Checking if Razorpay script is loaded...');
      console.log('isRazorpayLoaded:', isRazorpayLoaded);
      console.log('window.Razorpay exists:', !!(window as any).Razorpay);

      // Step 4: Check if Razorpay script is loaded and launch payment
      if (!isRazorpayLoaded || !(window as any).Razorpay) {
        console.error('❌ Razorpay script not loaded!');
        throw new Error('Razorpay script is not loaded yet. Please try again.');
      }

      console.log('🔵 Step 4: Opening Razorpay modal...');
      // Create Razorpay instance and open
      const rzpl = new (window as any).Razorpay(options);
      console.log('Razorpay instance created:', rzpl);
      rzpl.open();
      console.log('✅ Razorpay modal opened successfully');

    } catch (error) {
      console.error("❌ Wallet top-up failed:", error);
      setIsLoading(false);

      // Show error toast notification
      toast.custom((t) => (
        <NotificationToast
          title="Top-up Failed ❌"
          body="Failed to initiate wallet top-up. Please check your connection and try again."
          t={t}
        />
      ));
    }
  };

  const renderHeader = () => {
    return (
      <components.Header
        title='Top Up Wallet'
        showGoBack={true}
      />
    );
  };

  const renderContent = () => {
    return (
      <main
        className='scrollable container'
        style={{ paddingTop: 20, paddingBottom: 20 }}
      >
        {/* CURRENT WALLET BALANCE */}
        <section style={{ marginBottom: 30 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--main-turquoise), #0c9261)',
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(79, 209, 199, 0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background decoration */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
              }}
            />

            <div
              style={{
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <svg.WalletSvg color="white" size={28} />
            </div>

            <span
              className='t14'
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Current Balance
            </span>

            <h2
              style={{
                color: 'white',
                fontSize: '32px',
                fontWeight: 700,
                margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              ₹{walletAmount}
            </h2>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section style={{ marginBottom: 30 }}>
          <h4 style={{ marginBottom: 16, color: 'var(--main-dark)' }}>
            Why Top Up Your Wallet?
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                icon: '⚡',
                title: 'Faster Checkout',
                description: 'Skip payment steps and order instantly'
              },
              {
                icon: '🎁',
                title: 'Exclusive Offers',
                description: 'Get special discounts on wallet payments'
              },
              {
                icon: '🔒',
                title: 'Secure Payments',
                description: 'Your money is safe and protected'
              }
            ].map((benefit, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  backgroundColor: 'var(--white-color)',
                  borderRadius: 12,
                  border: '1px solid #f0f0f0',
                }}
              >
                <div
                  style={{
                    fontSize: '24px',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: 8,
                  }}
                >
                  {benefit.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{
                    margin: '0 0 4px 0',
                    color: 'var(--main-dark)',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {benefit.title}
                  </h5>
                  <p style={{
                    margin: 0,
                    color: '#666',
                    fontSize: '12px',
                    lineHeight: '1.4'
                  }}>
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* QUICK AMOUNTS */}
        <section style={{ marginBottom: 30 }}>
          <h4 style={{ marginBottom: 16, color: 'var(--main-dark)' }}>
            Quick Top Up
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAmountSelect(amount)}
                style={{
                  padding: '16px 12px',
                  borderRadius: 12,
                  border: selectedAmount === amount
                    ? '2px solid var(--main-turquoise)'
                    : '1px solid #e0e0e0',
                  backgroundColor: selectedAmount === amount
                    ? 'rgba(79, 209, 199, 0.1)'
                    : 'var(--white-color)',
                  color: selectedAmount === amount
                    ? 'var(--main-turquoise)'
                    : 'var(--main-dark)',
                  fontWeight: selectedAmount === amount ? 600 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                className='clickable'
              >
                ₹{amount}
              </button>
            ))}
          </div>
        </section>

        {/* CUSTOM AMOUNT */}
        <section style={{ marginBottom: 30 }}>
          <h4 style={{ marginBottom: 16, color: 'var(--main-dark)' }}>
            Enter Custom Amount
          </h4>

          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--main-dark)',
                fontSize: '16px',
                fontWeight: 600,
                zIndex: 1,
              }}
            >
              ₹
            </span>
            <input
              type="text"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder="Enter amount (min ₹10)"
              style={{
                width: '100%',
                padding: '16px 16px 16px 32px',
                borderRadius: 12,
                border: customAmount && selectedAmount
                  ? '2px solid var(--main-turquoise)'
                  : '1px solid #e0e0e0',
                fontSize: '16px',
                backgroundColor: 'var(--white-color)',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
            />
          </div>

          {selectedAmount && selectedAmount < 10 && (
            <p style={{
              margin: '8px 0 0 0',
              color: '#e74c3c',
              fontSize: '12px',
            }}>
              Minimum top-up amount is ₹10
            </p>
          )}
        </section>

        {/* PAYMENT INFO */}
        <section style={{ marginBottom: 30 }}>
          <div
            style={{
              padding: 16,
              backgroundColor: '#f8f9fa',
              borderRadius: 12,
              border: '1px solid #e9ecef',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '16px' }}>💳</span>
              <h5 style={{
                margin: 0,
                color: 'var(--main-dark)',
                fontSize: '14px',
                fontWeight: 600
              }}>
                Secure Payment
              </h5>
            </div>
            <p style={{
              margin: 0,
              color: '#666',
              fontSize: '12px',
              lineHeight: '1.4'
            }}>
              Your payment is processed securely. We accept all major credit cards,
              debit cards, and UPI payments.
            </p>
          </div>
        </section>
      </main>
    );
  };

  const renderButton = () => {
    const isDisabled = !selectedAmount || selectedAmount < 10 || isLoading;

    return (
      <section style={{ padding: 20 }}>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          onLoad={() => {
            console.log('Razorpay script loaded successfully');
            setIsRazorpayLoaded(true);
          }}
          onError={(e) => {
            console.error('Failed to load Razorpay script:', e);
            setIsRazorpayLoaded(false);
          }}
          onReady={() => {
            console.log('Razorpay script is ready');
            setIsRazorpayLoaded(true);
          }}
        />
        <components.Button
          label={isLoading ? 'Processing...' : `Top Up ₹${selectedAmount || 0}`}
          loading={isLoading}
          loadingLabel='Processing...'
          onClick={handleTopup}
          style={{
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            backgroundColor: isDisabled ? '#CCCCCC' : 'var(--main-turquoise)',
            borderColor: isDisabled ? '#CCCCCC' : 'var(--main-turquoise)',
            pointerEvents: isDisabled ? 'none' : 'auto',
          }}
        />
      </section>
    );
  };

  return (
    <components.Screen>
      {renderHeader()}
      {renderContent()}
      {renderButton()}
    </components.Screen>
  );
};
