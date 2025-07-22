import { memo } from 'react';
import clsx from 'clsx';
import { DEFAULT_SIZE, type IColumn, type ITableFilter } from './lib';
import VirtualFilterAdvance from './virtual-filter-advance';
import VirtualFilterSearch from './virtual-filter-search';
import VirtualFilterSelection from './virtual-filter-selection';
import { useTableContext } from './context/table-context';
import Icon from './icons';
import { useResizableColumn } from './hooks';
import { ResizeIndicator } from './components';
import VirtualColumnAction from './virtual-column-action';

interface IVirtualTableHeaderItem<TData> {
  column: IColumn<TData>;
  columnIndex: number;
  headerHeight?: number;
  virtualColumn: { size: number; start: number };
}

interface HeaderCaptionProps {
  isShowFilter: boolean;
  isFilterVisible: boolean;
  height: number;
  columnCaption: string;
  columnKey: string;
  filter: { sort: ITableFilter['sort'] };
  onToggleFilterVisibility: () => void;
}

interface HeaderFilterProps {
  columnKey: string;
  isShowFilter: boolean;
  filter: {
    search: ITableFilter['search'];
    selection: ITableFilter['filterSelection'];
    advance: ITableFilter['filterAdvance'];
  };
}

const VirtualTableHeaderItem = <TData,>(props: IVirtualTableHeaderItem<TData>) => {
  const { column, virtualColumn, columnIndex } = props;
  const {
    outerTableheight,
    isFilterVisible,
    headerHeight,
    sort,
    filterSearch,
    filterSelection,
    filterAdvance,
    handleResizeColumn,
    handleToggleFilterVisibility,
  } = useTableContext();

  const { boxRef, handleMouseDown, resizableWidth, isTempResize } = useResizableColumn({
    columnIndex,
    currentWidth: virtualColumn.size,
    keyName: column.key as string,
    onMouseUp: (newSize) => handleResizeColumn(column.key.toString(), columnIndex, newSize),
  });

  const isShowFilter = column.key !== 'expand';
  const calculatedHeaderHeight = headerHeight + (isFilterVisible ? DEFAULT_SIZE.FILTER_HEIGHT : 0);

  return (
    <th
      ref={boxRef}
      className={clsx(
        'absolute top-0 left-0 group/outer',
        'border-r border-gray-200 bg-gray-50',
        'text-xs',
        isFilterVisible && 'border-b',
      )}
      style={{
        height: calculatedHeaderHeight,
        width: `${virtualColumn.size}px`,
        transform: `translateX(${virtualColumn.start}px)`,
        zIndex: 555 - columnIndex,
      }}
    >
      <div className='size-full relative flex flex-col'>
        <HeaderCaption
          isShowFilter={isShowFilter}
          isFilterVisible={isFilterVisible}
          height={headerHeight}
          columnCaption={column?.header}
          columnKey={column.key as string}
          filter={{ sort }}
          onToggleFilterVisibility={handleToggleFilterVisibility}
        />

        {isFilterVisible && (
          <HeaderFilter
            isShowFilter={isShowFilter}
            columnKey={column.key as string}
            filter={{ search: filterSearch, selection: filterSelection, advance: filterAdvance }}
          />
        )}

        <ResizeIndicator
          onMouseDown={handleMouseDown}
          isMoving={isTempResize}
          left={isTempResize ? resizableWidth : virtualColumn.size}
          outerTableHeight={outerTableheight}
        />
      </div>
    </th>
  );
};

export default memo(VirtualTableHeaderItem) as typeof VirtualTableHeaderItem;

// ======================= HEADER CAPTION COMPONENT =======================
// ========================================================================
const HeaderCaption = (captionProps: HeaderCaptionProps) => {
  const { isShowFilter, height, columnCaption, columnKey, filter, onToggleFilterVisibility } =
    captionProps;
  const { sortKey, sortBy, handleSort, handleSpecificSort } = filter.sort || {};

  const onClickSort = () => handleSort?.(columnKey as string);

  return (
    <div
      className='flex items-center px-1.5 border-b border-gray-200 cursor-pointer'
      style={{ height }}
      onClick={onClickSort}
    >
      {columnCaption}

      {isShowFilter && (
        <div className='w-full flex justify-between items-center'>
          <Icon
            name='sort'
            className='cursor-pointer ms-2'
            sort={columnKey === sortKey ? sortBy : 'unset'}
            onClick={onClickSort}
          />

          <VirtualColumnAction
            onClickSort={(sortBy) => handleSpecificSort(columnKey, sortBy)}
            onToggleFilterVisibility={onToggleFilterVisibility}
          />
        </div>
      )}
    </div>
  );
};

// ======================= HEADER FILTER COMPONENT =======================
// =======================================================================
const HeaderFilter = (filterProps: HeaderFilterProps) => {
  const {
    isShowFilter,
    columnKey,
    filter: { search, selection, advance },
  } = filterProps;

  return (
    <div className='flex items-center flex-1 space-x-1.5 px-1.5'>
      {isShowFilter && (
        <>
          <VirtualFilterSearch
            columnKey={columnKey}
            onSearchClear={() => search.handleResetSearch?.(columnKey)}
            onSearchChange={(searchValue) => search.handleApplySearch?.(columnKey, searchValue)}
          />

          <VirtualFilterAdvance
            columnKey={columnKey}
            onResetFilter={() => advance.handleResetFilter(columnKey)}
            onApplyFilter={(config, value) => advance.handleApplyFilter(columnKey, config, value)}
          />

          <VirtualFilterSelection
            columnKey={columnKey}
            options={[]}
            onApplyFilter={(filterValue) => selection?.handleApplyFilter(columnKey, filterValue)}
            onResetFilter={() => selection?.handleResetFilter(columnKey)}
          />
        </>
      )}
    </div>
  );
};
