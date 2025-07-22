import React, { createContext, useContext } from 'react';
import type { IColumnVisibilityListItem, ITableFilter } from '../lib';

/**
 * ===============================================
 *                 Data Context
 * ===============================================
 */
interface ITableContext {
  headerHeight: number;
  outerTableheight: number;
  outerTableWidth: number;
  scrollbarWidth: number;
  expandedContentHeight: number;
  isFilterVisible: boolean;
  sort: ITableFilter['sort'];
  filterSearch: ITableFilter['search'];
  filterSelection: ITableFilter['filterSelection'];
  filterAdvance: ITableFilter['filterAdvance'];
  handleToggleFilterVisibility: () => void;
  handleResizeColumn: (key: string, columnIndex: number, newWidth: number) => void;
  columnVisibilityList: IColumnVisibilityListItem[];
  visibleColumns: string[];
  handleToggleColumnVisibility: (key: string) => void;
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
    outerTableheight,
    outerTableWidth,
    scrollbarWidth,
    headerHeight,
    expandedContentHeight,
    isFilterVisible,
    filterSearch,
    filterSelection,
    filterAdvance,
    handleResizeColumn,
    handleToggleFilterVisibility,
    columnVisibilityList,
    visibleColumns,
    handleToggleColumnVisibility,
  } = props;

  const contextValue = React.useMemo(
    (): ITableContext => ({
      sort,
      outerTableheight,
      outerTableWidth,
      scrollbarWidth,
      expandedContentHeight,
      isFilterVisible,
      filterSearch,
      headerHeight,
      filterAdvance,
      filterSelection,
      handleResizeColumn,
      handleToggleFilterVisibility,
      columnVisibilityList,
      visibleColumns,
      handleToggleColumnVisibility,
    }),
    [
      sort,
      expandedContentHeight,
      isFilterVisible,
      filterSearch,
      filterSelection,
      filterAdvance,
      headerHeight,
      handleResizeColumn,
      handleToggleFilterVisibility,
      outerTableheight,
      outerTableWidth,
      scrollbarWidth,
      columnVisibilityList,
      visibleColumns,
      handleToggleColumnVisibility,
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
  if (!context) throw new Error('useTableContext must be used within a TableProvider');
  return context;
};
