import type { Virtualizer } from '@tanstack/react-virtual';
import type { ReactNode } from 'react';
import { FILTER_ADVANCE_CONFIG } from './constants';

export interface IVirtualTable<TData> {
  headers: IHeader<TData>[];
  data: TData[];
  headerMode?: 'single' | 'double';
  rowKey: keyof TData | ((data: TData, index: number) => string);
  classNameOuterTable?: string;
  isLoading?: boolean;
  useFooter?: boolean;
  useAutoSizer?: boolean;
  useServerFilter?: {
    sort?: boolean;
    search?: boolean;
    selection?: boolean;
    advance?: boolean;
  };
  rowHeight?: number;
  headerHeight?: number;
  filterHeight?: number;
  footerHeight?: number;
  hideHeader?: boolean;
  classNameCell?: (data: TData, rowIndex: number, columnIndex: number) => string;
  renderExpandedRow?: (item: TData) => React.ReactNode;
  onRowExpand?: (item: TData) => void;
  onClickRow?: (item: TData) => void;
  onChangeFilter?: {
    sort?: (key: keyof TData, sortBy: TSortOrder) => void;
    search?: (data: Record<keyof TData, string>) => void;
    selection?: (data: Record<keyof TData, string[]>) => void;
    advance?: (
      data: Record<keyof TData, { config_name: TFilterAdvanceConfig; value: string }>,
    ) => void;
  };
  onDoubleClickRow?: (item: TData) => void;
  onRightClickRow?: (item: TData, position: { x: number; y: number }) => void;
  onRenderExpandedContent?: (item: TData) => ReactNode;
  onChangeCheckboxRowSelection?: (
    selectedRows: (string | number)[],
    deselectedRows: (string | number)[],
    isSelectAll: boolean,
  ) => void;
  onScrollTouchBottom: () => void;
}

export interface IHeader<TData> {
  key: keyof TData | 'expand' | 'action' | 'row-selection' | (string & object);
  caption: string;
  width?: number;
  noStretch?: boolean;
  filterSelectionOptions?: string[];
  freeze?: 'left' | 'right';
  visible?: boolean;
  hideHeaderAction?: boolean;
  hideFilter?: {
    sort?: boolean;
    search?: boolean;
    filterSelection?: boolean;
    filterAdvance?: boolean;
  };
  renderHeader?: () => React.ReactNode;
  renderCell?: (item: TData) => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  children?: Omit<IHeader<TData>, 'freeze'>[];
}

export interface IAdjustedHeader extends IHeader<unknown> {
  [key: string]: unknown;
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

export interface IVirtualTableCell<TData> {
  isSticky?: boolean;
  column?: IHeader<TData>;
  data?: TData;
  width: number;
  cellIndex: number;
  cellLeft: number;
  rowStart: number;
  rowSize: number;
  rowIndex: number;
  colSpan: number;
  isExpandRow: boolean;
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
