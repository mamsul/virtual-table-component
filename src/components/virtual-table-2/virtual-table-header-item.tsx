import clsx from 'clsx';
import { DEFAULT_SIZE, type IColumn, type ITableFilter } from './lib';
import VirtualFilterAdvance from './virtual-filter-advance';
import VirtualFilterSearch from './virtual-filter-search';
import VirtualFilterSelection from './virtual-filter-selection';
import { useTableContext } from './context/table-context';
import Icon from './icons';

interface IVirtualTableHeaderItem<TData> {
  column: IColumn<TData>;
  headerHeight?: number;
  virtualColumn: { size: number; start: number };
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

export default function VirtualTableHeaderItem<TData>(props: IVirtualTableHeaderItem<TData>) {
  const { column, virtualColumn } = props;
  const { sort, filterSearch, filterSelection, filterAdvance, headerHeight } = useTableContext();

  const isShowFilter = column.key !== 'expand';

  return (
    <th
      className={clsx(
        'absolute top-0 left-0 z-[10]',
        'size-full flex flex-col border-b border-r border-gray-200 bg-gray-50',
        'font-semibold text-xs',
      )}
      style={{
        height: headerHeight + DEFAULT_SIZE.FILTER_HEIGHT,
        width: `${virtualColumn.size}px`,
        transform: `translateX(${virtualColumn.start}px)`,
      }}
    >
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
    </th>
  );
}

// ======================= HEADER CAPTION COMPONENT =======================
// ========================================================================
const HeaderCaption = (props: HeaderCaptionProps) => {
  const { height, columnCaption, columnKey, isShowFilter, filter } = props;
  const { sortKey, sortBy, handleSort } = filter.sort || {};

  return (
    <div className='flex items-center px-1.5 border-b border-gray-200' style={{ height }}>
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
