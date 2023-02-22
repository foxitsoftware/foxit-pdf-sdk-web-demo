import React, { useMemo, useState } from 'react';
type IsLoadingContextProps = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

export const IsLoadingContext = React.createContext<IsLoadingContextProps>(
  {} as IsLoadingContextProps
);

export const useIsLoading = () => {
  return React.useContext(IsLoadingContext);
};

export const WithIsLoading = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const value = useMemo(
    () => ({
      isLoading,
      setIsLoading,
    }),
    [isLoading]
  );

  return <IsLoadingContext.Provider value={value}>{children}</IsLoadingContext.Provider>;
};