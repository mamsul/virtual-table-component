import { DEFAULT_SIZE, type IVirtualTableBody } from './lib';
import VirtualTableRow from './virtual-table-row';

export default function VirtualTableBody<TData>(props: IVirtualTableBody<TData>) {
  const {
    headerHeight,
    rowVirtualizer,
    columnVirtualizer,
    flattenedData,
    columns,
    renderExpandedRow,
    expandedContentWidth,
    onClickExpandedRow,
  } = props;

  return (
    <table
      className='absolute w-full table-fixed'
      style={{ top: headerHeight + DEFAULT_SIZE.FILTER_HEIGHT, left: 0 }}
    >
      <tbody>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = flattenedData[virtualRow.index];

          return (
            <VirtualTableRow
              key={virtualRow.key}
              rowType={row.type as 'row' | 'expanded'}
              data={row.item}
              virtualRow={{ size: virtualRow.size, start: virtualRow.start }}
              virtualColumns={columnVirtualizer.getVirtualItems()}
              columns={columns}
              expandedContentWidth={expandedContentWidth}
              onClickExpandedRow={onClickExpandedRow}
              renderExpandedRow={renderExpandedRow}
            />
          );
        })}
      </tbody>
    </table>
  );
}
