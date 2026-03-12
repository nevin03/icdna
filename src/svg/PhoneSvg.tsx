import React from 'react';

export const PhoneSvg: React.FC = () => {
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
          d='M23.333 13.333h-6.666c-.737 0-1.334.597-1.334 1.334v10.666c0 .737.597 1.334 1.334 1.334h6.666c.737 0 1.334-.597 1.334-1.334V14.667c0-.737-.597-1.334-1.334-1.334ZM20 24h.007'
        />
      </svg>
    </div>
  );
};
