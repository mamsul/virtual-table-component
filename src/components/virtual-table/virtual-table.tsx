import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import {
  useFlattenedData,
  useFilterSearch,
  useFilterSort,
  useFilterSelection,
  useFilterAdvance,
} from './hooks';
import { DEFAULT_SIZE, type IColumn, type IVirtualTable } from './lib';
import { TableProvider } from './context/table-context';
import VirtualHeader from './virtual-header';
import VirtualBody from './virtual-body';
import './lib/style.css';

export default function VirtualTable<TData>(virtualTableProps: IVirtualTable<TData>) {
  const {
    columns,
    data = [],
    headerHeight,
    hideHeader,
    rowHeight,
    getRowKey,
    renderExpandedRow,
    onRowExpand,
    classNameOuterTable,
  } = virtualTableProps;

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [resizedColumns, setResizedColumns] = useState<Record<string, number>>({});

  const { sortedData, handleSort, sortKey, sortBy } = useFilterSort({
    data,
    onChangeSort: () => {},
    useServerSort: false,
    isResetFilter: false,
  });

  const { searchedData, updateSearch, resetSearch, activeSearch } = useFilterSearch({
    data: sortedData,
    useServerSearch: false,
    isResetFilter: false,
    onChangeSearch: () => {},
  });

  const { filteredData, activeFilters, updateFilter, resetAllFilter } = useFilterSelection({
    data: searchedData,
    useServerFilter: false,
    isResetFilter: false,
    onChangeFilter: () => {},
  });

  const { filteredAdvanceData, activeAdvanceFilters, applyAdvanceFilter, resetAdvanceFilter } =
    useFilterAdvance({
      data: filteredData,
      useServerAdvanceFilter: false,
      isResetFilter: false,
      onChangeAdvanceFilter: () => {},
    });

  const flattenedData = useFlattenedData(filteredAdvanceData, expandedRows, getRowKey);

  const adjustableColumns = useMemo((): IColumn<TData>[] => {
    return columns.map((column) => {
      const { key } = column;
      const currentWidth = resizedColumns[key as string];
      return { ...column, width: currentWidth ?? column.width };
    });
  }, [resizedColumns, columns]);

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
    count: adjustableColumns.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) => adjustableColumns[index].width || DEFAULT_SIZE.COLUMN_WIDTH,
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

  const handleResizeColumn = (key: string, newWidth: number) => {
    setResizedColumns((prev) => ({ ...prev, [key]: newWidth }));

    const index = columns.findIndex((column) => column.key === key);
    columnVirtualizer.resizeItem(index, newWidth);
  };

  /**
   * Properties of Table Provider.
   * Untuk digunakan di komponen lain seperti header, filter, dll.
   * Agar tidak perlu mengirim props satu per satu ke tiap komponen.
   * */
  const tableProviderValue = {
    headerHeight: headerHeight || DEFAULT_SIZE.HEADER_HEIGTH,
    handleResizeColumn,
    sort: { sortKey, sortBy, handleSort },
    filterSearch: {
      activeSearch,
      handleResetSearch: resetSearch,
      handleApplySearch: updateSearch,
    },
    filterSelection: {
      activeFilters,
      handleResetFilter: resetAllFilter,
      handleApplyFilter: updateFilter,
    },
    filterAdvance: {
      activeFilters: activeAdvanceFilters,
      handleResetFilter: resetAdvanceFilter,
      handleApplyFilter: applyAdvanceFilter,
    },
  };

  return (
    <div ref={containerRef} className='w-full h-full'>
      <TableProvider {...tableProviderValue}>
        <div
          ref={scrollElementRef}
          className={clsx(
            'border border-gray-300 overflow-auto relative h-full',
            classNameOuterTable,
          )}
        >
          {!hideHeader && <VirtualHeader columnVirtualizer={columnVirtualizer} columns={columns} />}

          <VirtualBody
            rowVirtualizer={rowVirtualizer}
            columnVirtualizer={columnVirtualizer}
            flattenedData={flattenedData}
            columns={adjustableColumns}
            renderExpandedRow={renderExpandedRow}
            onClickExpandedRow={handleClickExpandedRow}
          />
        </div>
      </TableProvider>
    </div>
  );
}
