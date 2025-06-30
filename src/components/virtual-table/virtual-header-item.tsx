import { useTableContext } from './context/table-context';
import { ResizeIndicator } from './components';
import { useResizableColumn } from './hooks';
import VirtualFilterSelection from './virtual-filter-selection';
import VirtualFilterAdvance from './virtual-filter-advance';
import VirtualFilterSearch from './virtual-filter-search';
import Icon from './icons';
import type { IColumn, ITableFilter } from './lib';

// ==================== VARIABLES and TYPE DEFINITIONS ===================
// ========================================================================
interface VirtualHeaderItemProps<TData> {
  column: IColumn<TData>;
  width: number;
  start: number;
}

interface HeaderCaptionProps {
  height: number;
  columnCaption: string;
  columnKey: string;
  isShowFilter: boolean;
  filter: {
    sort: ITableFilter['sort'];
  };
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

// ======================= MAIN COMPONENT =======================
// ==============================================================
export default function VirtualHeaderItem<TData>(props: VirtualHeaderItemProps<TData>) {
  const { column, width, start } = props;

  const { sort, filterSearch, filterSelection, filterAdvance, headerHeight, handleResizeColumn } =
    useTableContext();

  const { boxRef, handleMouseDown, isTempResize, resizableWidth } = useResizableColumn({
    currentWidth: width,
    onMouseUp: (newSize) => handleResizeColumn?.(column.key as string, newSize),
  });

  const isShowFilter = column.key !== 'expand';
  const isResizable = column.key !== 'expand';

  return (
    <div
      ref={boxRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: `100%`,
        width: `${width}px`,
        transform: `translateX(${start}px)`,
      }}
      className='relative group/outer text-xs flex items-center border-r border-gray-300'
    >
      <div className='size-full flex flex-col'>
        <HeaderCaption
          height={headerHeight}
          columnCaption={column?.header}
          columnKey={column.key as string}
          isShowFilter={isShowFilter}
          filter={{ sort }}
        />

        <HeaderFilter
          isShowFilter={isShowFilter}
          columnKey={column.key as string}
          filter={{ search: filterSearch, selection: filterSelection, advance: filterAdvance }}
        />
      </div>

      {isResizable && (
        <ResizeIndicator
          onMouseDown={handleMouseDown}
          isMoving={isTempResize}
          left={resizableWidth}
        />
      )}
    </div>
  );
}

// ======================= HEADER CAPTION COMPONENT =======================
// ========================================================================
const HeaderCaption = (props: HeaderCaptionProps) => {
  const { height, columnCaption, columnKey, isShowFilter, filter } = props;
  const { sortKey, sortBy, handleSort } = filter.sort || {};

  return (
    <div
      className='flex items-center px-1.5 border-b border-gray-300 font-semibold'
      style={{ height }}
    >
      {columnCaption}

      {isShowFilter && (
        <>
          <Icon
            name='sort'
            className='cursor-pointer ms-2'
            sort={columnKey === sortKey ? sortBy : 'unset'}
            onClick={() => handleSort?.(columnKey as string)}
          />

          <Icon
            name='menu'
            className='text-gray-500 hover:text-gray-800 w-4 ml-auto cursor-pointer'
          />
        </>
      )}
    </div>
  );
};

// ======================= HEADER FILTER COMPONENT =======================
// =======================================================================
const HeaderFilter = (props: HeaderFilterProps) => {
  const {
    isShowFilter,
    columnKey,
    filter: { search, selection, advance },
  } = props;

  return (
    <div className='flex items-center px-1.5 flex-1 space-x-1.5'>
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
