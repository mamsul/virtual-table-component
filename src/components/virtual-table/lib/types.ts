import type { Virtualizer } from '@tanstack/react-virtual';
import { FILTER_ADVANCE_CONFIG } from './constants';

export interface ITableContext {
  isFilterVisible: boolean;
  headers: IHeader<unknown>[];
  flattenedData: IFlattenedData<unknown>[];
  headerHeight: number;
  outerTableheight: number;
  outerTableWidth: number;
  scrollbarWidth: number;
  expandedContentHeight: number;
  expandedRows: Set<string | number>;
  selectedRow: unknown;
  columnVisibilityList: IColumnVisibilityListItem[];
  visibleColumns: string[];
  sort: ITableFilter['sort'];
  filterSearch: ITableFilter['search'];
  filterSelection: ITableFilter['filterSelection'];
  filterAdvance: ITableFilter['filterAdvance'];
  checkboxSelectionRow?: {
    selectedRows: Set<string | number>;
    handleSelectCheckboxRow: (item: unknown) => void;
    handleSelectAllCheckboxRow: () => void;
    handleUnselectAllCheckboxRow: () => void;
  };
  getRowKey: (item: unknown) => string | number;
  renderExpandedRow?: (item: unknown) => React.ReactNode;
  handleClickRow?: (data: unknown) => void;
  handleDoubleClickRow?: (data: unknown) => void;
  handleRightClickRow?: (data: unknown, position: { x: number; y: number }) => void;
  handleClickExpandRow: (item: unknown) => void;
  handleToggleFilterVisibility: () => void;
  handleResizeColumn: (key: string, columnIndex: number, newWidth: number) => void;
  handleToggleColumnVisibility: (key: string) => void;
}

export interface IVirtualTable<TData> extends ITableUIProperty {
  headers: IHeader<TData>[];
  data: TData[];
  classNameOuterTable?: string;
  getRowKey: (item: TData) => string | number;
  getScrollElement?: (el: HTMLDivElement | null) => void;
  renderExpandedRow?: (item: TData) => React.ReactNode;
  onRowExpand?: (item: TData) => void;
  onScroll?: (scrollTop: number) => void;
  onClickRow?: (item: TData) => void;
  onDoubleClickRow?: (item: TData) => void;
  onRightClickRow?: (item: TData, position: { x: number; y: number }) => void;
  onSelectCheckboxRow?: (selectedRows: (string | number)[]) => void;
}

interface ITableUIProperty {
  rowHeight?: number;
  headerHeight?: number;
  hideHeader?: boolean;
}

export interface IHeader<TData> {
  key: keyof TData | 'expand' | 'action' | 'row-selection';
  caption: string;
  width?: number;
  noStretch?: boolean;
  filterOptions?: string[];
  sticky?: 'left' | 'right';
  render?: (item: TData) => React.ReactNode;
}

export interface IColumnVisibilityListItem {
  key: string;
  caption: string;
  checked: boolean;
}

export interface IExpandedRowData<T> {
  [key: string | number]: {
    data: T;
    loading: boolean;
    error: string | null;
  };
}

export interface IFlattenedData<T> {
  type: string;
  item: T;
}

export interface IVirtualTableBody<TData> {
  data?: TData;
  headers: IHeader<TData>[];
  headerHeight: number;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
  flattenedData: IFlattenedData<TData>[];
}

export interface IVirtualTableRow<TData> {
  rowIndex: number;
  data?: TData;
  headers: IHeader<TData>[];
  rowType: 'row' | 'expanded';
  virtualRow: { size: number; start: number };
  virtualColumns: { index: number; start: number; size: number }[];
}

export interface IVirtualTableCell<TData> {
  column?: IHeader<TData>;
  data?: TData;
  width?: number;
  left?: number;
  isExpandRow?: boolean;
  colSpan?: number;
}

export interface ITableFilter {
  sort: {
    sortKey: string | null;
    sortBy: TSortOrder;
    handleSort: (key: string) => void;
    handleSpecificSort: (key: string, order: TSortOrder) => void;
  };
  search: {
    activeSearch: Record<string, string>;
    handleApplySearch: (searchKey: string, value: string) => void;
    handleResetSearch: (searchKey: string) => void;
  };
  filterSelection: {
    activeFilters: Record<string, string[]>;
    handleApplyFilter: (filterKey: string, value: string[]) => void;
    handleResetFilter: (filterKey: string) => void;
  };
  filterAdvance: {
    activeFilters: Record<string, { config_name: string; value: string }>;
    handleApplyFilter: (filterKey: string, configName: TFilterAdvanceConfig, value: string) => void;
    handleResetFilter: (filterKey: string) => void;
  };
}

export interface IIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  color?: string;
}

export type TSortOrder = 'asc' | 'desc' | 'unset';

export type TFilterAdvanceConfig = keyof typeof FILTER_ADVANCE_CONFIG;
