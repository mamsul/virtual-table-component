import Icon from './icons';
import type { IColumn } from './lib';

interface VirtualCellProps<TData> {
  left: number;
  width: number;
  column: IColumn<TData>;
  data: TData;
  onClickExpand?: () => void;
}

export default function VirtualCell<TData>(props: VirtualCellProps<TData>) {
  const { left, width, column, data, onClickExpand } = props;

  return (
    <div
      className='flex items-center px-1.5 border-r border-gray-300 text-xs'
      style={{
        position: 'absolute',
        top: 0,
        left,
        width,
        height: '100%',
      }}
    >
      {column?.render ? (
        column.render(data)
      ) : (
        <span className='text-muted-foreground line-clamp-1'>
          {String(data?.[column?.key as keyof TData] ?? '')}
        </span>
      )}

      {/* Render expand button if the column is for expansion */}
      {column?.key === 'expand' && (
        <div className='flex justify-center items-center'>
          <button className='hover:bg-gray-100 transition-colors' onClick={onClickExpand}>
            <Icon name='chevron' className='!size-5 -rotate-90' />
          </button>
        </div>
      )}
    </div>
  );
}
