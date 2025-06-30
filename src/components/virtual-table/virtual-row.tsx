import ExpandedRowWrapper from './components/expanded-row-wrapper';
import type { IColumn } from './lib';
import VirtualCell from './virtual-cell';

interface Props<T> {
  type: 'row' | 'expanded';
  item: T;
  columns: IColumn<T>[];
  virtualColumns: { index: number; start: number; size: number }[];
  totalWidth: number;
  onClickExpandedRow?: (item: T) => void;
  renderExpandedRow?: (item: T) => React.ReactNode;
}

export default function VirtualRow<TData>(props: Props<TData>) {
  const { type, item, columns, virtualColumns, totalWidth, onClickExpandedRow, renderExpandedRow } =
    props;

  if (type === 'row') {
    return (
      <div
        style={{
          width: `${totalWidth}px`,
          position: 'relative',
          height: '100%',
        }}
        className='border-b border-gray-300 bg-background transition-colors'
      >
        {virtualColumns.map(({ index, start, size }) => {
          return (
            <VirtualCell
              key={`cell-${index}`}
              left={start}
              width={size}
              column={columns[index]}
              data={item}
              onClickExpand={() => onClickExpandedRow?.(item)}
            />
          );
        })}
      </div>
    );
  }

  return (
    <ExpandedRowWrapper>
      {renderExpandedRow ? (
        renderExpandedRow(item)
      ) : (
        <div className='text-muted-foreground'>Expanded content</div>
      )}
    </ExpandedRowWrapper>
  );
}
