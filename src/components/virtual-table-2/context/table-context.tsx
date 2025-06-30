import React, { createContext, useContext } from 'react';
import type { ITableFilter } from '../lib';

/**
 * ===============================================
 *                 Data Context
 * ===============================================
 */
interface ITableContext {
  headerHeight: number;
  sort: ITableFilter['sort'];
  filterSearch: ITableFilter['search'];
  filterSelection: ITableFilter['filterSelection'];
  filterAdvance: ITableFilter['filterAdvance'];
  handleResizeColumn: (key: string, newWidth: number) => void;
}

const TableContext = createContext<ITableContext | undefined>(undefined);

/**
 * ===============================================
 *                 Data Provider
 * ===============================================
 */
interface TableProviderProps extends ITableContext {
  children: React.ReactNode;
}

export const TableProvider = (props: TableProviderProps) => {
  const {
    children,
    sort,
    filterSearch,
    filterSelection,
    filterAdvance,
    handleResizeColumn,
    headerHeight,
  } = props;

  const contextValue = React.useMemo(
    (): ITableContext => ({
      sort,
      filterSearch,
      headerHeight,
      handleResizeColumn,
      filterAdvance,
      filterSelection,
    }),
    [sort, filterSearch, filterSelection, filterAdvance, headerHeight],
  );

  return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
};

/**
 * ===============================================
 *                 Data Consumer
 * ===============================================
 */
export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) throw new Error('useMyContext must be used within a MyProvider');
  return context;
};
