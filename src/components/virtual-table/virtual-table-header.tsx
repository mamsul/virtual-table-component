import { forwardRef, memo, type ReactNode } from 'react';
import clsx from 'clsx';
import { useVirtualizerContext } from './context/virtualizer-context';
import { useSelectionContext } from './context/selection-context';
import { useHeaderContext } from './context/header-context';
import { HeaderCaption, ResizeIndicator, RowCheckbox, TableFilter, TableHead } from './components';
import { DEFAULT_SIZE } from './lib';

interface IVirtualTableHeader extends React.HTMLAttributes<HTMLDivElement> {
  headerHeight: number;
  headerMode: 'single' | 'double';
}

const VirtualTableHeader = forwardRef(
  (props: IVirtualTableHeader, ref: React.Ref<HTMLDivElement>) => {
    const { headerMode, headerHeight, className, ...propRest } = props;

    const { columnVirtualizer, columnVirtualItems } = useVirtualizerContext();
    const { columns, updateColumn, isFilterVisible } = useHeaderContext();
    const { selectAll, deselectedRowKeys, toggleSelectAll } = useSelectionContext();

    const handleResizeColumn = (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = columns[index].width || DEFAULT_SIZE.COLUMN_WIDTH;

      const resizeLine = document.getElementById('resize-line')!;
      resizeLine.style.display = 'block';
      resizeLine.style.left = `${e.clientX}px`;

      const onMouseMove = (ev: MouseEvent) => {
        resizeLine.style.left = `${ev.clientX}px`;
      };

      const onMouseUp = (ev: MouseEvent) => {
        resizeLine.style.display = 'none';

        const delta = ev.clientX - startX;
        const newWidth = Math.max(50, startWidth + delta);

        updateColumn(columns[index].key, { width: newWidth });
        columnVirtualizer?.resizeItem(index, newWidth);

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLTableSectionElement>): void => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isCheckbox = (target as HTMLInputElement).type === 'checkbox';
      if (!isCheckbox) return;

      toggleSelectAll(!selectAll);
    };

    const isSingleHeader = headerMode === 'single';
    const filterHeight = isFilterVisible ? DEFAULT_SIZE.FILTER_HEIGHT : 0;
    const calcHeaderHeight = isSingleHeader ? headerHeight : headerHeight + filterHeight;

    return (
      <div
        className={clsx('sticky top-0 z-10', className)}
        onChange={handleCheckboxChange}
        ref={ref as React.Ref<HTMLDivElement>}
        {...propRest}
      >
        <div>
          {columnVirtualItems?.map((column) => {
            const header = columns[column.index];
            const isCheckboxHeader = header.key === 'row-selection';
            const isExpandHeader = header.key === 'expand';

            return (
              <TableHead
                key={'table-head-' + column.key}
                width={column.size}
                height={calcHeaderHeight}
                leftPosition={column.start}
                className={clsx(
                  'flex w-full h-full group/outer relative',
                  isSingleHeader
                    ? 'flex-row justify-between items-center'
                    : 'flex-col justify-between items-start !px-0',
                )}
              >
                {!isCheckboxHeader && !isExpandHeader && (
                  <>
                    <HeaderCaption
                      isSingleHeader={isSingleHeader}
                      headerKey={header.key}
                      caption={header.caption}
                    />

                    {isFilterVisible && (
                      <TableFilter
                        headerMode={headerMode}
                        headerKey={header.key}
                        filterSelectionOptions={header.filterSelectionOptions || []}
                      />
                    )}

                    <ResizeIndicator handleMouseDown={(e) => handleResizeColumn(e, column.index)} />
                  </>
                )}

                {isCheckboxHeader && <RowCheckbox checked={selectAll && !deselectedRowKeys.size} />}
              </TableHead>
            );
          })}
        </div>
      </div>
    );
  },
);
export default memo(VirtualTableHeader) as (props: IVirtualTableHeader) => ReactNode;
