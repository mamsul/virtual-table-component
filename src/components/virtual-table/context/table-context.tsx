import React, { createContext, useContext } from 'react';
import type { ITableContext } from '../lib';

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
    headers,
    flattenedData,
    selectedRow,
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
    columnVisibilityList,
    visibleColumns,
    expandedRows,
    renderExpandedRow,
    getRowKey,
    handleResizeColumn,
    handleClickExpandRow,
    handleToggleFilterVisibility,
    handleToggleColumnVisibility,
    handleClickRow,
    handleDoubleClickRow,
    handleRightClickRow,
    checkboxSelectionRow,
  } = props;

  const contextValue = React.useMemo(
    (): ITableContext => ({
      headers,
      flattenedData,
      selectedRow,
      getRowKey,
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
      expandedRows,
      renderExpandedRow,
      handleResizeColumn,
      handleClickExpandRow,
      handleToggleFilterVisibility,
      columnVisibilityList,
      visibleColumns,
      handleToggleColumnVisibility,
      handleClickRow,
      handleDoubleClickRow,
      handleRightClickRow,
      checkboxSelectionRow,
    }),
    [
      headers,
      flattenedData,
      selectedRow,
      getRowKey,
      sort,
      expandedContentHeight,
      isFilterVisible,
      filterSearch,
      filterSelection,
      filterAdvance,
      headerHeight,
      expandedRows,
      renderExpandedRow,
      handleResizeColumn,
      handleClickExpandRow,
      handleToggleFilterVisibility,
      outerTableheight,
      outerTableWidth,
      scrollbarWidth,
      columnVisibilityList,
      visibleColumns,
      handleToggleColumnVisibility,
      handleClickRow,
      handleDoubleClickRow,
      handleRightClickRow,
      checkboxSelectionRow,
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
