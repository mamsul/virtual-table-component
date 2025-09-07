import { memo, useMemo, useRef, type ReactNode } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import clsx from 'clsx';

import { useScrollBottomDetection } from './hooks';
import { DEFAULT_SIZE, type IAdjustedHeader, type IVirtualTable } from './lib';
import { HeaderContextProvider } from './context/header-context';
import { VirtualizerContextProvider } from './context/virtualizer-context';
import { SelectionContextProvider } from './context/selection-context';
import EmptyDataIndicator from './components/empty-data-indicator';
import { FilterContextProvider } from './context/filter-context';
import LoadingIndicator from './components/loading-indicator';
import VirtualTableHeader from './virtual-table-header';
import VirtualTableFooter from './virtual-table-footer';
import UIContextProvider from './context/ui-context';
import VirtualTableBody from './virtual-table-body';
import ResizeLine from './components/resize-line';
import './lib/style.css';

function VirtualTable<TData>(virtualTableProps: IVirtualTable<TData>) {
  const {
    rowKey,
    data,
    headers,
    headerMode = 'double',
    rowHeight = DEFAULT_SIZE.ROW_HEIGHT,
    headerHeight = DEFAULT_SIZE.HEADER_HEIGTH,
    filterHeight = DEFAULT_SIZE.FILTER_HEIGHT,
    footerHeight = DEFAULT_SIZE.FOOTER_HEIGHT,
    isLoading = false,
    useFooter = false,
    useAutoSizer = false,
    useServerFilter = {
      sort: false,
      search: false,
      selection: false,
      advance: false,
    },
    classNameOuterTable,
    classNameCell,
    onClickRow,
    onDoubleClickRow,
    onRightClickRow,
    onChangeCheckboxRowSelection,
    onRenderExpandedContent,
    onChangeFilter,
    onScrollTouchBottom,
  } = virtualTableProps;

  const scrollElementRef = useRef<HTMLDivElement>(null);

  useScrollBottomDetection(scrollElementRef, {
    threshold: 100, // Trigger when 100px from bottom
    throttleMs: 100, // Throttle to 100ms for performance
    onScrollTouchBottom,
  });

  const modifiedHeaders = useMemo(() => {
    return headers.map((header) => ({
      ...header,
      visible: true,
      width: header.width || DEFAULT_SIZE.COLUMN_WIDTH,
    }));
  }, [headers]);

  const renderTableContent = (width?: number, height?: number) => (
    <HeaderContextProvider initialColumns={modifiedHeaders as IAdjustedHeader[]}>
      <FilterContextProvider
        dataSource={data}
        useServerFilter={useServerFilter}
        onChangeFilter={onChangeFilter}
      >
        <VirtualizerContextProvider rowKey={rowKey} scrollElementRef={scrollElementRef}>
          <SelectionContextProvider onChangeCheckboxRowSelection={onChangeCheckboxRowSelection}>
            <UIContextProvider
              filterHeight={filterHeight}
              useFooter={useFooter}
              expandedContent={(data) => onRenderExpandedContent?.(data as TData)}
              headerMode={headerMode}
              headerHeight={headerHeight}
              classNameCell={classNameCell}
            >
              <div
                ref={scrollElementRef}
                data-table-container
                className={clsx(
                  'w-full h-full overflow-auto relative border border-gray-200',
                  isLoading && 'pointer-events-none',
                  classNameOuterTable,
                )}
                style={useAutoSizer && width && height ? { width, height } : undefined}
              >
                <VirtualTableHeader />

                <VirtualTableBody
                  headerHeight={headerHeight}
                  footerHeight={footerHeight}
                  filterHeight={filterHeight}
                  rowHeight={rowHeight}
                  headerMode={headerMode}
                  onClickRowToParent={onClickRow}
                  onDoubleClickRowToParent={onDoubleClickRow}
                  onRightClickRowToParent={onRightClickRow}
                />

                {useFooter && <VirtualTableFooter footerHeight={footerHeight} />}
                {isLoading && <LoadingIndicator />}
                <EmptyDataIndicator />
              </div>

              <ResizeLine />
            </UIContextProvider>
          </SelectionContextProvider>
        </VirtualizerContextProvider>
      </FilterContextProvider>
    </HeaderContextProvider>
  );

  if (useAutoSizer) {
    return (
      <div className='w-full h-full'>
        <AutoSizer>{({ width, height }) => renderTableContent(width, height)}</AutoSizer>
      </div>
    );
  }

  return renderTableContent();
}

export default memo(VirtualTable) as <TData>(props: IVirtualTable<TData>) => ReactNode;
