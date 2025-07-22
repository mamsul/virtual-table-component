import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  DEFAULT_SIZE,
  getScrollbarWidth,
  type IColumn,
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
    columns,
    headerHeight,
    rowHeight,
    getRowKey,
    onRowExpand,
    renderExpandedRow,
    onScroll,
    getScrollElement,
  } = virtualTableProps;

  const scrollElementRef = useRef<HTMLDivElement>(null);
  const scrollbarWidth = getScrollbarWidth(scrollElementRef);
  const outerTableheight = scrollElementRef.current?.offsetHeight || 0;
  const outerTableWidth = scrollElementRef.current?.offsetWidth || 0;

  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(true);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [tableColumns, setTableColumns] = useState<IColumn<TData>[]>(columns);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    columns.map((col) => col.key as string),
  );

  const handleToggleColumnVisibility = useCallback((key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  // Only visible columns
  const memoizedVisibleColumns = useMemo(
    () => tableColumns.filter((col) => visibleColumns.includes(col.key as string)),
    [tableColumns, visibleColumns],
  );

  const columnVisibilityList = useMemo(() => {
    return tableColumns
      .filter(({ key }) => key !== 'expand')
      .map(({ key, header }) => ({
        key: key as string,
        caption: header,
        checked: visibleColumns.includes(key as string),
      }));
  }, [tableColumns, visibleColumns]);

  const { extraWidth } = useStretchColumns<TData>({
    columns: memoizedVisibleColumns,
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
    overscan: 10,
  });

  // Column virtualizer
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: memoizedVisibleColumns.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) =>
      (memoizedVisibleColumns[index].width || DEFAULT_SIZE.COLUMN_WIDTH) +
      (memoizedVisibleColumns[index].noStretch ? 0 : extraWidth),
    overscan: 2,
  });

  useEffect(() => {
    if (columnVirtualizer) columnVirtualizer.measure();
  }, [extraWidth]);

  const handleResizeColumn = useCallback(
    (columnKey: string, columnIndex: number, newWidth: number) => {
      setTableColumns((prevColumns) => {
        const newColumns = [...prevColumns];
        const columnIndex = newColumns.findIndex((col) => col.key === columnKey);
        newColumns[columnIndex].width = newWidth;
        newColumns[columnIndex].noStretch = true;
        return newColumns;
      });
      columnVirtualizer.resizeItem(columnIndex, newWidth);
    },
    [columnVirtualizer],
  );

  const handleClickExpandedRow = useCallback(
    (item: TData) => {
      const key = getRowKey(item);
      setExpandedRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        return newSet;
      });
      onRowExpand?.(item);
    },
    [getRowKey, onRowExpand],
  );

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

  const tableProviderValue = {
    isFilterVisible,
    outerTableheight,
    outerTableWidth,
    scrollbarWidth,
    expandedContentHeight,
    headerHeight: tableHeaderHeight,
    columnVisibilityList,
    visibleColumns,
    handleToggleColumnVisibility,
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
    handleResizeColumn,
    handleToggleFilterVisibility,
  };

  return {
    scrollElementRef,
    columnVirtualizer,
    rowVirtualizer,
    flattenedData,
    tableProviderValue,
    handleScroll,
    handleClickExpandedRow,
    renderExpandedRow,
    columns: memoizedVisibleColumns,
    headerHeight,
    tableBodyTopPosition,
    getRowKey,
  };
}
