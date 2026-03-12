import React from 'react';
import type { Metadata } from 'next';
import SupportCenter from './SupportCenter';

export const metadata: Metadata = {
  title: 'Support Center',
  description: 'Get help and support for your food ordering experience. Contact us via phone or email.',
};

export default function SupportCenterPage() {
  return <SupportCenter />;
}
