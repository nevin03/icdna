import React from 'react';

export const TagSvg: React.FC = () => {
  return (
    <div>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width={40}
        height={40}
        fill='none'
        viewBox='0 0 40 40'
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
          d='m25.727 20.44-4.78 4.78a1.333 1.333 0 0 1-1.887 0l-5.727-5.72v-6.667H20l5.727 5.727a1.334 1.334 0 0 1 0 1.88ZM16.667 16.167h.006'
        />
      </svg>
    </div>
  );
};
