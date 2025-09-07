import { useVirtualizer, Virtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { createContext, useContext } from 'use-context-selector';
import { useEffect, useState } from 'react';
import useFlattenedDataIncremental from '../hooks/use-flattened-data-incremental';
import { useAutoStretchColumn } from '../hooks/use-auto-stretch-column';
import { useHeaderContext } from './header-context';
import { useFilterContext } from './filter-context';
import { DEFAULT_SIZE } from '../lib';

type IVirtualizerContext = {
  flattenedData: { type: 'row' | 'expanded'; item: unknown; key: string }[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element> | null;
  columnVirtualizer: Virtualizer<HTMLDivElement, Element> | null;
  rowVirtualItems: VirtualItem[];
  columnVirtualItems: VirtualItem[];
  expandedRows: Set<string>;
  containerWidth: number;
  containerHeight: number;
  toggleExpandRow: (key: string) => void;
};

interface IVirtualizerContextProvider<T> {
  children: React.ReactNode;
  rowKey: keyof T | ((data: T, index: number) => string);
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
}

const VirtualizerContext = createContext<IVirtualizerContext | null>(null);

export const useVirtualizerContext = () => useContext(VirtualizerContext)!;

export const VirtualizerContextProvider = <T,>(props: IVirtualizerContextProvider<T>) => {
  const { children, scrollElementRef, rowKey } = props;
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const { columns } = useHeaderContext();
  const { filteredData } = useFilterContext();

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
      setContainerHeight(entries[0].contentRect.height);
    });

    if (scrollElementRef.current) {
      observer.observe(scrollElementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const { flattenedData, toggleExpand, expandedKeys } = useFlattenedDataIncremental(filteredData as T[], rowKey);

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) => columns[index].width!,
    overscan: 5,
  });

  const rowVirtualizer = useVirtualizer({
    count: flattenedData.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => DEFAULT_SIZE.ROW_HEIGHT,
    overscan: 20,
  });

  useAutoStretchColumn({
    containerWidth,
    columns,
    columnVirtualizer,
  });

  return (
    <VirtualizerContext.Provider
      value={{
        flattenedData,
        rowVirtualizer,
        columnVirtualizer,
        containerWidth,
        containerHeight,
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
