'use client';

import React, { useState } from 'react';

type SwitcherProps = {
  onClick?: (value: boolean) => void;
};

export const Switcher: React.FC<SwitcherProps> = ({ onClick }) => {
  const [switchValue, setSwitchValue] = useState(false);

  const handleClick = () => {
    const newValue = !switchValue;
    setSwitchValue(newValue);
    if (onClick) {
      onClick(newValue); // Pass the new value to the parent
    }
  };

  return (
    <button
      style={{
        width: 39,
        backgroundColor: switchValue ? 'var(--main-turquoise)' : '#DCE2E7',
        borderRadius: 12,
        padding: '1.5px 1.5px',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: switchValue ? 'flex-end' : 'flex-start',
      }}
      onClick={handleClick}
    >
      <div
        style={{
          width: 20.9,
          height: 20.9,
          backgroundColor: switchValue
            ? 'var(--white-color)'
            : 'var(--text-color)',
          borderRadius: 11,
          alignSelf: switchValue ? 'flex-end' : 'flex-start',
        }}
      />
    </button>
  );
};
