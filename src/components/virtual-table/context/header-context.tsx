import { createContext, useContext } from 'use-context-selector';
import { useState, useCallback } from 'react';
import type { IHeader } from '../lib';

export interface HeaderContext extends IHeader<unknown> {
  [key: string]: unknown;
}

type HeaderConfigContextValue = {
  columns: HeaderContext[];
  isFilterVisible: boolean;
  updateColumn: (key: string, update: Partial<HeaderContext>) => void;
  setWidth: (key: string, width: number) => void;
  toggleColumnVisibility: (key: string) => void;
  toggleFilterVisibility: () => void;
};

const HeaderContext = createContext<HeaderConfigContextValue | null>(null);

export const useHeaderContext = () => useContext(HeaderContext)!;

export const HeaderContextProvider = ({
  initialColumns,
  children,
}: {
  initialColumns: HeaderContext[];
  children: React.ReactNode;
}) => {
  const [columns, setColumns] = useState<HeaderContext[]>(initialColumns);
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  const updateColumn = useCallback((key: string, update: Partial<HeaderContext>) => {
    setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, ...update } : col)));
  }, []);

  const toggleColumnVisibility = useCallback(
    (key: string) => {
      updateColumn(key, { visible: !columns.find((col) => col.key === key)?.visible });
    },
    [columns, updateColumn],
  );

  const setWidth = useCallback(
    (key: string, width: number) => {
      updateColumn(key, { width });
    },
    [updateColumn],
  );

  const toggleFilterVisibility = useCallback(() => {
    setIsFilterVisible((prev) => !prev);
  }, []);

  return (
    <HeaderContext.Provider
      value={{
        columns,
        updateColumn,
        toggleColumnVisibility,
        setWidth,
        isFilterVisible,
        toggleFilterVisibility,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};
