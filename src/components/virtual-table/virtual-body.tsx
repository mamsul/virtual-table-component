import { Virtualizer } from '@tanstack/react-virtual';
import VirtualRow from './virtual-row';
import type { IColumn, IFlattenedData } from './lib';

interface Props<TData> {
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
  flattenedData: IFlattenedData<TData>[];
  columns: IColumn<TData>[];
  onClickExpandedRow?: (item: TData) => void;
  renderExpandedRow?: (item: TData) => React.ReactNode;
}

export default function VirtualBody<TData>(props: Props<TData>) {
  const {
    rowVirtualizer,
    columnVirtualizer,
    flattenedData,
    columns,
    renderExpandedRow,
    onClickExpandedRow,
  } = props;

  const totalColumnWidth = columnVirtualizer.getTotalSize();
  const totalRowHeight = rowVirtualizer.getTotalSize();

  return (
    <div
      style={{
        position: 'relative',
        height: `${totalRowHeight}px`,
        width: `${totalColumnWidth}px`,
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const data = flattenedData[virtualRow.index];
        const rowHeight = virtualRow.size;

        return (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${rowHeight}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <VirtualRow
              type={data.type as 'row' | 'expanded'}
              item={data.item}
              columns={columns}
              virtualColumns={columnVirtualizer.getVirtualItems()}
              totalWidth={totalColumnWidth}
              onClickExpandedRow={onClickExpandedRow}
              renderExpandedRow={renderExpandedRow}
            />
          </div>
        );
      })}
    </div>
  );
}
