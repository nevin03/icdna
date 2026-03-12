import React from 'react';
import type { Metadata } from 'next';
import { TopupWallet } from './TopupWallet';

// import { TopupWallet } from './TopupWallet';

export const metadata: Metadata = {
  title: 'Top Up Wallet - ICDNA',
  description: 'Add money to your wallet for faster checkout and exclusive offers at ICDNA.',
};

export default function TopupWalletPage() {
  return <TopupWallet />;
}
