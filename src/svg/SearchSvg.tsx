import * as React from 'react';

export const SearchSvg: React.FC = () => {
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
          d='M19.333 24.667a5.333 5.333 0 1 0 0-10.667 5.333 5.333 0 0 0 0 10.667ZM26 26l-2.9-2.9'
        />
      </svg>
    </div>
  );
};
