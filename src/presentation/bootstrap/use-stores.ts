import { useContext } from 'react';
import { StoresContext } from '@presentation/bootstrap/stores-context';
import type { Stores } from '@presentation/bootstrap/stores';

/** Reads the DI-provided store bundle; throws when used outside a provider. */
export const useStores = (): Stores => {
  const value = useContext(StoresContext);
  if (value === null) {
    throw new Error('useStores called outside of StoresProvider');
  }
  return value;
};
