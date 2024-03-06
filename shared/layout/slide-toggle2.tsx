'use client';

import React, { useRef, useState } from 'react';

const SlideToggle = ({
  trigger,
  children,
  heightClass = 'h-[300px]',
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  heightClass: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const updatedTrigger = React.cloneElement(
    trigger as any,
    {
      onClick: toggleVisibility,
    } as any
  );

  return (
    <div className="relative w-full">
      <div>{updatedTrigger}</div>

      <div
        className={`overflow-hidden w-full transition-all duration-500 ease-in-out ${!isVisible ? 'h-[0px] opacity-0' : `${heightClass} opacity-100`}`}
      >
        {children}
      </div>
    </div>
  );
};

export default SlideToggle;
