import { createContext, useContext, type ReactNode } from 'react';
import type { registerApplication } from '@application/di/register';

export type Stores = ReturnType<typeof registerApplication>;

const StoresContext = createContext<Stores | null>(null);

export interface StoresProviderProps {
  value: Stores;
  children: ReactNode;
}

export const StoresProvider = ({ value, children }: StoresProviderProps): React.JSX.Element => {
  return <StoresContext.Provider value={value}>{children}</StoresContext.Provider>;
};

export const useStores = (): Stores => {
  const value = useContext(StoresContext);
  if (value === null) {
    throw new Error('useStores called outside of StoresProvider');
  }
  return value;
};
