import { memo, useMemo } from 'react';
import clsx from 'clsx';
import { ResizeIndicator } from './components';
import { useResizableColumn } from './hooks';
import { useTableContext } from './context/table-context';
import HeaderCaption from './components/header-caption';
import HeaderFilter from './components/header-filter';
import { DEFAULT_SIZE, type IHeader } from './lib';

type IVirtualTableHeaderItem<TData> = {
  header: IHeader<TData>;
  headerIndex: number;
  virtualColumn: { size: number; start: number };
};

const VirtualTableHeaderItem = <TData,>(props: IVirtualTableHeaderItem<TData>) => {
  const { header, virtualColumn, headerIndex } = props;
  const { outerTableheight, isFilterVisible, headerHeight, handleResizeColumn } = useTableContext();

  const { boxRef, handleMouseDown, resizableWidth, isTempResize } = useResizableColumn({
    columnIndex: headerIndex,
    currentWidth: virtualColumn.size,
    keyName: header.key as string,
    onMouseUp: (newSize) => handleResizeColumn(header.key.toString(), headerIndex, newSize),
  });

  const isSelectAllColumn = useMemo(() => header.key === 'row-selection', [header.key]);

  const preventResizeColumn = header.key !== 'expand' && header.key !== 'row-selection';
  const calculatedHeaderHeight = headerHeight + (isFilterVisible ? DEFAULT_SIZE.FILTER_HEIGHT : 0);

  const isStickyLeft = header.sticky === 'left';

  const stickyLeft = isStickyLeft ? virtualColumn.start : undefined;

  return (
    <th
      ref={boxRef}
      className={clsx(
        'group/outer bg-gray-50',
        isStickyLeft ? 'sticky border-r border-transparent' : 'absolute',
      )}
      style={{
        height: calculatedHeaderHeight,
        width: `${virtualColumn.size}px`,
        left: isStickyLeft ? stickyLeft : 0,
        transform: isStickyLeft ? undefined : `translateX(${virtualColumn.start}px)`,
        zIndex: 10000 - headerIndex,
      }}
    >
      <div
        className={clsx(
          'size-full relative flex flex-col border-r border-gray-200 text-xs',
          isFilterVisible && 'border-b',
        )}
      >
        <HeaderCaption
          isShowFilter={preventResizeColumn}
          headerCaption={header.caption}
          headerKey={header.key as string}
        />

        {isFilterVisible && !isSelectAllColumn && (
          <HeaderFilter isShowFilter={preventResizeColumn} headerKey={header.key as string} />
        )}

        {preventResizeColumn && (
          <ResizeIndicator
            onMouseDown={handleMouseDown}
            isMoving={isTempResize}
            left={isTempResize ? resizableWidth : virtualColumn.size}
            outerTableHeight={outerTableheight}
          />
        )}
      </div>
    </th>
  );
};

export default memo(VirtualTableHeaderItem) as typeof VirtualTableHeaderItem;
