import type { Virtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import type { IColumn } from './lib';
import { useTableContext } from './context/table-context';

interface IVirtualHeader<T> {
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
  columns: IColumn<T>[];
}

export default function VirtualHeader<T>(props: IVirtualHeader<T>) {
  const { columnVirtualizer, columns } = props;
  const { headerHeight } = useTableContext();

  return (
    <table className='sticky table-fixed bg-white w-full top-0 left-0 z-[20]'>
      <thead>
        <tr>
          {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
            const column = columns[virtualColumn.index];
            return (
              <th
                key={virtualColumn.index}
                className={clsx(
                  'absolute top-0 left-0 z-[10]',
                  'flex items-center px-1.5 text-xs border-b border-r border-gray-200 bg-gray-50',
                )}
                style={{
                  height: headerHeight,
                  width: `${virtualColumn.size}px`,
                  transform: `translateX(${virtualColumn.start}px)`,
                }}
              >
                {column.header}
              </th>
            );
          })}
        </tr>
      </thead>
    </table>
  );
}
