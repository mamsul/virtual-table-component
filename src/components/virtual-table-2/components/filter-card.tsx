import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface FilterCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function FilterCard({ children, className, ...propRest }: FilterCardProps) {
  return (
    <div
      className={clsx(
        'absolute top-full right-0 mt-1 w-40 bg-white shadow z-40 rounded-sm border border-gray-50',
        className
      )}
      {...propRest}
    >
      {children}
    </div>
  );
}
