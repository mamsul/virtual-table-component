import type { Virtualizer } from '@tanstack/react-virtual';
import { useEffect } from 'react';
import { DEFAULT_SIZE, type IHeader } from '../lib';

interface IAutoStretchColumn {
  containerWidth: number;
  columns: IHeader<unknown>[];
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

export function useAutoStretchColumn(props: IAutoStretchColumn) {
  const { containerWidth, columns, columnVirtualizer } = props;

  useEffect(() => {
    if (containerWidth === 0) return;

    // Get all visible columns that can be stretched
    const visibleColumns = columns.filter((column) => column.visible && !column.noStretch);

    // Calculate total width of all columns
    const totalWidth = visibleColumns.reduce((sum, column) => {
      // For nested columns, include all child widths
      if (column.children?.length) {
        return (
          sum + column.children.reduce((childSum, child) => childSum + (child.width || DEFAULT_SIZE.COLUMN_WIDTH), 0)
        );
      }
      return sum + (column.width || DEFAULT_SIZE.COLUMN_WIDTH);
    }, 0);

    // Calculate width of columns that can't be stretched
    const totalNoStretchWidth = columns.reduce((sum, column) => {
      if (column.noStretch) {
        if (column.children?.length) {
          return (
            sum + column.children.reduce((childSum, child) => childSum + (child.width || DEFAULT_SIZE.COLUMN_WIDTH), 0)
          );
        }
        return sum + (column.width! || DEFAULT_SIZE.COLUMN_WIDTH);
      }
      return sum;
    }, 0);

    // Only stretch if total width is less than container width
    if (totalWidth < containerWidth - totalNoStretchWidth) {
      const scale = (containerWidth - totalNoStretchWidth) / totalWidth;

      visibleColumns.forEach((column) => {
        const columnIndex = columns.indexOf(column);
        const newWidth = column.width! * scale;

        // Ensure minimum width
        const finalWidth = Math.max(50, newWidth);
        columnVirtualizer.resizeItem(columnIndex, finalWidth);

        // If column has children, maintain proportional widths
        if (column.children?.length) {
          const childScale = finalWidth / column.width!;
          column.children.forEach((child) => {
            child.width = child.width! * childScale;
          });
        }
      });
    }
  }, [columns, containerWidth, columnVirtualizer]);
}
