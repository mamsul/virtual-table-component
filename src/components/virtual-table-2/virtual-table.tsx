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
    handleClickExpandedRow,
    renderExpandedRow,
    columns,
    headerHeight,
    tableBodyTopPosition,
  } = useVirtualTableState({ ...virtualTableProps });

  return (
    <TableProvider {...tableProviderValue}>
      <div
        ref={scrollElementRef}
        className={clsx(
          'w-full h-full overflow-auto relative border border-gray-200',
          virtualTableProps.classNameOuterTable,
        )}
        onScroll={handleScroll}
      >
        <table style={{ width: columnVirtualizer.getTotalSize() }}>
          <thead className='sticky top-0 z-10'>
            <tr>
              {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
                <VirtualTableHeaderItem
                  key={virtualColumn.key}
                  columnIndex={virtualColumn.index}
                  column={columns[virtualColumn.index]}
                  headerHeight={headerHeight}
                  virtualColumn={virtualColumn}
                />
              ))}
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
                  columns={columns}
                  data={row.item}
                  virtualRow={{ size: virtualRow.size, start: virtualRow.start }}
                  virtualColumns={columnVirtualizer.getVirtualItems()}
                  onClickExpandedRow={handleClickExpandedRow}
                  renderExpandedRow={renderExpandedRow}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </TableProvider>
  );
}
