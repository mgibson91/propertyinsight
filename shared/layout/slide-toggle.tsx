'use client';

import React, { useRef, useState } from 'react';
import { useResizeObserver } from 'usehooks-ts';

type Size = {
  width?: number;
  height?: number;
};

const SlideToggle = ({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const ref = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  const onResize = (size: Size) => {
    // Set height of placeholder to match content
    if (placeholderRef.current) {
      placeholderRef.current.style.height = `${size.height}px`;
    }
  };

  useResizeObserver({
    ref,
    onResize,
  });

  const updatedTrigger = React.cloneElement(
    trigger as any,
    {
      onClick: toggleVisibility,
    } as any
  );

  return (
    <div className="relative w-[300px]">
      <div>{updatedTrigger}</div>
      <div className={`z-[-1] absolute w-full transition-all duration-500 ease-in-out translate-y-[-100%]`}>
        <div ref={placeholderRef} className="p-4 z-10 bg-primary-base" />
      </div>
      <div
        ref={ref}
        className={`z-[-2] absolute w-full transition-all duration-500 ease-in-out ${
          !isVisible ? 'translate-y-[-100%] opacity-0' : 'translate-y-1 opacity-100%'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default SlideToggle;
