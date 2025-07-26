import clsx from 'clsx';
import { TableProvider } from './context/table-context';
import './lib/style.css';
import { type IVirtualTable } from './lib';
import { useVirtualTableState } from './hooks/use-virtual-table-state';
import VirtualTableHeaderItem from './virtual-table-header-item';
import VirtualTableRow from './virtual-table-row';

export default function VirtualTable<TData>(virtualTableProps: IVirtualTable<TData>) {
  const {
    scrollElementRef,
    columnVirtualizer,
    rowVirtualizer,
    flattenedData,
    tableProviderValue,
    handleScroll,
    headers,
    tableBodyTopPosition,
  } = useVirtualTableState({ ...virtualTableProps });

  return (
    <TableProvider {...tableProviderValue}>
      <div
        ref={scrollElementRef}
        onScroll={handleScroll}
        className={clsx(
          'w-full h-full overflow-auto relative border border-gray-200',
          virtualTableProps.classNameOuterTable,
        )}
      >
        <table style={{ width: columnVirtualizer.getTotalSize() }}>
          <thead className='sticky top-0 z-10'>
            <tr>
              {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
                return (
                  <VirtualTableHeaderItem
                    key={virtualColumn.key}
                    headerIndex={virtualColumn.index}
                    header={headers[virtualColumn.index]}
                    virtualColumn={virtualColumn}
                  />
                );
              })}
            </tr>
          </thead>

          <tbody
            style={{
              position: 'relative',
              height: rowVirtualizer.getTotalSize(),
              top: tableBodyTopPosition,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = flattenedData[virtualRow.index];

              return (
                <VirtualTableRow
                  key={virtualRow.key}
                  rowType={row.type as 'row' | 'expanded'}
                  headers={headers}
                  rowIndex={virtualRow.index}
                  data={row.item}
                  virtualRow={{ size: virtualRow.size, start: virtualRow.start }}
                  virtualColumns={columnVirtualizer.getVirtualItems()}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </TableProvider>
  );
}
