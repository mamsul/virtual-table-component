import type { Virtualizer } from '@tanstack/react-virtual';
import { useEffect, useState } from 'react';
import { DEFAULT_SIZE, type IHeader } from '../lib';

interface IAutoStretchColumn {
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
  columns: IHeader<unknown>[];
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

export function useAutoStretchColumn(props: IAutoStretchColumn) {
  const { scrollElementRef, columns, columnVirtualizer } = props;

  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    if (scrollElementRef.current) {
      observer.observe(scrollElementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (containerWidth === 0) return;

    const visibleColumns = columns.filter((column) => column.visible && !column.noStretch);

    const totalWidth = visibleColumns.reduce((sum, column) => {
      return sum + (column.width || DEFAULT_SIZE.COLUMN_WIDTH);
    }, 0);

    const totalNoStretchWidth = columns.reduce((sum, column) => {
      return sum + (column.noStretch ? column.width! : 0);
    }, 0);

    if (totalWidth < containerWidth - totalNoStretchWidth) {
      const scale = (containerWidth - totalNoStretchWidth) / totalWidth;

      visibleColumns.forEach((column) => {
        const columnIndex = columns.indexOf(column);

        columnVirtualizer.resizeItem(columnIndex, column.width! * scale);
      });
    }
  }, [columns, containerWidth, columnVirtualizer]);
}
