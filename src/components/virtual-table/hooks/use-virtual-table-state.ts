import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  DEFAULT_SIZE,
  getScrollbarWidth,
  type IHeader,
  type ITableContext,
  type IVirtualTable,
  type TSortOrder,
} from '../lib';
import {
  useFilterAdvance,
  useFilterSearch,
  useFilterSelection,
  useFilterSort,
  useFlattenedData,
} from '.';
import { useStretchColumns } from './use-stretch-columns';

export function useVirtualTableState<TData>(virtualTableProps: IVirtualTable<TData>) {
  const {
    data = [],
    headers,
    headerHeight,
    rowHeight,
    getRowKey,
    onRowExpand,
    renderExpandedRow,
    onScroll,
    getScrollElement,
    onClickRow,
    onDoubleClickRow,
    onRightClickRow,
    onSelectCheckboxRow,
  } = virtualTableProps;

  const scrollElementRef = useRef<HTMLDivElement>(null);
  const scrollbarWidth = getScrollbarWidth(scrollElementRef);
  const outerTableheight = scrollElementRef.current?.offsetHeight || 0;
  const outerTableWidth = scrollElementRef.current?.offsetWidth || 0;

  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(true);
  const [selectedRow, setSelectedRow] = useState<TData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [tableHeaders, setTableHeaders] = useState<IHeader<TData>[]>(headers);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    headers.map((col) => col.key as string),
  );

  const handleToggleColumnVisibility = useCallback((key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  // Only visible columns
  const memoizedVisibleHeaders = useMemo(
    () => tableHeaders.filter((col) => visibleColumns.includes(col.key as string)),
    [tableHeaders, visibleColumns],
  );

  const columnVisibilityList = useMemo(() => {
    return tableHeaders
      .filter(({ key }) => key !== 'expand')
      .map(({ key, caption }) => ({
        key: key as string,
        caption,
        checked: visibleColumns.includes(key as string),
      }));
  }, [tableHeaders, visibleColumns]);

  const { extraWidth } = useStretchColumns<TData>({
    columns: memoizedVisibleHeaders,
    outerTableWidth,
    scrollbarWidth,
  });

  useEffect(() => {
    if (getScrollElement) getScrollElement(scrollElementRef.current);
  }, [getScrollElement]);

  // columnVirtualizer is created after useTableVirtualization, so we need to call measure after extraWidth changes
  const { sortedData, sortKey, sortBy, handleSort, handleSpecificSort } = useFilterSort({
    data,
    onChangeSort: () => {},
  });

  const { searchedData, activeSearch, updateSearch, resetSearch } = useFilterSearch({
    data: sortedData,
    isResetFilter: false,
    useServerSearch: false,
    onChangeSearch: () => {},
  });

  const { filteredData, activeFilters, updateFilter, resetFilter } = useFilterSelection({
    data: searchedData,
    isResetFilter: false,
    useServerFilter: false,
    onChangeFilter: () => {},
  });

  const { filteredAdvanceData, activeAdvanceFilters, applyAdvanceFilter, resetAdvanceFilter } =
    useFilterAdvance({
      data: filteredData,
      isResetFilter: false,
      useServerAdvanceFilter: false,
      onChangeAdvanceFilter: () => {},
    });

  const flattenedData = useFlattenedData(filteredAdvanceData, expandedRows, getRowKey);

  // Row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: flattenedData.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) => {
      const item = flattenedData[index];
      return item.type === 'row'
        ? rowHeight || DEFAULT_SIZE.ROW_HEIGHT
        : DEFAULT_SIZE.EXPANDED_ROW_HEIGHT;
    },
    overscan: 20,
  });

  // Column virtualizer
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: memoizedVisibleHeaders.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) =>
      (memoizedVisibleHeaders[index].width || DEFAULT_SIZE.COLUMN_WIDTH) +
      (memoizedVisibleHeaders[index].noStretch ? 0 : extraWidth),
    overscan: 10,
  });

  useEffect(() => {
    if (columnVirtualizer) columnVirtualizer.measure();
  }, [extraWidth]);

  const handleResizeColumn = useCallback(
    (headerKey: string, columnIndex: number, newWidth: number) => {
      setTableHeaders((prevHeaders) => {
        const newHeaders = [...prevHeaders];
        const columnIndex = newHeaders.findIndex((col) => col.key === headerKey);
        newHeaders[columnIndex].width = newWidth;
        newHeaders[columnIndex].noStretch = true;
        return newHeaders;
      });
      columnVirtualizer.resizeItem(columnIndex, newWidth);
    },
    [columnVirtualizer],
  );

  const handleClickExpandRow = useCallback(
    (item: unknown) => {
      const key = getRowKey(item as TData);
      setExpandedRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        return newSet;
      });
      onRowExpand?.(item as TData);
    },
    [getRowKey, onRowExpand],
  );

  const handleClickRow = useCallback(
    (item: unknown) => {
      if (selectedRow && getRowKey(selectedRow) === getRowKey(item as TData)) return;

      setSelectedRow(item as TData);
      onClickRow?.(item as TData);
    },
    [onClickRow, selectedRow],
  );

  const handleDoubleClickRow = useCallback(
    (item: unknown) => {
      if (onClickRow) return;
      if (selectedRow && getRowKey(selectedRow) === getRowKey(item as TData)) return;

      setSelectedRow(item as TData);
      onDoubleClickRow?.(item as TData);
    },
    [onDoubleClickRow, selectedRow],
  );

  const handleRightClickRow = useCallback(
    (item: unknown, position: { x: number; y: number }) => {
      setSelectedRow(item as TData);
      onRightClickRow?.(item as TData, position);
    },
    [onRightClickRow],
  );

  const handleSelectCheckboxRow = useCallback(
    (item: unknown) => {
      const key = getRowKey(item as TData);
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }

        if (onSelectCheckboxRow) {
          const selectedKeys = Array.from(newSet);
          onSelectCheckboxRow?.(selectedKeys);
        }

        return newSet;
      });
    },
    [getRowKey, onSelectCheckboxRow],
  );

  const handleSelectAllCheckboxRow = useCallback(() => {
    const allKeys = flattenedData
      .filter((item) => item.type === 'row')
      .map((item) => getRowKey(item.item as TData));

    setSelectedRows(new Set(allKeys));

    if (onSelectCheckboxRow) {
      onSelectCheckboxRow?.(allKeys);
    }
  }, [flattenedData, getRowKey, onSelectCheckboxRow, data]);

  const handleUnselectAllCheckboxRow = useCallback(() => {
    setSelectedRows(new Set());
    if (onSelectCheckboxRow) {
      onSelectCheckboxRow?.([]);
    }
  }, [onSelectCheckboxRow]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(e.currentTarget.scrollTop);
    },
    [onScroll],
  );

  const handleToggleFilterVisibility = useCallback(() => setIsFilterVisible((prev) => !prev), []);

  const expandedContentHeight = DEFAULT_SIZE.EXPANDED_ROW_HEIGHT;
  const tableHeaderHeight = headerHeight || DEFAULT_SIZE.HEADER_HEIGTH;
  const tableBodyTopPosition =
    headerHeight || DEFAULT_SIZE.HEADER_HEIGTH + (isFilterVisible ? DEFAULT_SIZE.FILTER_HEIGHT : 0);

  const tableProviderValue: ITableContext = {
    headers: tableHeaders as IHeader<unknown>[],
    flattenedData,
    selectedRow,
    isFilterVisible,
    outerTableheight,
    outerTableWidth,
    scrollbarWidth,
    expandedContentHeight,
    headerHeight: tableHeaderHeight,
    columnVisibilityList,
    visibleColumns,
    expandedRows,
    sort: { sortKey, sortBy: sortBy as TSortOrder, handleSort, handleSpecificSort },
    filterSearch: {
      activeSearch,
      handleResetSearch: resetSearch,
      handleApplySearch: updateSearch,
    },
    filterSelection: {
      activeFilters,
      handleResetFilter: resetFilter,
      handleApplyFilter: updateFilter,
    },
    filterAdvance: {
      activeFilters: activeAdvanceFilters,
      handleResetFilter: resetAdvanceFilter,
      handleApplyFilter: applyAdvanceFilter,
    },
    checkboxSelectionRow: {
      selectedRows,
      handleSelectCheckboxRow,
      handleSelectAllCheckboxRow,
      handleUnselectAllCheckboxRow,
    },
    getRowKey: getRowKey as (item: unknown) => string | number,
    renderExpandedRow: renderExpandedRow as (item: unknown) => React.ReactNode,
    handleClickExpandRow,
    handleResizeColumn,
    handleToggleFilterVisibility,
    handleToggleColumnVisibility,
    handleClickRow: onClickRow ? handleClickRow : undefined,
    handleDoubleClickRow: onDoubleClickRow ? handleDoubleClickRow : undefined,
    handleRightClickRow: onRightClickRow ? handleRightClickRow : undefined,
  };

  return {
    scrollElementRef,
    columnVirtualizer,
    rowVirtualizer,
    flattenedData,
    tableProviderValue,
    handleScroll,
    headers: memoizedVisibleHeaders,
    tableBodyTopPosition,
    outerTableWidth,
    scrollbarWidth,
  };
}
