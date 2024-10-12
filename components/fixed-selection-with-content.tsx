'use client';

import { ElementRef, Suspense, useEffect, useRef, useState } from 'react';
import Loading from './loading';

export function FixedSelectionWithContent({
  SelectionView,
  ContentView,
}: {
  SelectionView: React.ReactNode;
  ContentView: React.ReactNode;
}) {
  const [showBorder, setShowBorder] = useState(false);
  const scrollableDivRef = useRef<ElementRef<'div'>>(null);

  useEffect(() => {
    const handleScroll = (event: any) => {
      setShowBorder(event.target.scrollTop > 0);
    };

    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const SECTION_STYLES = `px-6 w-full max-w-7xl`;

  return (
    <div ref={scrollableDivRef} className={'w-full flex flex-col flex-auto items-center overflow-auto'}>
      <div className={`${SECTION_STYLES} flex-auto flex flex-col items-start relative pt-[200px] md:pt-[100px]`}>
        <div
          className={`${SECTION_STYLES} h-[200px] md:h-[90px] flex items-end fixed top-[50px] bg-background z-10
          transform border-border transition-all duration-200 ${showBorder ? 'border-b-2' : ''}`}
        >
          {SelectionView}
        </div>

        <Suspense fallback={<Loading subject="Properties" />}>{ContentView}</Suspense>
      </div>
    </div>
  );
}
