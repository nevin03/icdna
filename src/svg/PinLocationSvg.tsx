import * as React from 'react';

export const PinLocationSvg: React.FC = () => {
  return (
    <div>
      <svg 
          xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" 
          fill="none" 
          stroke="#fff" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="lucide lucide-locate-icon lucide-locate">
          <rect
          width={40}
          height={40}
          fill='#00b4cc'
          rx={8}
          />
          <line x1={2 + 8} x2={5 + 8} y1={12 + 8} y2={12 + 8} />
          <line x1={19 + 8} x2={22 + 8} y1={12 + 8} y2={12 + 8} />
          <line x1={12 + 8} x2={12 + 8} y1={2 + 8} y2={5 + 8} />
          <line x1={12 + 8} x2={12 + 8} y1={19 + 8} y2={22 + 8} />
          <circle cx={12 + 8} cy={12 + 8} r={7} />
      </svg>
    </div>
  );
};
