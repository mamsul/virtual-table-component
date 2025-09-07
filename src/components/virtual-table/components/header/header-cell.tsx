import { useCallback, type CSSProperties } from 'react';
import clsx from 'clsx';
import { DEFAULT_SIZE, type IAdjustedHeader } from '../../lib';
import { useVirtualizerContext } from '../../context/virtualizer-context';
import { useSelectionContext } from '../../context/selection-context';
import { useHeaderContext } from '../../context/header-context';
import { useUIContext } from '../../context/ui-context';
import ResizeIndicator from '../resize-indicator';
import RowCheckbox from '../body/row-checkbox';
import HeaderFilter from './header-filter';
import TableHead from '../table-head';
import HeaderCellNested from './header-cell-nested';
import HeaderCaption from './header-caption';

interface IHeaderCell {
  headData: IAdjustedHeader;
  headVirtualIndex: number;
  cellClassName?: string;
  cellStyles?: CSSProperties;
  freezeType?: 'left' | 'right';
}

function HeaderCell(props: IHeaderCell) {
  const { headData, headVirtualIndex, cellStyles, cellClassName, freezeType } = props;
  const {
    isFilterVisible,
    freezeLeftColumns,
    freezeRightColumns,
    columns,
    updateColumn,
    updateFreezeColumn,
  } = useHeaderContext();
  const { selectAll, deselectedRowKeys } = useSelectionContext();
  const { columnVirtualizer } = useVirtualizerContext();
  const { headerMode } = useUIContext();

  const isCheckboxHeader = headData?.key === 'row-selection';
  const isExpandHeader = headData?.key === 'expand';
  const isActionHeader = headData?.key === 'action';
  const isSingleHeader = headerMode === 'single';
  const isGroupHeader = headData?.key.startsWith('group-header-');
  const isShowNormalCell = !isCheckboxHeader && !isExpandHeader && !isActionHeader && !isGroupHeader;
  const renderHeader = headData?.renderHeader;

  const handleResizeColumn = useCallback(
    (e: React.MouseEvent, index: number, freezeType?: 'left' | 'right') => {
      e.preventDefault();
      const startX = e.clientX;
      let startWidth: number;

      if (freezeType === 'left') {
        startWidth = freezeLeftColumns[index].width!;
      } else if (freezeType === 'right') {
        startWidth = freezeRightColumns[index].width!;
      } else {
        startWidth = columns[index].width!;
      }

      const resizeLine = document.getElementById('resize-line')!;
      const tableContainer = document.querySelector('[data-table-container]') as HTMLElement;

      if (tableContainer) {
        const containerRect = tableContainer.getBoundingClientRect();

        resizeLine.style.display = 'block';
        resizeLine.style.left = `${e.clientX}px`;
        resizeLine.style.top = `${containerRect.top}px`;
        resizeLine.style.height = `${containerRect.height}px`;
      } else {
        resizeLine.style.display = 'block';
        resizeLine.style.left = `${e.clientX}px`;
      }

      const onMouseMove = (ev: MouseEvent) => {
        requestAnimationFrame(() => {
          resizeLine.style.left = `${ev.clientX}px`;
        });
      };

      const onMouseUp = (ev: MouseEvent) => {
        resizeLine.style.display = 'none';
        const delta = ev.clientX - startX;
        const newWidth = Math.max(50, startWidth + delta);

        requestAnimationFrame(() => {
          if (freezeType === 'left') {
            updateFreezeColumn(freezeLeftColumns[index].key, 'left', { width: newWidth });
          } else if (freezeType === 'right') {
            updateFreezeColumn(freezeRightColumns[index].key, 'right', { width: newWidth });
          } else {
            updateColumn(columns[index].key, { width: newWidth });
            columnVirtualizer?.resizeItem(index, newWidth);
          }
        });

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [freezeLeftColumns, freezeRightColumns, columns, updateFreezeColumn, updateColumn, columnVirtualizer],
  );

  return (
    <TableHead
      style={cellStyles}
      className={clsx(
        'flex size-full relative',
        {
          'group/outer': !isGroupHeader,
          '!px-0 flex flex-col': isGroupHeader,
          'flex-row justify-between items-center': isSingleHeader && !isGroupHeader,
          'flex-col justify-between items-start !px-0': !isSingleHeader && !isGroupHeader,
        },
        cellClassName,
      )}
    >
      {isGroupHeader && (
        <>
          <div
            style={{ height: DEFAULT_SIZE.GROUP_HEADER_HEIGHT }}
            className={clsx(
              'w-full border-b border-gray-200 text-center content-center',
              freezeType === 'right' ? 'border-l' : 'border-r',
            )}
          >
            {headData?.caption}
          </div>

          <div className='flex-1 w-full flex min-h-0'>
            {headData?.children?.map((child) => (
              <HeaderCellNested
                key={'header-cell-nested-' + freezeType + '-' + child.key}
                headData={child}
                parentKey={headData.key}
                parentVirtualIndex={headVirtualIndex}
                freezeType={freezeType}
              />
            ))}
          </div>
        </>
      )}

      {renderHeader && renderHeader()}

      {!renderHeader && isShowNormalCell && (
        <>
          <HeaderCaption
            isSingleHeader={isSingleHeader}
            isFilterVisible={isFilterVisible}
            headerKey={headData?.key}
            caption={headData?.caption}
          />

          {isFilterVisible && (
            <HeaderFilter
              headerMode={headerMode}
              headerKey={headData?.key}
              filterSelectionOptions={headData?.filterSelectionOptions || []}
            />
          )}

          <ResizeIndicator handleMouseDown={(e) => handleResizeColumn(e, headVirtualIndex, freezeType)} />
        </>
      )}

      {!renderHeader && isCheckboxHeader && <RowCheckbox checked={selectAll && !deselectedRowKeys.size} />}
    </TableHead>
  );
}

export default HeaderCell;
