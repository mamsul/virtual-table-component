import type { Virtualizer } from '@tanstack/react-virtual';
import type { IColumn } from './lib';
import { useTableContext } from './context/table-context';
import VirtualTableHeaderItem from './virtual-table-header-item';

interface IVirtualTableHeader<TData> {
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
  columns: IColumn<TData>[];
}

export default function VirtualTableHeader<TData>(props: IVirtualTableHeader<TData>) {
  const { columnVirtualizer, columns } = props;
  const { headerHeight } = useTableContext();

  return (
    <table className='sticky table-fixed bg-white w-full top-0 left-0 z-[20]'>
      <thead>
        <tr>
          {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
            <VirtualTableHeaderItem
              key={virtualColumn.key}
              column={columns[virtualColumn.index]}
              headerHeight={headerHeight}
              virtualColumn={virtualColumn}
            />
          ))}
        </tr>
      </thead>
    </table>
  );
}
