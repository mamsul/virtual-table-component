import { forwardRef, memo, type ReactNode } from 'react';
import clsx from 'clsx';

interface TableHeadProps extends React.ThHTMLAttributes<HTMLDivElement> {
  headValue?: ReactNode;
}

const TableHead = forwardRef<HTMLDivElement, TableHeadProps>(({ headValue, className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'font-semibold border-b border-gray-200 px-1.5 bg-gray-50 text-xs content-center h-full global-report-title',
        className
      )}
      {...props}
    >
      {headValue || children}
    </div>
  );
});

export default memo(TableHead);
