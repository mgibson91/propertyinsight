import React, { useState } from 'react';
import { Button } from '@radix-ui/themes';
import { LoadingDots } from './loading-dots';

export function AsyncButton({
  className,
  onClick,
  children,
  ...props
}: {
  className?: string;
  disabled?: boolean;
  size?: '1' | '2' | '3' | '4';
  onClick: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error('Error during async operation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button {...props} className={className} onClick={handleClick} disabled={isLoading}>
      {isLoading ? <LoadingDots /> : children}
    </Button>
  );
}
