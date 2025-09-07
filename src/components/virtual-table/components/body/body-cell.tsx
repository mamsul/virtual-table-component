import { memo, useMemo } from 'react';
import clsx from 'clsx';
import { RowCheckbox, RowExpand, TableCell } from '..';
import { useUIContext } from '../../context/ui-context';
import type { IAdjustedHeader } from '../../lib';

interface IBodyCell<TData> {
  rowKey: string;
  rowData: TData;
  isRowChecked: boolean;
  isRowExpanded: boolean;
  column: IAdjustedHeader;
  isVisible?: boolean;
  isRowHighlighted?: boolean;
  isFirstIndex?: boolean;
  isLastIndex?: boolean;
  position: {
    left: number;
    width: number;
    height: number;
  };
  freezeMode?: 'left' | 'right' | 'none';
  freezeLeftColumnsWidth?: number;
  freezeRightColumnsWidth?: number;
  rowIndex?: number;
  columnIndex?: number;
}

function BodyCell<TData>(bodyCellProps: IBodyCell<TData>) {
  const {
    rowKey,
    rowData,
    isRowChecked,
    isRowExpanded,
    column,
    isVisible = true,
    isRowHighlighted = false,
    isFirstIndex = false,
    isLastIndex = false,
    position,
    freezeMode = 'none',
    freezeLeftColumnsWidth = 0,
    freezeRightColumnsWidth = 0,
    rowIndex = 0,
    columnIndex = 0,
  } = bodyCellProps;

  const { classNameCell } = useUIContext();

  const isCheckboxColumn = column?.key === 'row-selection';
  const isExpandColumn = column?.key === 'expand';

  const cellValue = useMemo(() => String(rowData[column?.key as keyof typeof rowData] || ''), [rowData, column?.key]);
  const cellRender = column?.renderCell;

  // Memoize custom className untuk performa optimal
  const customClassName = useMemo(() => {
    if (!classNameCell) return '';
    return classNameCell(rowData, rowIndex, columnIndex);
  }, [classNameCell, rowData, rowIndex, columnIndex]);

  const classNames = useMemo(() => {
    const baseClasses = {
      'group-hover/row:bg-[#EFF0F6] group-hover/row:text-black-100': !isRowHighlighted,
      '!hidden': !isVisible,
    };

    if (freezeMode === 'left') {
      return clsx('table-cell border-r bg-white truncate', customClassName, {
        ...baseClasses,
        '!bg-[#F6F6FF]': isRowHighlighted,
        '!border-b !border-l !border-t !border-y-[#2F3574] nth-[1]:border-l-[#2F3574]': isRowHighlighted,
      });
    }

    if (freezeMode === 'right') {
      return clsx('table-cell border-l bg-white truncate', customClassName, {
        ...baseClasses,
        '!bg-[#F6F6FF]': isRowHighlighted,
        '!border-b !border-t !border-y-[#2F3574] nth-last-[1]:border-r-[#2F3574]': isRowHighlighted,
      });
    }

    return clsx('table-cell border-r nth-last-[1]:!border-r-transparent truncate', customClassName, {
      ...baseClasses,
      '!border-r-transparent': isLastIndex && freezeRightColumnsWidth > 0,
      'bg-[#F6F6FF]': isRowHighlighted,
      'border-l border-l-[#2F3574]': isRowHighlighted && !freezeLeftColumnsWidth && isFirstIndex,
      'nth-last-[1]:!border-r-[#2F3574]': isRowHighlighted && !freezeRightColumnsWidth,
      '!border-b !border-t !border-y-[#2F3574]': isRowHighlighted,
    });
  }, [
    freezeMode,
    isRowHighlighted,
    isVisible,
    freezeLeftColumnsWidth,
    freezeRightColumnsWidth,
    isFirstIndex,
    isLastIndex,
    customClassName,
  ]);

  const cellStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      minHeight: position.height,
      transform: `translateX(${position.left}px)`,
      minWidth: position.width,
      width: position.width,
      top: 0,
    }),
    [position.height, position.left, position.width]
  );

  const cellContent = useMemo(() => {
    if (isCheckboxColumn) return <RowCheckbox checked={isRowChecked} />;
    if (isExpandColumn) return <RowExpand isExpanded={isRowExpanded} />;
    return cellRender?.(rowData) || cellValue || '';
  }, [isCheckboxColumn, isExpandColumn, isRowChecked, isRowExpanded, cellRender, rowData, cellValue]);

  return (
    <TableCell
      key={'table-cell-' + String(column.key)}
      data-row-key={rowKey}
      data-col-key={String(column.key)}
      className={classNames}
      style={cellStyle}
    >
      {cellContent}
    </TableCell>
  );
}

export default memo(BodyCell) as <TData>(props: IBodyCell<TData>) => React.ReactElement;
