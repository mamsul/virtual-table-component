import { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';

import {
  DEFAULT_SIZE,
  getScrollbarWidth,
  type IColumn,
  type IVirtualTable,
  type TSortOrder,
} from './lib';
import {
  useFilterAdvance,
  useFilterSearch,
  useFilterSelection,
  useFilterSort,
  useFlattenedData,
} from './hooks';
import { TableProvider } from './context/table-context';
import './lib/style.css';
import VirtualTableHeaderItem from './virtual-table-header-item';
import VirtualTableRow from './virtual-table-row';
import { useStretchColumns } from './hooks/use-stretch-columns';
import { useTableVirtualization } from './hooks/use-table-virtualization';

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
  const scrollbarWidth = getScrollbarWidth(scrollElementRef);
  const outerTableheight = scrollElementRef.current?.offsetHeight || 0;
  const outerTableWidth = scrollElementRef.current?.offsetWidth || 0;

  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(true);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [tableColumns, setTableColumns] = useState<IColumn<TData>[]>(columns);

  const { extraWidth } = useStretchColumns<TData>({ columns, outerTableWidth, scrollbarWidth });

  useEffect(() => {
    if (getScrollElement) getScrollElement(scrollElementRef.current);
  }, [getScrollElement]);

  useEffect(() => {
    if (columnVirtualizer) columnVirtualizer.measure();
  }, [extraWidth]);

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

  const { columnVirtualizer, rowVirtualizer } = useTableVirtualization<TData>({
    columns: tableColumns,
    flattenedData,
    extraWidth,
    rowHeight,
    scrollElementRef,
  });

  /**
   * Fungsi untuk mengubah lebar kolom tabel secara dinamis
   *  - Mengupdate state kolom dengan lebar baru dan menandai kolom agar tidak melar/stretch.
   *  - Memanggil virtualizer untuk mengubah ukuran tampilan kolom.
   */
  const handleResizeColumn = (columnKey: string, columnIndex: number, newWidth: number) => {
    setTableColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex((col) => col.key === columnKey);
      newColumns[columnIndex].width = newWidth;
      newColumns[columnIndex].noStretch = true;
      return newColumns;
    });

    columnVirtualizer.resizeItem(columnIndex, newWidth);
  };

  /**
   * Fungsi ini menangani klik pada baris yang dapat expand di tabel.
   *  - Saat diklik, fungsi akan menambah atau menghapus kunci baris tersebut dari set baris yang sedang di expand.
   *  - Jika baris sudah diexpand, maka akan disembunyikan (dihapus dari set).
   *  - Jika belum diexpand, maka akan ditambahkan ke set untuk ditampilkan.
   *  - Setelah itu, fungsi juga memanggil callback opsional onRowExpand dengan data baris yang diklik.
   */
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

  const handleToggleFilterVisibility = () => setIsFilterVisible((prev) => !prev);

  /**
   * Properties of Table Provider.
   *  - Digunakan di komponen lain seperti header, filter, dll.
   *  - Agar tidak perlu mengirim props satu per satu ke tiap komponen.
   * */
  const tableProviderValue = {
    scrollbarWidth,
    outerTableheight,
    outerTableWidth,
    headerHeight: headerHeight || DEFAULT_SIZE.HEADER_HEIGTH,
    isFilterVisible,
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

  return (
    <TableProvider {...tableProviderValue}>
      <div
        ref={scrollElementRef}
        className={clsx(
          'w-full h-full overflow-auto relative border border-gray-200',
          classNameOuterTable,
        )}
        onScroll={handleScroll}
      >
        <table style={{ width: columnVirtualizer.getTotalSize() }}>
          <thead className='sticky top-0 z-10'>
            <tr>
              {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
                <VirtualTableHeaderItem
                  key={virtualColumn.key}
                  columnIndex={virtualColumn.index}
                  column={columns[virtualColumn.index]}
                  headerHeight={headerHeight}
                  virtualColumn={virtualColumn}
                />
              ))}
            </tr>
          </thead>

          <tbody
            style={{
              position: 'relative',
              height: rowVirtualizer.getTotalSize(),
              top:
                headerHeight ||
                DEFAULT_SIZE.HEADER_HEIGTH + (isFilterVisible ? DEFAULT_SIZE.FILTER_HEIGHT : 0),
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = flattenedData[virtualRow.index];

              return (
                <VirtualTableRow
                  key={virtualRow.key}
                  rowType={row.type as 'row' | 'expanded'}
                  columns={columns}
                  data={row.item}
                  virtualRow={{ size: virtualRow.size, start: virtualRow.start }}
                  virtualColumns={columnVirtualizer.getVirtualItems()}
                  onClickExpandedRow={handleClickExpandedRow}
                  renderExpandedRow={renderExpandedRow}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </TableProvider>
  );
}
