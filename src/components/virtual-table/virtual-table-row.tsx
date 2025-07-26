import { memo } from 'react';
import clsx from 'clsx';
import type { IVirtualTableRow } from './lib';
import VirtualTableCell from './virtual-table-cell';

const VirtualTableRow = <TData,>(props: IVirtualTableRow<TData>) => {
  const { rowType, data, virtualRow, virtualColumns, headers, rowIndex } = props;

  if (rowType === 'row') {
    return (
      <tr
        className={clsx(
          'absolute top-0 left-0 w-full hover:bg-blue-50',
          rowIndex % 2 === 1 && 'bg-gray-50',
        )}
        style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
      >
        {virtualColumns.map(({ index, size, start }) => {
          const column = headers[index];

          return (
            <VirtualTableCell
              key={'cell-' + index}
              column={column}
              data={data}
              width={size}
              left={start}
            />
          );
        })}
      </tr>
    );
  }

  return (
    <tr
      className='absolute top-0 left-0 w-full'
      style={{ transform: `translateY(${virtualRow.start}px)` }}
    >
      <VirtualTableCell isExpandRow data={data as TData} />
    </tr>
  );
};

export default memo(VirtualTableRow) as typeof VirtualTableRow;
