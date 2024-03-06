'use client';

import * as React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import './toast.css';
import { Button, Card, Heading } from '@radix-ui/themes';

export const Toast = ({
  title,
  children,
  action,
  description,
  durationMs = 3000,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  description?: React.ReactNode;
  durationMs?: number;
}) => {
  const [open, setOpen] = React.useState(false);
  const timerRef = React.useRef(0);

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleChildClick = (childOnClick: () => void) => {
    setOpen(false);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setOpen(true);
    }, 100);

    // If the child has its own onClick handler, call it
    if (childOnClick) {
      childOnClick();
    }
  };

  // Clone each child and inject the onClick handler
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: () => handleChildClick(child.props.onClick),
      } as any);
    }
    return child;
  });

  return (
    <RadixToast.Provider swipeDirection="right" duration={durationMs || 3000}>
      {childrenWithProps}

      <RadixToast.Root className="ToastRoot" open={open} onOpenChange={setOpen}>
        {title && (
          <RadixToast.Title className="ToastTitle">
            <Heading size={'3'}>{title}</Heading>
          </RadixToast.Title>
        )}

        {description && <RadixToast.Description>{description}</RadixToast.Description>}

        {action && (
          <RadixToast.Action className={'ToastAction'} asChild altText="Description">
            {action}
          </RadixToast.Action>
        )}
      </RadixToast.Root>
      <RadixToast.Viewport className="ToastViewport" />
    </RadixToast.Provider>
  );
};
