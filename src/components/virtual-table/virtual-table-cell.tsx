import clsx from 'clsx';
import ExpandToggleButton from './components/expand-toggle-button';
import { useTableContext } from './context/table-context';
import { type IVirtualTableCell } from './lib';
import { Checkbox } from './components';

export default function VirtualTableCell<TData>(props: IVirtualTableCell<TData>) {
  const { column, data, width, left, colSpan, isExpandRow = false } = props;

  const {
    outerTableWidth,
    scrollbarWidth,
    expandedContentHeight,
    expandedRows,
    selectedRow,
    renderExpandedRow,
    getRowKey,
    handleClickExpandRow,
    handleClickRow,
    handleDoubleClickRow,
    handleRightClickRow,
    checkboxSelectionRow: CSR,
  } = useTableContext();

  const rowKey = getRowKey(data);
  const isRowExpanded = expandedRows.has(rowKey);
  const isRowSelected = CSR?.selectedRows.has(rowKey);

  const selectedKey = selectedRow ? getRowKey(selectedRow) : undefined;
  const isSelected = rowKey === selectedKey;

  const isExpandColumn = column?.key === 'expand';
  const isCheckboxSelectionColumn = column?.key === 'row-selection';
  const cellValue = String(data?.[column?.key as keyof TData] ?? '');

  if (!isExpandRow) {
    return (
      <td
        style={{ width: `${width}px`, transform: `translateX(${left}px)` }}
        onClick={() => !isExpandColumn && handleClickRow?.(data)}
        onDoubleClick={() => !isExpandColumn && handleDoubleClickRow?.(data)}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!isExpandColumn) {
            handleRightClickRow?.(data, { x: e.clientX, y: e.clientY });
          }
        }}
        className={clsx(
          'absolute left-0 h-full px-1.5 flex items-center text-xs',
          handleClickRow || handleDoubleClickRow ? 'cursor-pointer' : 'cursor-default',
          isSelected
            ? 'bg-blue-50 border-y border-y-blue-950 border-r border-r-gray-200 nth-last-[1]:border-r-blue-950 nth-[1]:border-l nth-[1]:border-l-blue-950'
            : 'border-r border-b border-gray-200',
        )}
      >
        {isCheckboxSelectionColumn ? (
          <div className='size-full flex justify-center items-center'>
            <Checkbox
              checked={isRowSelected ?? false}
              onChecked={() => CSR?.handleSelectCheckboxRow(data)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : column?.render ? (
          column.render(data as TData)
        ) : (
          <span className='text-muted-foreground line-clamp-1'>{cellValue}</span>
        )}

        {isExpandColumn && (
          <div className='flex justify-center items-center'>
            <ExpandToggleButton
              onClick={() => handleClickExpandRow(data)}
              isExpanded={isRowExpanded}
            />
          </div>
        )}
      </td>
    );
  }

  return (
    <td colSpan={colSpan} className='border-b border-gray-200'>
      <div style={{ height: expandedContentHeight, width: outerTableWidth - scrollbarWidth }}>
        {renderExpandedRow?.(data as TData)}
      </div>
    </td>
  );
}
