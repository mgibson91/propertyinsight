'use client';

import React, { useState, useEffect } from 'react';

// Custom React component that adjusts its content based on screen width
const ResponsiveDisplay = ({
  breakpoint = 600,
  children,
  mobileFallback,
}: {
  breakpoint?: number;
  children: React.ReactNode;
  mobileFallback: React.ReactNode;
}) => {
  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsNarrowScreen(window.innerWidth < breakpoint);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return <>{isNarrowScreen ? mobileFallback : children}</>;
};

export default ResponsiveDisplay;
