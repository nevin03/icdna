import React from 'react';

export const UserSvg: React.FC = () => {
  return (
    <div>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={40}
        height={40}
        fill='none'
      >
        <rect
          width={40}
          height={40}
          fill='#00b4cc'
          rx={8}
        />
        <path
          stroke='#fff'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1.5}
          d='M25.333 26v-1.333A2.667 2.667 0 0 0 22.667 22h-5.334a2.667 2.667 0 0 0-2.666 2.667V26M20 19.333A2.667 2.667 0 1 0 20 14a2.667 2.667 0 0 0 0 5.333Z'
        />
      </svg>
    </div>
  );
};
