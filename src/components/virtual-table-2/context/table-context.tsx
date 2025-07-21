import React, { createContext, useContext } from 'react';
import type { ITableFilter } from '../lib';

/**
 * ===============================================
 *                 Data Context
 * ===============================================
 */
interface ITableContext {
  scrollbarWidth: number;
  headerHeight: number;
  outerTableheight: number;
  outerTableWidth: number;
  isFilterVisible: boolean;
  sort: ITableFilter['sort'];
  filterSearch: ITableFilter['search'];
  filterSelection: ITableFilter['filterSelection'];
  filterAdvance: ITableFilter['filterAdvance'];
  handleToggleFilterVisibility: () => void;
  handleResizeColumn: (key: string, columnIndex: number, newWidth: number) => void;
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
    scrollbarWidth,
    outerTableheight,
    outerTableWidth,
    headerHeight,
    isFilterVisible,
    filterSearch,
    filterSelection,
    filterAdvance,
    handleResizeColumn,
    handleToggleFilterVisibility,
  } = props;

  const contextValue = React.useMemo(
    (): ITableContext => ({
      sort,
      scrollbarWidth,
      outerTableheight,
      outerTableWidth,
      isFilterVisible,
      filterSearch,
      headerHeight,
      filterAdvance,
      filterSelection,
      handleResizeColumn,
      handleToggleFilterVisibility,
    }),
    [
      sort,
      isFilterVisible,
      outerTableWidth,
      filterSearch,
      filterSelection,
      filterAdvance,
      headerHeight,
    ],
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
