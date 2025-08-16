import { createContext, useContext } from 'use-context-selector';
import { useCallback, useState } from 'react';

export interface ISelectionContext {
  selectedRowKey: string | null;
  selectedRowKeys: Set<string>;
  deselectedRowKeys: Set<string>;
  expandedRowKeys: Set<string>;
  selectAll: boolean;
  toggleExpandRow: (key: string) => void;
  onClickRow: (key: string | null) => void;
  setSelectedRowKey: (key: string | null) => void;
  toggleRowSelection: (key: string) => void;
  toggleSelectAll: (mode: boolean) => void;
}

interface ISelectionContextProvider {
  children: React.ReactNode;
  onChangeCheckboxRowSelection?: (
    selectedRows: (string | number)[],
    deselectedRows: (string | number)[],
    isSelectAll: boolean,
  ) => void;
}

const SelectionContext = createContext<ISelectionContext | null>(null);

export const useSelectionContext = () => useContext(SelectionContext)!;

export const SelectionContextProvider = (props: ISelectionContextProvider) => {
  const { children, onChangeCheckboxRowSelection } = props;

  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string>>(new Set());
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [deselectedRowKeys, setDeselectedRowKeys] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const onClickRow = useCallback((key: string | null) => {
    setSelectedRowKey(key);
  }, []);

  const toggleRowSelection = useCallback(
    (key: string): void => {
      if (selectAll) {
        setDeselectedRowKeys((prev) => {
          if (prev.has(key)) {
            const next = new Set(prev);
            next.delete(key);
            onChangeCheckboxRowSelection?.([], Array.from(next), false);
            return next;
          }
          const finalData = new Set(prev).add(key);
          onChangeCheckboxRowSelection?.([], Array.from(finalData), false);

          return finalData;
        });
        return;
      }

      setSelectedRowKeys((prev) => {
        if (prev.has(key)) {
          const next = new Set(prev);
          next.delete(key);
          onChangeCheckboxRowSelection?.(Array.from(next), [], false);
          return next;
        }
        const finalData = new Set(prev).add(key);
        onChangeCheckboxRowSelection?.(Array.from(finalData), [], false);

        return finalData;
      });
    },
    [selectAll, onChangeCheckboxRowSelection],
  );

  const toggleSelectAll = useCallback(
    (mode: boolean): void => {
      onChangeCheckboxRowSelection?.([], [], mode);

      setSelectAll(mode);
      setSelectedRowKeys(new Set());
      setDeselectedRowKeys(new Set());
    },
    [onChangeCheckboxRowSelection],
  );

  const toggleExpandRow = useCallback((key: string): void => {
    setExpandedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        selectedRowKey,
        selectedRowKeys,
        deselectedRowKeys,
        selectAll,
        expandedRowKeys,
        toggleExpandRow,
        setSelectedRowKey,
        onClickRow,
        toggleRowSelection,
        toggleSelectAll,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};
