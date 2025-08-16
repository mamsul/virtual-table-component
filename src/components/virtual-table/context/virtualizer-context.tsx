import { useVirtualizer, Virtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { createContext, useContext } from 'use-context-selector';
import { useAutoStretchColumn } from '../hooks/use-auto-stretch-column';
import { useHeaderContext } from './header-context';
import { useFilterContext } from './filter-context';
import useFlattenedDataIncremental from '../hooks/use-flattened-data-incremental';
import { DEFAULT_SIZE } from '../lib';

type VirtualizerContextValue = {
  flattenedData: { type: 'row' | 'expanded'; item: unknown; key: string }[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element> | null;
  columnVirtualizer: Virtualizer<HTMLDivElement, Element> | null;
  rowVirtualItems: VirtualItem[];
  columnVirtualItems: VirtualItem[];
  expandedRows: Set<string>;
  toggleExpandRow: (key: string) => void;
};

const VirtualizerContext = createContext<VirtualizerContextValue | null>(null);

export const useVirtualizerContext = () => useContext(VirtualizerContext)!;

export const VirtualizerContextProvider = <T,>({
  children,
  scrollElementRef,
  rowKey,
}: {
  children: React.ReactNode;
  rowKey: keyof T | ((data: T, index: number) => string);
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const { columns } = useHeaderContext();
  const { filteredData } = useFilterContext();

  const { flattenedData, toggleExpand, expandedKeys } = useFlattenedDataIncremental(
    filteredData as T[],
    rowKey,
  );

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) => columns[index].width || 160,
    overscan: 2,
  });

  const rowVirtualizer = useVirtualizer({
    count: flattenedData.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => DEFAULT_SIZE.ROW_HEIGHT,
    overscan: 5,
  });

  useAutoStretchColumn({
    scrollElementRef,
    columns,
    columnVirtualizer,
  });

  return (
    <VirtualizerContext.Provider
      value={{
        flattenedData,
        rowVirtualizer,
        columnVirtualizer,
        rowVirtualItems: rowVirtualizer.getVirtualItems(),
        columnVirtualItems: columnVirtualizer.getVirtualItems(),
        toggleExpandRow: toggleExpand,
        expandedRows: expandedKeys,
      }}
    >
      {children}
    </VirtualizerContext.Provider>
  );
};
