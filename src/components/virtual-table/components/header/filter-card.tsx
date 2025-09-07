import clsx from 'clsx';
import { forwardRef, type HTMLAttributes } from 'react';

interface FilterCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FilterCard = forwardRef<HTMLDivElement, FilterCardProps>(({ children, className, ...propRest }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'absolute top-full right-0 mt-1 bg-white shadow-md z-40 rounded-sm border border-gray-50 w-40 text-xs',
        className
      )}
      {...propRest}
    >
      {children}
    </div>
  );
});

export default FilterCard;
