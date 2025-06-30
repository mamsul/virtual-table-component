import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';

import { useFlattenedData } from './hooks';
import { DEFAULT_SIZE, type IVirtualTable, type TSortOrder } from './lib';
import './lib/style.css';
import Icon from './icons';
import { TableProvider } from './context/table-context';
import VirtualHeader from './virtual-header';

export default function VirtualTable2<TData>(
  virtualTableProps: IVirtualTable<TData> & {
    onScroll?: (scrollTop: number) => void;
    getScrollElement?: (el: HTMLDivElement | null) => void;
  },
) {
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

  const flattenedData = useFlattenedData(data, expandedRows, getRowKey);

  useEffect(() => {
    if (getScrollElement) {
      getScrollElement(scrollElementRef.current);
    }
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
    sort: { sortKey: '', sortBy: 'unset' as TSortOrder, handleSort: () => {} },
    filterSearch: {
      activeSearch: {},
      handleResetSearch: () => {},
      handleApplySearch: () => {},
    },
    filterSelection: {
      activeFilters: {},
      handleResetFilter: () => {},
      handleApplyFilter: () => {},
    },
    filterAdvance: {
      activeFilters: {},
      handleResetFilter: () => {},
      handleApplyFilter: () => {},
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
          {/* Sticky Header */}
          <VirtualHeader columns={columns} columnVirtualizer={columnVirtualizer} />

          {/* Virtualized Rows */}
          <table
            style={{
              position: 'absolute',
              top: headerHeight || DEFAULT_SIZE.HEADER_HEIGTH,
              left: 0,
              width: '100%',
              tableLayout: 'fixed',
            }}
          >
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = flattenedData[virtualRow.index];

                // Render normal row
                if (row.type === 'row') {
                  return (
                    <tr
                      key={virtualRow.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        width: '100%',
                      }}
                      className='border-b border-gray-200 hover:bg-gray-50'
                    >
                      {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
                        const column = columns[virtualColumn.index];
                        const data = row.item;
                        return (
                          <td
                            key={virtualColumn.index}
                            style={{
                              position: 'absolute',
                              left: 0,
                              width: `${virtualColumn.size}px`,
                              height: '100%',
                              transform: `translateX(${virtualColumn.start}px)`,
                            }}
                            className='px-1.5 flex items-center border-r border-gray-300 text-xs'
                          >
                            {column?.render ? (
                              column.render(data)
                            ) : (
                              <span className='text-muted-foreground line-clamp-1'>
                                {String(data?.[column?.key as keyof TData] ?? '')}
                              </span>
                            )}

                            {/* Render expand button if the column is for expansion */}
                            {column?.key === 'expand' && (
                              <div className='flex justify-center items-center'>
                                <button
                                  className='hover:bg-gray-100 transition-colors'
                                  onClick={() => handleClickExpandedRow(data)}
                                >
                                  <Icon name='chevron' className='!size-5 -rotate-90' />
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                }

                // Render expanded row
                if (row.type === 'expanded') {
                  return (
                    <tr
                      key={virtualRow.key}
                      className='absolute top-0 left-0 w-full'
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <td colSpan={columns.length} className='border-b border-gray-200'>
                        <div
                          style={{
                            height: DEFAULT_SIZE.EXPANDED_ROW_HEIGHT,
                            width: scrollElementRef?.current?.offsetWidth,
                          }}
                        >
                          {renderExpandedRow?.(row.item)}
                        </div>
                      </td>
                    </tr>
                  );
                }

                return null;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TableProvider>
  );
}
