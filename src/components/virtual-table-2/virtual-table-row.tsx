import { memo } from 'react';
import type { IVirtualTableRow } from './lib';
import VirtualTableCell from './virtual-table-cell';

const VirtualTableRow = <TData,>(props: IVirtualTableRow<TData>) => {
  const {
    rowType,
    data,
    virtualRow,
    virtualColumns,
    columns,
    onClickExpandedRow,
    renderExpandedRow,
  } = props;

  if (rowType === 'row') {
    return (
      <tr
        className='absolute border-b border-gray-200 hover:bg-gray-50 top-0 left-0 w-full'
        style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
      >
        {virtualColumns.map(({ index, size, start }) => {
          const column = columns[index];

          return (
            <VirtualTableCell
              key={'cell-' + index}
              column={column}
              data={data as TData}
              width={size}
              left={start}
              onClickExpand={() => onClickExpandedRow?.(data as TData)}
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
      <VirtualTableCell isExpanded data={data as TData} renderExpandedRow={renderExpandedRow} />
    </tr>
  );
};

export default memo(VirtualTableRow) as typeof VirtualTableRow;
