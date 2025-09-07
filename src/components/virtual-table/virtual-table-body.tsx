import { forwardRef, memo, useMemo, type ReactNode } from 'react';
import { useVirtualizerContext } from './context/virtualizer-context';
import { useSelectionContext } from './context/selection-context';
import { useHeaderContext } from './context/header-context';
import { BodyCell, RowExpandedContent } from './components';
import { useUIContext } from './context/ui-context';

interface IVirtualTableBody<TData> {
  headerHeight: number;
  footerHeight: number;
  filterHeight: number;
  rowHeight: number;
  headerMode: 'single' | 'double';
  onClickRowToParent?: (item: TData) => void;
  onDoubleClickRowToParent?: (item: TData) => void;
  onRightClickRowToParent?: (item: TData, position: { x: number; y: number }) => void;
}

const VirtualTableBody = forwardRef(
  <TData,>(props: IVirtualTableBody<TData>, ref: React.Ref<HTMLDivElement>) => {
    const { footerHeight, rowHeight, onClickRowToParent, onDoubleClickRowToParent, onRightClickRowToParent } =
      props;

    const {
      freezeLeftColumns,
      freezeRightColumns,
      freezeRightColumnsWidth,
      freezeLeftColumnsWidth,
      columns,
      getLeaves,
    } = useHeaderContext();
    const { flattenedData, rowVirtualizer, rowVirtualItems, columnVirtualItems, containerWidth } =
      useVirtualizerContext();
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
    const {
      useFooter,
      expandedContent,
      calcTotalTableWidth,
      freezeColLeftPositions,
      freezeColRightPositions,
    } = useUIContext();

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
      if (cell && !btnExpand && onClickRowToParent) {
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

      if (btnExpand || !onDoubleClickRowToParent) {
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

      if (!onRightClickRowToParent) return;

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

    const { calcHeaderTotalHeight } = useUIContext();
    const calcBodyHeight = (rowVirtualizer?.getTotalSize() ?? 0) + (useFooter ? footerHeight : 0);

    const renderFreezeLeftColumns = (
      rowKey: string,
      rowData: TData,
      isRowChecked: boolean,
      isRowExpanded: boolean,
      rowIndex: number,
    ) => {
      return freezeLeftColumns.flatMap((column, freezeLeftIdx) => {
        const isRowHighlighted = rowKey === String(selectedRowKey);
        const isGroupColumn = column.key.startsWith('group-header-');

        if (isGroupColumn) {
          let childOffset = 0;

          return getLeaves(column).map((child, childIdx) => {
            const left = freezeColLeftPositions[freezeLeftIdx] + childOffset;
            childOffset += child.width || 0;

            return (
              <BodyCell
                freezeMode='left'
                key={'table-cell-freeze-left-group-' + String(child.key)}
                rowKey={rowKey}
                rowData={rowData}
                isRowChecked={isRowChecked}
                isRowExpanded={isRowExpanded}
                column={child}
                isVisible={child.visible}
                isRowHighlighted={isRowHighlighted}
                rowIndex={rowIndex}
                columnIndex={childIdx}
                position={{
                  left,
                  width: child.width!,
                  height: rowHeight,
                }}
              />
            );
          });
        }

        return [
          <BodyCell
            freezeMode='left'
            key={'table-cell-freeze-left-' + String(column.key)}
            rowKey={rowKey}
            rowData={rowData}
            isRowChecked={isRowChecked}
            isRowExpanded={isRowExpanded}
            column={column}
            isVisible={column.visible}
            isRowHighlighted={isRowHighlighted}
            rowIndex={rowIndex}
            columnIndex={freezeLeftIdx}
            position={{
              left: freezeColLeftPositions[freezeLeftIdx],
              width: column.width!,
              height: rowHeight,
            }}
          />,
        ];
      });
    };

    const renderFreezeRightColumns = (
      rowKey: string,
      rowData: TData,
      isRowChecked: boolean,
      isRowExpanded: boolean,
      rowIndex: number,
    ) => {
      return freezeRightColumns.flatMap((column, freezeRightIdx) => {
        const isRowHighlighted = rowKey === String(selectedRowKey);
        const isGroupColumn = column.key.startsWith('group-header-');

        if (isGroupColumn) {
          let childOffset = 0;

          return getLeaves(column).map((child, childIdx) => {
            const left = freezeColRightPositions[freezeRightIdx] + childOffset;
            childOffset += child.width || 0;

            return (
              <BodyCell
                freezeMode='right'
                key={'table-cell-freeze-right-group-' + String(child.key)}
                rowKey={rowKey}
                rowData={rowData}
                isRowChecked={isRowChecked}
                isRowExpanded={isRowExpanded}
                column={child}
                isVisible={child.visible}
                isRowHighlighted={isRowHighlighted}
                rowIndex={rowIndex}
                columnIndex={childIdx}
                position={{
                  left,
                  width: child.width!,
                  height: rowHeight,
                }}
              />
            );
          });
        }

        return [
          <BodyCell
            freezeMode='right'
            key={'table-cell-freeze-right-' + String(column.key)}
            rowKey={rowKey}
            rowData={rowData}
            isRowChecked={isRowChecked}
            isRowExpanded={isRowExpanded}
            column={column}
            isVisible={column.visible}
            isRowHighlighted={isRowHighlighted}
            rowIndex={rowIndex}
            columnIndex={freezeRightIdx}
            position={{
              left: freezeColRightPositions[freezeRightIdx],
              width: column.width!,
              height: rowHeight,
            }}
          />,
        ];
      });
    };

    const renderVirtualizedColumns = (
      rowKey: string,
      rowData: TData,
      isRowChecked: boolean,
      isRowExpanded: boolean,
      rowIndex: number,
    ) => {
      return columnVirtualItems.flatMap((column, columnIndex) => {
        const header = columns?.[column.index];
        const isRowHighlighted = rowKey === String(selectedRowKey);
        const isFirstIndex = columnIndex === 0;
        const isLastIndex = columnIndex === columnVirtualItems.length - 1;
        const isGroupHeader = header?.key.startsWith('group-header-');

        if (isGroupHeader) {
          const baseLeft = column.start + freezeLeftColumnsWidth;
          let childOffset = 0;

          return getLeaves(header).map((child, childIdx) => {
            const childWidth = (child.width || 0) * (header.width ? column.size / header.width : 1);
            const left = baseLeft + childOffset;
            childOffset += childWidth;

            return (
              <BodyCell
                key={'table-cell-group-child-' + column.key + '-' + String(child.key)}
                rowKey={rowKey}
                rowData={rowData}
                isRowChecked={isRowChecked}
                isRowExpanded={isRowExpanded}
                column={child}
                isVisible={child.visible}
                isRowHighlighted={isRowHighlighted}
                isFirstIndex={isFirstIndex}
                isLastIndex={isLastIndex}
                rowIndex={rowIndex}
                columnIndex={childIdx}
                position={{
                  left,
                  width: childWidth,
                  height: rowHeight,
                }}
                freezeLeftColumnsWidth={freezeLeftColumnsWidth}
                freezeRightColumnsWidth={freezeRightColumnsWidth}
              />
            );
          });
        }

        return [
          <BodyCell
            key={'table-cell-' + column.key}
            rowKey={rowKey}
            rowData={rowData}
            isRowChecked={isRowChecked}
            isRowExpanded={isRowExpanded}
            column={header}
            isVisible={header?.visible}
            isRowHighlighted={isRowHighlighted}
            isFirstIndex={isFirstIndex}
            isLastIndex={isLastIndex}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            position={{
              left: column.start + freezeLeftColumnsWidth,
              width: column.size,
              height: rowHeight,
            }}
            freezeLeftColumnsWidth={freezeLeftColumnsWidth}
            freezeRightColumnsWidth={freezeRightColumnsWidth}
          />,
        ];
      });
    };

    return (
      <div
        ref={ref}
        onClick={handleClickRow}
        onDoubleClick={handleDoubleClickRow}
        onContextMenu={handleContextMenu}
        onChange={handleCheckboxChange}
        style={{ position: 'relative', top: calcHeaderTotalHeight, height: calcBodyHeight }}
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
                key={row.key}
                data-index={row.index}
                ref={rowVirtualizer?.measureElement}
                className='group/row'
              >
                <div style={{ minHeight: rowHeight, width: calcTotalTableWidth }}>
                  <div className='relative h-full w-full flex'>
                    <div className='sticky left-0 z-20' style={{ width: freezeLeftColumnsWidth }}>
                      {renderFreezeLeftColumns(
                        resolvedRowKey,
                        rowData,
                        isRowChecked,
                        isRowExpanded,
                        row.index,
                      )}
                    </div>

                    <div className='sticky z-20' style={{ left: containerWidth - freezeRightColumnsWidth }}>
                      {renderFreezeRightColumns(
                        resolvedRowKey,
                        rowData,
                        isRowChecked,
                        isRowExpanded,
                        row.index,
                      )}
                    </div>

                    {renderVirtualizedColumns(
                      resolvedRowKey,
                      rowData,
                      isRowChecked,
                      isRowExpanded,
                      row.index,
                    )}
                  </div>
                </div>

                {isRowExpanded && (
                  <RowExpandedContent width={calcTotalTableWidth} emptyPadding={!expandedContent}>
                    {expandedContent?.(rowData) || 'No expanded content available.'}
                  </RowExpandedContent>
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
