import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';

import { DEFAULT_SIZE, type IVirtualTable, type TSortOrder } from './lib';
import {
  useFilterAdvance,
  useFilterSearch,
  useFilterSelection,
  useFilterSort,
  useFlattenedData,
} from './hooks';
import { TableProvider } from './context/table-context';
import VirtualTableHeader from './virtual-table-header';
import VirtualTableBody from './virtual-table-body';
import './lib/style.css';

export default function VirtualTable<TData>(virtualTableProps: IVirtualTable<TData>) {
  const {
    data = [],
    columns,
    headerHeight,
    rowHeight,
    getRowKey,
    classNameOuterTable,
    onRowExpand,
    renderExpandedRow,
    onScroll,
    getScrollElement,
  } = virtualTableProps;

  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

  const { sortedData, sortKey, sortBy, handleSort } = useFilterSort({
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

  useEffect(() => {
    if (getScrollElement) getScrollElement(scrollElementRef.current);
  }, [getScrollElement]);

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
    count: columns.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) => columns[index].width || DEFAULT_SIZE.COLUMN_WIDTH,
    overscan: 2,
  });

  const handleClickExpandedRow = (item: TData) => {
    const key = getRowKey(item);

    setExpandedRows((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });

    onRowExpand?.(item);
  };

  // Attach scroll event to notify parent
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(e.currentTarget.scrollTop);
  };

  /**
   * Properties of Table Provider.
   * Untuk digunakan di komponen lain seperti header, filter, dll.
   * Agar tidak perlu mengirim props satu per satu ke tiap komponen.
   * */
  const tableProviderValue = {
    headerHeight: headerHeight || DEFAULT_SIZE.HEADER_HEIGTH,
    handleResizeColumn: () => {},
    sort: { sortKey, sortBy: sortBy as TSortOrder, handleSort },
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
  };

  return (
    <TableProvider {...tableProviderValue}>
      <div
        ref={scrollElementRef}
        className={clsx('w-full h-full overflow-auto border border-gray-200', classNameOuterTable)}
        style={{ position: 'relative' }}
        onScroll={handleScroll}
      >
        <div
          style={{
            width: columnVirtualizer.getTotalSize(),
            height: rowVirtualizer.getTotalSize(),
            position: 'relative',
          }}
        >
          {/* Table Sticky Header */}
          <VirtualTableHeader columns={columns} columnVirtualizer={columnVirtualizer} />

          {/* Table Body */}
          <VirtualTableBody
            columnVirtualizer={columnVirtualizer}
            rowVirtualizer={rowVirtualizer}
            flattenedData={flattenedData}
            renderExpandedRow={renderExpandedRow}
            expandedContentWidth={scrollElementRef?.current?.offsetWidth ?? 0}
            headerHeight={headerHeight || DEFAULT_SIZE.HEADER_HEIGTH}
            onClickExpandedRow={handleClickExpandedRow}
            columns={columns}
          />
        </div>
      </div>
    </TableProvider>
  );
}
