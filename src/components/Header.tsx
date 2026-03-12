'use client';

import React, { useState } from 'react';
import Cookies from 'js-cookie';
// Navigation is handled by tracked router from hooks

import { svg } from '../svg';
// import { URLS } from '../config';
import { stores } from '../stores';
import { Routes } from '../routes';
import { hooks } from '../hooks';
import { useAuth } from './AuthProvider';

type Props = {
  user?: boolean;
  title?: string;
  userName?: boolean;
  document?: boolean;
  creditCard?: boolean;
  showGoBack?: boolean;
  showBasket?: boolean;
  onGoBack?: () => void;
};

export const Header: React.FC<Props> = ({
  showGoBack,
  title,
  user,
  userName,
  showBasket,
  onGoBack,
}) => {
  const router = hooks.useTrackedRouter(); // Use tracked router for navigation history
  // const pathname = usePathname();

  const { amount: walletAmount } = stores.useWalletStore();
  // const { setScreen } = stores.useTabStore();
  const { openModal } = stores.useModalStore();
  const { goBack } = hooks.useNavigation();
  const { openAuthModal } = useAuth();
  const [showWalletAmount, setShowWalletAmount] = useState(false);

  const isAuthenticated = () => {
    return !!Cookies.get("authToken");
  };

  const renderGoBack = () => {
    if (!showGoBack) return null;
    return (
      <button
        onClick={onGoBack ?? goBack}
        style={{ left: '0px', padding: '0 20px', position: 'absolute' }}
      >
        <svg.GoBackSvg />
      </button>
    );
  };

  const renderUser = () => {
    if (!user && !userName) return null;

    return (
      <button
        style={{ 
          position: 'absolute', 
          left: 0, 
          padding: '0 20px', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          color: '#0C1D2E'
        }}
        onClick={() => {
          openModal();
        }}
      >
        <svg.MenuSvg />
      </button>
    );
  };

  const renderTitle = () => {
    const displayTitle = title === 'title' ? "ICDNA" : title;
    const isSpecialTitle = title === 'title';

    return (
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <h4
          className={`main-dark header-title ${isSpecialTitle ? 'header-title--special' : ''}`}
          style={{
            pointerEvents: 'auto',
            margin: 0,
          }}
        >
          {isSpecialTitle ? (
            <span style={{ display: 'inline-block' }}>
              {displayTitle?.split('').map((char, index) => (
                <span
                  key={index}
                  className="letter-reveal"
                  style={{
                    display: 'inline-block',
                    opacity: 0,
                    fontWeight: 900,
                    transform: 'translateY(20px) scale(0.8)',
                    animation: `letterReveal 0.6s ease-out forwards`,
                    animationDelay: `${index * 0.08}s`,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          ) : (
            displayTitle
          )}
        </h4>
      </div>
    );
  };

  const renderBasket = () => {
    if (!showBasket) return null;

    return (
      <div
        style={{
          position: 'absolute',
          right: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Wallet for authenticated users */}
        {isAuthenticated() && (
          <div
            onClick={() => {
              setShowWalletAmount(!showWalletAmount);
            }}
            style={{
              height: '100%',
              width: 'auto',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                position: 'absolute',
                backgroundColor: 'var(--main-turquoise)',
                padding: '5px 8px 3px 8px',
                borderRadius: '12px',
                right: 44,
                top: '50%',
                transform: showWalletAmount ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.8)',
                transformOrigin: 'right center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                opacity: showWalletAmount ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                pointerEvents: showWalletAmount ? 'auto' : 'none',
                width: showWalletAmount ? 'auto' : '0px',
                overflow: 'hidden',
                gap: 8,
              }}
            >
              <span
                style={{
                  color: 'var(--white-color)',
                  fontWeight: 700,
                  marginBottom: 1,
                  fontSize: 10,
                  whiteSpace: 'nowrap',
                  opacity: showWalletAmount ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out 0.1s',
                }}
              >
                ₹{parseFloat(walletAmount) > 0 ? parseFloat(walletAmount).toFixed(2) : '0.00'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(Routes.TOPUP_WALLET);
                }}
                style={{
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 4,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: showWalletAmount ? 1 : 0,
                }}
                className='clickable'
                title="Top up wallet"
              >
                <span style={{
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  ⬆
                </span>
              </button>
            </div>
            <svg.WalletSvg />
          </div>
        )}

        {/* Login icon for unauthenticated users */}
        {!isAuthenticated() && (
          <button
            onClick={() => {
              openAuthModal(); // Open auth modal instead of redirecting
            }}
            style={{
              height: '100%',
              width: 'auto',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width={24}
              height={24}
              fill='none'
              stroke='#0C1D2E'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
              <circle cx={12} cy={7} r={4} />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        @keyframes subtlePulse {
          0%, 100% { 
            opacity: 0.7; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.1);
          }
        }

        @keyframes letterReveal {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          60% {
            transform: translateY(-5px) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }

        .milee-store-title {
          position: relative;
        }

        .header-title {
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: calc(100vw - 140px);
          text-align: center;
          margin: 0;
          font-weight: 600;
        }

        .header-title--special {
          font-weight: 900;
          letter-spacing: 1px;
        }

        .letter-reveal:hover {
          animation: letterBounce 0.4s ease-out;
        }

        @keyframes letterBounce {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.2); }
          100% { transform: translateY(0px) scale(1); }
        }

        @media (max-width: 420px) {
          .header-title { font-size: 14px; max-width: calc(100vw - 120px); }
          .header-title--special { font-size: 15px; }
        }
      `}</style>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          position: 'relative',
          height: 'var(--header-height)',
          marginBlock: 5
        }}
      >
        {renderGoBack()}
        {renderUser()}
        {renderTitle()}
        {renderBasket()}
      </header>
    </>
  );
};
