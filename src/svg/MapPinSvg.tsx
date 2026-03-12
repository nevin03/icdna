import React from 'react';

export const MapPinSvg: React.FC = () => {
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
        <g
          stroke='#fff'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1.5}
        >
          <path d='M12.667 16v10.667L17.333 24l5.334 2.667L27.333 24V13.333L22.667 16l-5.334-2.667L12.667 16ZM17.333 13.333V24M22.667 16v10.667' />
        </g>
        <defs>
          <clipPath id='a'>
            <path
              fill='#fff'
              d='M12 12h16v16H12z'
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};
