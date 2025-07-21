import { useVirtualizer } from '@tanstack/react-virtual';
import { DEFAULT_SIZE, type IColumn } from '../lib';

interface ITableVirtualization<TData> {
  flattenedData: { type: string; item: TData }[];
  columns: IColumn<TData>[];
  rowHeight?: number;
  extraWidth: number;
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
}

export function useTableVirtualization<TData>(props: ITableVirtualization<TData>) {
  const { rowHeight, columns, flattenedData, extraWidth, scrollElementRef } = props;

  // Row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: flattenedData.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) => {
      const item = flattenedData[index];
      return item.type === 'row'
        ? rowHeight || DEFAULT_SIZE.ROW_HEIGHT
        : DEFAULT_SIZE.EXPANDED_ROW_HEIGHT;
    },
    overscan: 10,
  });

  // Column virtualizer
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) =>
      (columns[index].width || DEFAULT_SIZE.COLUMN_WIDTH) +
      (columns[index].noStretch ? 0 : extraWidth),
    overscan: 2,
  });

  return { rowVirtualizer, columnVirtualizer };
}
