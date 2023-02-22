import { WebCollabClient } from '@foxitsoftware/web-collab-client';
import React, { useMemo, useState } from 'react';

type CollabClientContextProps = {
  collabClient: WebCollabClient | null;
  setCollabClient: (collabClient: WebCollabClient | null) => void;
};

export const CollabClientContext = React.createContext<CollabClientContextProps>(
  {} as CollabClientContextProps
);

export const useCurrentCollabClient = () => {
  return React.useContext(CollabClientContext);
};

export const WithCollabClient= ({ children }) => {
  const [collabClient, setCollabClient] = useState<WebCollabClient | null>(null);

  const value = useMemo(
    () => ({
      collabClient,
      setCollabClient,
    }),
    [collabClient]
  );

  return <CollabClientContext.Provider value={value}>{children}</CollabClientContext.Provider>;
};
