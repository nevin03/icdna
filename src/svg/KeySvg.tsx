import React from 'react';

export const KeySvg: React.FC = () => {
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
          d='m26 13.333-1.333 1.334m0 0 2 2L24.333 19l-2-2m2.334-2.333L22.333 17m-2.74 2.74a3.668 3.668 0 0 1-1.177 6 3.667 3.667 0 0 1-4.008-.815 3.667 3.667 0 0 1 5.185-5.184v-.001Zm0 0 2.74-2.74'
        />
      </svg>
    </div>
  );
};
