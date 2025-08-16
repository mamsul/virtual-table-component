import { useEffect, useState } from 'react';
import { DEFAULT_SIZE, type IHeader } from '../lib';
import type { Virtualizer } from '@tanstack/react-virtual';

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
    const totalWidth = columns.reduce(
      (sum, h) => sum + (!h?.visible ? 0 : h?.width || DEFAULT_SIZE.COLUMN_WIDTH),
      0,
    );

    if (totalWidth < containerWidth) {
      const scale = containerWidth / totalWidth;
      columns.forEach((h, i) => {
        if (h.visible) {
          columnVirtualizer.resizeItem(i, (h?.width || DEFAULT_SIZE.COLUMN_WIDTH) * scale);
        }
      });
    }
  }, [columns, containerWidth]);
}
