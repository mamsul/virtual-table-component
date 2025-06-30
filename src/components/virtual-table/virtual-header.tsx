import { Virtualizer } from '@tanstack/react-virtual';
import { useTableContext } from './context/table-context';
import { DEFAULT_SIZE, type IColumn } from './lib';
import VirtualHeaderItem from './virtual-header-item';

interface Props<T> {
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
  columns: IColumn<T>[];
}

export default function VirtualHeader<T>(props: Props<T>) {
  const { columnVirtualizer, columns } = props;
  const { headerHeight } = useTableContext();

  return (
    <div
      style={{
        height: `${headerHeight + DEFAULT_SIZE.FILTER_HEIGHT}px`,
        width: `${columnVirtualizer.getTotalSize()}px`,
      }}
      className='border-b border-gray-300 sticky top-0 bg-gray-50 z-10'
    >
      {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
        <VirtualHeaderItem
          key={virtualColumn.index}
          column={columns[virtualColumn.index]}
          width={virtualColumn.size}
          start={virtualColumn.start}
        />
      ))}
    </div>
  );
}
