import * as React from 'react';

export const NotificationCheckSvg: React.FC = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={24}
      height={24}
      fill='none'
    >
      <rect
        width={24}
        height={24}
        fill='#00b4cc'
        rx={12}
      />
      <path
        stroke='#fff'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={1.5}
        d='M17.333 8 10 15.333 6.667 12'
      />
    </svg>
  );
};
