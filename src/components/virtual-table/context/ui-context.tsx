import type { ReactNode } from 'react';
import { createContext, useContext } from 'use-context-selector';

export interface IUIContext {
  expandedContent: (rowData: unknown) => ReactNode;
}

const UIContext = createContext<IUIContext | null>(null);

export const useUIContext = () => useContext(UIContext)!;

interface IUIContextProviderProps {
  children: ReactNode;
  expandedContent?: (rowData: unknown) => ReactNode;
}

export const UIContextProvider = ({ children, expandedContent }: IUIContextProviderProps) => {
  return (
    <UIContext.Provider value={{ expandedContent: expandedContent || (() => null) }}>
      {children}
    </UIContext.Provider>
  );
};

export default UIContextProvider;
