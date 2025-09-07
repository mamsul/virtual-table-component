import { forwardRef, memo, type ReactNode } from 'react';
import clsx from 'clsx';
import { type IAdjustedHeader } from './lib';
import { useVirtualizerContext } from './context/virtualizer-context';
import { useSelectionContext } from './context/selection-context';
import { useHeaderContext } from './context/header-context';
import { useUIContext } from './context/ui-context';
import { HeaderCell } from './components';

const VirtualTableHeaderV2 = forwardRef(
  (props: React.HTMLAttributes<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) => {
    const { className, ...propRest } = props;

    const {
      columns,
      freezeLeftColumns,
      freezeRightColumns,
      freezeLeftColumnsWidth,
      freezeRightColumnsWidth,
    } = useHeaderContext();
    const { columnVirtualItems, containerWidth } = useVirtualizerContext();
    const { selectAll, toggleSelectAll } = useSelectionContext();
    const { freezeColLeftPositions, freezeColRightPositions, calcTotalTableWidth } = useUIContext();

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLTableSectionElement>): void => {
      const target = e.target as HTMLElement | null;
      const headerCheckbox = (target as HTMLInputElement).closest('[el-name="header-checkbox"]');

      if (!target || !headerCheckbox) return;
      const isCheckbox = (target as HTMLInputElement).type === 'checkbox';

      if (!isCheckbox) return;
      toggleSelectAll(!selectAll);
    };

    const { calcHeaderTotalHeight } = useUIContext();

    const renderFreezeLeftColumns = () => {
      return freezeLeftColumns.map((column, freezeLeftIdx) => {
        const hasChildren = column?.children;

        return (
          <HeaderCell
            key={'table-head-freeze-left-' + column.key}
            freezeType='left'
            headData={column}
            headVirtualIndex={freezeLeftIdx}
            cellStyles={{
              position: 'absolute',
              transform: `translateX(${freezeColLeftPositions[freezeLeftIdx]}px)`,
              height: calcHeaderTotalHeight,
              width: column.width!,
              top: 0,
            }}
            cellClassName={clsx(!hasChildren && 'border-r')}
          />
        );
      });
    };

    const renderFreezeRightColumns = () => {
      return freezeRightColumns.map((column, freezeRightIdx) => {
        const hasChildren = column?.children;

        return (
          <HeaderCell
            key={'table-head-freeze-right-' + column.key}
            headData={column}
            headVirtualIndex={freezeRightIdx}
            freezeType='right'
            cellStyles={{
              position: 'absolute',
              transform: `translateX(${freezeColRightPositions[freezeRightIdx]}px)`,
              height: calcHeaderTotalHeight,
              width: column.width!,
              top: 0,
            }}
            cellClassName={clsx(!hasChildren && 'border-l')}
          />
        );
      });
    };

    const renderVirtualizedColumns = () => {
      return columnVirtualItems?.map((column) => {
        const header = columns[column.index];
        const hasChildren = header?.children;
        const isLastColumn = column.index === columnVirtualItems.length - 1;

        return (
          <HeaderCell
            key={'table-head-' + column.key}
            headData={header as IAdjustedHeader}
            headVirtualIndex={column.index}
            cellStyles={{
              position: 'absolute',
              transform: `translateX(${column.start + freezeLeftColumnsWidth}px)`,
              height: calcHeaderTotalHeight,
              width: column.size,
              top: 0,
            }}
            cellClassName={clsx(!hasChildren && 'border-r', isLastColumn && 'border-r-transparent')}
          />
        );
      });
    };

    return (
      <div
        className={clsx('sticky top-0 z-10', className)}
        onChange={handleCheckboxChange}
        ref={ref as React.Ref<HTMLDivElement>}
        {...propRest}
      >
        <div className='relative flex h-full' style={{ width: calcTotalTableWidth }}>
          <div className='sticky left-0 z-20 h-full' style={{ width: freezeLeftColumnsWidth }}>
            {renderFreezeLeftColumns()}
          </div>

          <div className='sticky z-20 h-full' style={{ left: containerWidth - freezeRightColumnsWidth }}>
            {renderFreezeRightColumns()}
          </div>

          {renderVirtualizedColumns()}
        </div>
      </div>
    );
  },
);

export default memo(VirtualTableHeaderV2) as (props: React.HTMLAttributes<HTMLDivElement>) => ReactNode;
