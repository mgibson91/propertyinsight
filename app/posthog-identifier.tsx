'use client';

import { usePostHog } from 'posthog-js/react';
import { useUserMetadata } from '@/app/user-metadata-provider';
import { useEffect } from 'react';

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
