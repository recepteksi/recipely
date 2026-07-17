import { createContext, type ReactNode } from 'react';
import type { Stores } from '@presentation/bootstrap/stores';

export const StoresContext = createContext<Stores | null>(null);

export interface StoresProviderProps {
  value: Stores;
  children: ReactNode;
}

export const StoresProvider = ({ value, children }: StoresProviderProps): React.JSX.Element => {
  return <StoresContext.Provider value={value}>{children}</StoresContext.Provider>;
};
