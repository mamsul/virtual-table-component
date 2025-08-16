import { forwardRef, memo } from 'react';
import clsx from 'clsx';

interface ITableCell extends React.TdHTMLAttributes<HTMLDivElement> {
  columnWidth: number;
  leftPosition: number;
  columnHeight?: number;
  cellValue?: React.ReactNode;
}

const TableCell = forwardRef((props: ITableCell, ref: React.Ref<HTMLDivElement>) => {
  const { columnWidth, leftPosition, cellValue, className, children, style, ...rest } = props;

  return (
    <div
      ref={ref}
      className={clsx(
        'border-r border-b border-gray-200 px-1.5 cursor-pointer text-xs content-center',
        className,
      )}
      style={{
        position: 'absolute',
        top: 0,
        transform: `translateX(${leftPosition}px)`,
        width: columnWidth,
        ...style,
      }}
      {...rest}
    >
      {cellValue || children}
    </div>
  );
});

export default memo(TableCell);
