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
