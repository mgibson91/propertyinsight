'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserMetadata {
  userId: string;
  email: string;
  // subscribed: boolean;
  // creditBalance: number;
}

// Create a context with a default empty value
const UserMetadataContext = createContext<[UserMetadata, (metadata: Partial<UserMetadata>) => void]>([
  {
    userId: '',
    email: '',
    // subscribed: false,
    // creditBalance: 0,
  },
  () => {},
]);

// Create a provider component
export const UserMetadataProvider = ({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: UserMetadata;
}) => {
  const initialMetadata = {
    userId: defaultValues?.userId || '',
    email: defaultValues?.email || '',
    // subscribed: defaultValues?.subscribed || false,
    // creditBalance: defaultValues?.creditBalance || 0,
  };

  const [userMetadata, setUserMetadata] = useState<UserMetadata>(initialMetadata);

  useEffect(() => {
    if (defaultValues) {
      setUserMetadata(defaultValues);
    }
  }, [defaultValues]);

  const setPartialUserMetadata = (newMetadata: Partial<UserMetadata>) => {
    const updatedMetadata = { ...userMetadata, ...newMetadata };
    setUserMetadata(updatedMetadata);
  };

  return (
    <UserMetadataContext.Provider value={[userMetadata, setPartialUserMetadata]}>
      {children}
    </UserMetadataContext.Provider>
  );
};

// Custom hook that components can use to access the context value
export const useUserMetadata = () => {
  const context = useContext(UserMetadataContext);
  if (context === undefined) {
    throw new Error('useUserMetadata must be used within a UserMetadataProvider.');
  }
  return context;
};
