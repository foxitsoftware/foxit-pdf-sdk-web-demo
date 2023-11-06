import React, { useMemo, useState } from 'react';
import { UserId } from '../types';
type User = {
  id: UserId;
  [key: string]: any;
};
type UserContextProps = {
  currentUser: User | null;
  setCurrentUser: (currentUser: User | null) => void;
};

export const UserContext = React.createContext<UserContextProps>(
  {} as UserContextProps
);

export const useCurrentUser = () => {
  return React.useContext(UserContext);
};

export const WithCurrentUser = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
    }),
    [currentUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
