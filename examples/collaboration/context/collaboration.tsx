import { Collaboration } from '@foxitsoftware/web-collab-client';
import React, { useMemo, useState } from 'react';

type CollaborationContextProps = {
  collaboration: Collaboration | null;
  setCollaboration: (collaboration: Collaboration | null) => void;
};

export const CollaborationContext = React.createContext<CollaborationContextProps>(
  {} as CollaborationContextProps
);

export const useCurrentCollaboration = () => {
  return React.useContext(CollaborationContext);
};

export const WithCollaboration = ({ children }) => {
  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);

  const value = useMemo(
    () => ({
      collaboration,
      setCollaboration,
    }),
    [collaboration]
  );

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
};
