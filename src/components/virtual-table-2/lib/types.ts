import type { Virtualizer } from '@tanstack/react-virtual';
import { FILTER_ADVANCE_CONFIG } from './constants';

export interface IVirtualTable<TData> extends ITableUIProperty {
  columns: IColumn<TData>[];
  data: TData[];
  classNameOuterTable?: string;
  getRowKey: (item: TData) => string | number;
  renderExpandedRow?: (item: TData) => React.ReactNode;
  onRowExpand?: (item: TData) => void;
}

interface ITableUIProperty {
  rowHeight?: number;
  headerHeight?: number;
  hideHeader?: boolean;
}

export interface IColumn<TData> {
  key: keyof TData | 'expand';
  header: string;
  width?: number;
  filterOptions?: string[];
  render?: (item: TData) => React.ReactNode;
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

interface IVirtualBodyBase<TData> {
  data?: TData;
  columns: IColumn<TData>[];
  expandedContentWidth?: number;
  renderExpandedRow?: (item: TData) => React.ReactNode;
}

interface IExpandable<TData> {
  onClickExpandedRow?: (item: TData) => void;
}

export interface IVirtualTableBody<TData> extends IVirtualBodyBase<TData>, IExpandable<TData> {
  headerHeight: number;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
  flattenedData: IFlattenedData<TData>[];
}

export interface IVirtualTableRow<TData> extends IVirtualBodyBase<TData>, IExpandable<TData> {
  rowType: 'row' | 'expanded';
  virtualRow: { size: number; start: number };
  virtualColumns: { index: number; start: number; size: number }[];
}

export interface IVirtualTableCell<TData> extends IExpandable<TData> {
  column?: IColumn<TData>;
  data: TData;
  width?: number;
  left?: number;
  isExpanded?: boolean;
  colSpan?: number;
  expandedContentWidth?: number;
  renderExpandedRow?: (item: TData) => React.ReactNode;
  onClickExpand?: () => void;
}

export interface ITableFilter {
  sort: {
    sortKey: string | null;
    sortBy: TSortOrder;
    handleSort: (key: string) => void;
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
