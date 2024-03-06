'use client';

import React, { useRef, useState } from 'react';
import { useResizeObserver } from 'usehooks-ts';

type Size = {
  width?: number;
  height?: number;
};

const SlideToggle = ({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

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
      {/*<button*/}
      {/*  onClick={toggleVisibility}*/}
      {/*  className="z-2 px-4 py-2 bg-blue-500 text-white cursor-pointer font-semibold rounded hover:bg-blue-700 transition duration-300"*/}
      {/*>*/}
      {/*  Toggle Content*/}
      {/*</button>*/}
      <div className={''}>{updatedTrigger}</div>
      <div className={`z-[-1] absolute w-full transition-all duration-500 ease-in-out translate-y-[-100%]`}>
        <div ref={placeholderRef} className="p-4 z-10 bg-primary-base" />
      </div>
      <div
        ref={ref}
        className={`z-[-2] absolute w-full transition-all duration-500 ease-in-out ${
          !isVisible ? 'translate-y-[-100%] opacity-0' : 'translate-y-1 opacity-100%'
        }`}
      >
        {/*<div className="p-4 border border-gray-200 shadow rounded bg-white h-[300px]">*/}
        {/*  This is the content that slides into view directly below the button. This is the content that slides into view*/}
        {/*  directly below the button. This is the content that slides into view directly below the button. This is the*/}
        {/*  content that slides into view directly below the button. This is the content that slides into view directly*/}
        {/*  below the button. This is the content that slides into view directly below the button.*/}
        {/*</div>*/}
        {children}
      </div>
    </div>
  );
};

export default SlideToggle;
