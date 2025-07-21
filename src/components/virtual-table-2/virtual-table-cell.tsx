import { useTableContext } from './context/table-context';
import Icon from './icons';
import { DEFAULT_SIZE, type IVirtualTableCell } from './lib';

export default function VirtualTableCell<TData>(props: IVirtualTableCell<TData>) {
  const {
    column,
    data,
    width,
    left,
    colSpan,
    onClickExpand,
    isExpanded = false,
    renderExpandedRow,
  } = props;

  const { outerTableWidth, scrollbarWidth } = useTableContext();
  const expandedContentWidth = outerTableWidth - scrollbarWidth;

  if (!isExpanded) {
    return (
      <td
        className='absolute left-0 h-full px-1.5 flex items-center border-r border-gray-200 text-xs'
        style={{ width: `${width}px`, transform: `translateX(${left}px)` }}
      >
        {column?.render ? (
          column.render(data)
        ) : (
          <span className='text-muted-foreground line-clamp-1'>
            {String(data?.[column?.key as keyof TData] ?? '')}
          </span>
        )}

        {/* Render expand toggle button if the column is for expansion */}
        {column?.key === 'expand' && (
          <div className='flex justify-center items-center'>
            <button
              className='hover:bg-gray-100 transition-colors'
              onClick={() => onClickExpand?.()}
            >
              <Icon name='chevron' className='!size-5 -rotate-90' />
            </button>
          </div>
        )}
      </td>
    );
  }

  return (
    <td colSpan={colSpan} className='border-b border-gray-200'>
      <div style={{ height: DEFAULT_SIZE.EXPANDED_ROW_HEIGHT, width: expandedContentWidth }}>
        {renderExpandedRow?.(data)}
      </div>
    </td>
  );
}
