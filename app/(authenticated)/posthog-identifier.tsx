'use client';

import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { useUserMetadata } from '@/app/(authenticated)/user-metadata-provider';

export const PostHogIdentifier = ({ children }: { children: React.ReactNode }) => {
  const posthog = usePostHog();
  const [{ email }] = useUserMetadata();

  useEffect(() => {
    if (email) {
      posthog.identify(email);
    } else {
      console.warn('No user found');
    }
  }, [email]);

  return <>{children}</>;
};
