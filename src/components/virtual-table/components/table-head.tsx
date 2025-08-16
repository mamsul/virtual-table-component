import { forwardRef, memo, type ReactNode } from 'react';
import clsx from 'clsx';

interface TableHeadProps extends React.ThHTMLAttributes<HTMLDivElement> {
  width: number;
  height: number;
  leftPosition: number;
  headValue?: ReactNode;
}

const TableHead = forwardRef<HTMLDivElement, TableHeadProps>(
  ({ width, height, leftPosition, headValue, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'font-semibold border-r border-b border-gray-200 px-1.5 bg-gray-50 text-xs content-center',
          className,
        )}
        style={{
          position: 'absolute',
          transform: `translateX(${leftPosition}px)`,
          top: 0,
          height,
          width,
        }}
        {...props}
      >
        {headValue || children}
      </div>
    );
  },
);

export default memo(TableHead);
