import { forwardRef, memo, useMemo, type ReactNode } from 'react';
import clsx from 'clsx';
import { useVirtualizerContext } from './context/virtualizer-context';
import { useSelectionContext } from './context/selection-context';
import { useHeaderContext } from './context/header-context';
import { RowCheckbox, RowExpand, TableCell } from './components';
import { DEFAULT_SIZE } from './lib';
import { useUIContext } from './context/ui-context';

interface IVirtualTableBody<TData> {
  headerHeight: number;
  headerMode: 'single' | 'double';
  onClickRowToParent?: (item: TData) => void;
  onDoubleClickRowToParent?: (item: TData) => void;
  onRightClickRowToParent?: (item: TData, position: { x: number; y: number }) => void;
}

const VirtualTableBody = forwardRef(
  <TData,>(props: IVirtualTableBody<TData>, ref: React.Ref<HTMLDivElement>) => {
    const {
      headerHeight,
      headerMode,
      onClickRowToParent,
      onDoubleClickRowToParent,
      onRightClickRowToParent,
    } = props;

    const { columns, isFilterVisible } = useHeaderContext();
    const {
      flattenedData,
      rowVirtualizer,
      columnVirtualizer,
      rowVirtualItems,
      columnVirtualItems,
    } = useVirtualizerContext();
    const {
      selectAll,
      onClickRow,
      selectedRowKey,
      selectedRowKeys,
      deselectedRowKeys,
      toggleRowSelection,
      toggleExpandRow,
      expandedRowKeys,
    } = useSelectionContext();
    const { expandedContent } = useUIContext();

    // NOTE: Membuat map untuk row key
    const rowMap = useMemo(() => {
      const map = new Map<string | number, TData>();
      flattenedData.forEach((d) => {
        if (d.type === 'row') {
          map.set(String((d as unknown as { key: string }).key), d.item as TData);
        }
      });
      return map;
    }, [flattenedData]);

    // NOTE: Menangani klik pada row
    const handleClickRow = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const cell = (e.target as HTMLElement).closest('div.table-cell');
      const btnExpand = (e.target as HTMLElement).closest('[data-action="expand"]');

      // NOTE: Jika klik pada cell dan bukan pada button expand
      if (cell && !btnExpand) {
        const rowKeyAttr = cell.getAttribute('data-row-key');
        const rowData = rowMap.get(rowKeyAttr || '');

        onClickRow?.(rowKeyAttr);
        onClickRowToParent?.(rowData as TData);
      }

      // NOTE: Jika klik pada button expand
      if (btnExpand) {
        e.preventDefault();
        e.stopPropagation();

        const cell = btnExpand.closest('div.table-cell');
        if (!cell) return;

        const rowKeyAttr = cell?.getAttribute('data-row-key');
        if (rowKeyAttr) toggleExpandRow(rowKeyAttr);
      }
    };

    // NOTE: Menangani klik double pada row
    const handleDoubleClickRow = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const btnExpand = (e.target as HTMLElement).closest('[data-action="expand"]');
      if (btnExpand) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const cell = (e.target as HTMLElement).closest('div');
      if (!cell) return;

      const rowKeyAttr = cell.getAttribute('data-row-key');
      const rowData = rowMap.get(rowKeyAttr || '');
      onDoubleClickRowToParent?.(rowData as TData);
    };

    // NOTE: Menangani klik kanan pada row
    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
      const cell = (e.target as HTMLElement).closest('div');
      if (!cell) return;

      const rowKeyAttr = cell.getAttribute('data-row-key');
      const rowData = rowMap.get(rowKeyAttr || '');
      onClickRow?.(rowKeyAttr);
      onRightClickRowToParent?.(rowData as TData, { x: e.clientX, y: e.clientY });
    };

    // NOTE: Menangani perubahan pada checkbox selection
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLDivElement>): void => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isCheckbox = (target as HTMLInputElement).type === 'checkbox';

      if (isCheckbox) {
        const cell = target.closest('div.table-cell');

        if (!cell) return;

        const rowKeyAttr = cell.getAttribute('data-row-key');
        if (rowKeyAttr) toggleRowSelection(rowKeyAttr);
        return;
      }
    };

    const isSingleHeader = headerMode === 'single';
    const filterHeight = isFilterVisible ? DEFAULT_SIZE.FILTER_HEIGHT : 0;
    const calcTopPosisition = isSingleHeader ? headerHeight : headerHeight + filterHeight;

    return (
      <div
        ref={ref}
        onClick={handleClickRow}
        onDoubleClick={handleDoubleClickRow}
        onContextMenu={handleContextMenu}
        onChange={handleCheckboxChange}
        style={{
          position: 'relative',
          top: calcTopPosisition,
          height: rowVirtualizer?.getTotalSize(),
        }}
      >
        <div
          className='absolute top-0 left-0 w-full'
          style={{ transform: `translateY(${rowVirtualItems?.[0]?.start || 0}px)` }}
        >
          {rowVirtualItems.map((row) => {
            const rowItem = flattenedData[row.index];
            const rowData = rowItem.item as TData;
            const resolvedRowKey = String((rowItem as unknown as { key: string }).key);

            const isRowExpanded = expandedRowKeys.has(resolvedRowKey);
            const isRowChecked = selectAll
              ? !deselectedRowKeys.has(resolvedRowKey)
              : selectedRowKeys.has(resolvedRowKey);

            return (
              <div
                data-name='row'
                key={row.key}
                data-index={row.index}
                ref={rowVirtualizer?.measureElement}
              >
                <div data-name='wrapper-row' style={{ minHeight: DEFAULT_SIZE.ROW_HEIGHT }}>
                  <div
                    data-name='wrapper-columns'
                    className='relative'
                    style={{
                      width: columnVirtualizer?.getTotalSize(),
                      minHeight: DEFAULT_SIZE.ROW_HEIGHT,
                    }}
                  >
                    {columnVirtualItems.map((column) => {
                      const columnKey = columns[column.index].key as string;

                      const isRowHighlighted = resolvedRowKey === String(selectedRowKey);
                      const isVisible = columns[column.index].visible;
                      const isCheckboxColumn = columns[column.index].key === 'row-selection';
                      const isExpandColumn = columns[column.index].key === 'expand';

                      const cellValue = String(rowData[columnKey as keyof typeof rowData]);

                      return (
                        <TableCell
                          data-name='cell'
                          key={column.key}
                          columnWidth={column.size}
                          leftPosition={column.start}
                          data-row-key={resolvedRowKey}
                          data-col-key={column.key}
                          style={{ minHeight: DEFAULT_SIZE.ROW_HEIGHT }}
                          className={clsx('table-cell', {
                            'bg-[#F6F6FF]': isRowHighlighted,
                            '!border-b !border-l !border-t !border-y-[#2F3574] nth-[1]:border-l-[#2F3574] nth-last-[1]:border-r-[#2F3574]':
                              isRowHighlighted,
                            '!hidden': !isVisible,
                          })}
                        >
                          {!isCheckboxColumn && !isExpandColumn && cellValue}
                          {isCheckboxColumn && <RowCheckbox checked={isRowChecked} />}
                          {isExpandColumn && <RowExpand isExpanded={isRowExpanded} />}
                        </TableCell>
                      );
                    })}
                  </div>
                </div>

                {isRowExpanded && (
                  <div
                    data-name='row-expanded'
                    style={{ width: columnVirtualizer?.getTotalSize() }}
                    className={clsx('border-b border-gray-200', !expandedContent && 'p-2')}
                  >
                    {expandedContent?.(rowData) || 'No expanded content available.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

export default memo(VirtualTableBody) as <TData>(props: IVirtualTableBody<TData>) => ReactNode;
