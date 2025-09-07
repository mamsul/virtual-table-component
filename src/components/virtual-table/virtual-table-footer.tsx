import { memo } from 'react';
import { useVirtualizerContext } from './context/virtualizer-context';
import { useHeaderContext } from './context/header-context';
import { useUIContext } from './context/ui-context';
import { FooterCell } from './components';

interface IVirtualTableFooter {
  footerHeight: number;
}

const VirtualTableFooter = ({ footerHeight }: IVirtualTableFooter) => {
  const { columns, freezeLeftColumnsWidth, freezeRightColumnsWidth, freezeLeftColumns, freezeRightColumns, getLeaves } =
    useHeaderContext();
  const { containerHeight, containerWidth, columnVirtualItems } = useVirtualizerContext();
  const { calcTotalTableWidth, freezeColLeftPositions, freezeColRightPositions } = useUIContext();

  const renderFreezeLeftFooters = () => {
    return freezeLeftColumns.flatMap((column, freezeLeftIdx) => {
      const isGroupHeader = column.key.startsWith('group-header-');

      if (isGroupHeader) {
        let childOffset = 0;

        return getLeaves(column).map((leaf) => {
          const left = freezeColLeftPositions[freezeLeftIdx] + childOffset;
          childOffset += leaf.width || 0;

          return (
            <FooterCell
              key={'table-footer-cell-freeze-left-group-' + String(leaf.key)}
              column={leaf}
              freezeMode="left"
              position={{
                left,
                width: leaf.width!,
                height: footerHeight,
              }}
            />
          );
        });
      }

      return [
        <FooterCell
          key={'table-footer-cell-freeze-left-' + String(column.key)}
          column={column}
          freezeMode="left"
          position={{
            left: freezeColLeftPositions[freezeLeftIdx],
            width: column.width!,
            height: footerHeight,
          }}
        />,
      ];
    });
  };

  const renderFreezeRightFooters = () => {
    return freezeRightColumns.flatMap((column, freezeRightIdx) => {
      const isGroupHeader = column.key.startsWith('group-header-');

      if (isGroupHeader) {
        let childOffset = 0;

        return getLeaves(column).map((leaf) => {
          const left = freezeColRightPositions[freezeRightIdx] + childOffset;
          childOffset += leaf.width || 0;

          return (
            <FooterCell
              key={'table-footer-cell-freeze-right-group-' + String(leaf.key)}
              column={leaf}
              freezeMode="right"
              position={{
                left,
                width: leaf.width!,
                height: footerHeight,
              }}
            />
          );
        });
      }

      return [
        <FooterCell
          key={'table-footer-cell-freeze-right-' + String(column.key)}
          column={column}
          freezeMode="right"
          position={{
            left: freezeColRightPositions[freezeRightIdx],
            width: column.width!,
            height: footerHeight,
          }}
        />,
      ];
    });
  };

  const renderVirtualizedFooters = () => {
    return columnVirtualItems.flatMap((column, columnIndex) => {
      const header = columns?.[column.index];
      const isLastIndex = columnIndex === columnVirtualItems.length - 1;
      const isGroupHeader = header?.key.startsWith('group-header-');

      if (isGroupHeader) {
        const baseLeft = column.start + freezeLeftColumnsWidth;
        let childOffset = 0;

        return getLeaves(header).map((leaf) => {
          const left = baseLeft + childOffset;
          childOffset += leaf.width || 0;

          return (
            <FooterCell
              key={'table-footer-cell-virtualized-group-' + column.key + '-' + String(leaf.key)}
              column={leaf}
              isLastIndex={isLastIndex}
              freezeRightColumnsWidth={freezeRightColumnsWidth}
              position={{
                left,
                width: leaf.width!,
                height: footerHeight,
              }}
            />
          );
        });
      }

      return [
        <FooterCell
          key={'table-footer-cell-virtualized-' + column.key}
          column={header}
          isLastIndex={isLastIndex}
          freezeRightColumnsWidth={freezeRightColumnsWidth}
          position={{
            left: column.start + freezeLeftColumnsWidth,
            width: column.size,
            height: footerHeight,
          }}
        />,
      ];
    });
  };

  return (
    <div className="sticky z-30 bottom-0" style={{ height: footerHeight, top: containerHeight - footerHeight }}>
      <div className="relative flex" style={{ width: calcTotalTableWidth }}>
        <div className="sticky left-0 z-40" style={{ width: freezeLeftColumnsWidth }}>
          {renderFreezeLeftFooters()}
        </div>
        <div className="sticky z-40" style={{ left: containerWidth - freezeRightColumnsWidth }}>
          {renderFreezeRightFooters()}
        </div>

        {renderVirtualizedFooters()}
      </div>
    </div>
  );
};

export default memo(VirtualTableFooter);
