import { useMemo, type ReactNode } from 'react';
import { createContext, useContext } from 'use-context-selector';
import { useHeaderContext } from './header-context';
import { useVirtualizerContext } from './virtualizer-context';
import { DEFAULT_SIZE } from '../lib';

export interface IUIContext {
  freezeColLeftPositions: number[];
  freezeColRightPositions: number[];
  calcTotalTableWidth: number;
  useFooter: boolean;
  filterHeight: number;
  headerMode: 'single' | 'double';
  expandedContent: (rowData: unknown) => ReactNode;
  calcHeaderTotalHeight: number;
  classNameCell?: (data: unknown, rowIndex: number, columnIndex: number) => string;
}

const UIContext = createContext<IUIContext | null>(null);

export const useUIContext = () => useContext(UIContext)!;

interface IUIContextProviderProps<TData = unknown> {
  children: ReactNode;
  filterHeight: number;
  useFooter: boolean;
  expandedContent?: (rowData: unknown) => ReactNode;
  headerMode: 'single' | 'double';
  headerHeight: number;
  isFilterVisible?: boolean;
  classNameCell?: (data: TData, rowIndex: number, columnIndex: number) => string;
}

export const UIContextProvider = <TData = unknown,>(props: IUIContextProviderProps<TData>) => {
  const {
    children,
    filterHeight,
    expandedContent,
    useFooter = false,
    headerMode,
    headerHeight,
    isFilterVisible = true,
    classNameCell,
  } = props;

  const { columns, freezeLeftColumns, freezeLeftColumnsWidth, freezeRightColumns, freezeRightColumnsWidth, getDepth } =
    useHeaderContext();
  const { columnVirtualizer } = useVirtualizerContext();
  const virtualizedColumnsWidth = columnVirtualizer?.getTotalSize() || 0;

  // Note: Hitung posisi left absolute dari kolom yang freeze di kiri.
  const freezeColLeftPositions = useMemo<number[]>(() => {
    return freezeLeftColumns.reduce<number[]>((acc, _column, idx) => {
      const left = idx === 0 ? 0 : acc[idx - 1] + (freezeLeftColumns[idx - 1].width || 0);
      return [...acc, left];
    }, []);
  }, [freezeLeftColumns]);

  // Note: Hitung posisi right absolute dari kolom yang freeze di kanan.
  const freezeColRightPositions = useMemo<number[]>(() => {
    return freezeRightColumns.reduce<number[]>((acc, _column, idx) => {
      const right = idx === 0 ? 0 : acc[idx - 1] + (freezeRightColumns[idx - 1].width || 0);
      return [...acc, right];
    }, []);
  }, [freezeRightColumns]);

  // Note: Hitung total lebar dari semua jenis kolom.
  const calcTotalTableWidth = useMemo(() => {
    return virtualizedColumnsWidth + freezeLeftColumnsWidth + freezeRightColumnsWidth;
  }, [virtualizedColumnsWidth, freezeLeftColumnsWidth, freezeRightColumnsWidth]);

  type HeaderNode = (typeof columns)[number];

  // Hitung total tinggi header berdasarkan mode, filter, dan depth
  const calcHeaderTotalHeight = useMemo(() => {
    // Hitung kedalaman maksimum dari semua kolom top-level
    const maxDepthTopLevel = Math.max(
      0,
      ...columns.map((c) => getDepth(c as HeaderNode)),
      ...freezeLeftColumns.map((c) => getDepth(c as HeaderNode)),
      ...freezeRightColumns.map((c) => getDepth(c as HeaderNode))
    );

    // Hitung tinggi header berdasarkan mode dan filter
    const calcFilterHeight = isFilterVisible ? filterHeight : 0;
    const baseHeaderHeight = headerMode === 'single' ? headerHeight : headerHeight + calcFilterHeight;

    // Total tinggi termasuk group headers
    return baseHeaderHeight + DEFAULT_SIZE.GROUP_HEADER_HEIGHT * maxDepthTopLevel;
  }, [
    headerMode,
    headerHeight,
    filterHeight,
    isFilterVisible,
    columns,
    freezeLeftColumns,
    freezeRightColumns,
    getDepth,
  ]);

  return (
    <UIContext.Provider
      value={{
        freezeColLeftPositions,
        freezeColRightPositions,
        calcTotalTableWidth,
        useFooter,
        filterHeight,
        headerMode,
        calcHeaderTotalHeight,
        expandedContent: expandedContent || (() => null),
        classNameCell: classNameCell as ((data: unknown, rowIndex: number, columnIndex: number) => string) | undefined,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export default UIContextProvider;
