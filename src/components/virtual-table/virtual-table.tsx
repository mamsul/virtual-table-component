import { useMemo, useRef } from 'react';
import clsx from 'clsx';
import { DEFAULT_SIZE, type IVirtualTable } from './lib';
import { HeaderContextProvider, type HeaderContext } from './context/header-context';
import { VirtualizerContextProvider } from './context/virtualizer-context';
import { SelectionContextProvider } from './context/selection-context';
import { FilterContextProvider } from './context/filter-context';
import VirtualTableHeader from './virtual-table-header';
import VirtualTableBody from './virtual-table-body';
import './lib/style.css';
import UIContextProvider from './context/ui-context';

export default function VirtualTable5<TData>(virtualTableProps: IVirtualTable<TData>) {
  const {
    rowKey,
    data,
    headers,
    headerMode = 'double',
    headerHeight = DEFAULT_SIZE.HEADER_HEIGTH,
    classNameOuterTable,
    onClickRow,
    onDoubleClickRow,
    onRightClickRow,
    onChangeCheckboxRowSelection,
    onRenderExpandedContent,
  } = virtualTableProps;

  const scrollElementRef = useRef<HTMLDivElement>(null);

  const modifiedHeaders = useMemo(() => {
    return headers.map((header) => ({
      ...header,
      visible: true,
    }));
  }, [headers]);

  return (
    <HeaderContextProvider initialColumns={modifiedHeaders as HeaderContext[]}>
      <FilterContextProvider dataSource={data}>
        <VirtualizerContextProvider rowKey={rowKey} scrollElementRef={scrollElementRef}>
          <SelectionContextProvider onChangeCheckboxRowSelection={onChangeCheckboxRowSelection}>
            <UIContextProvider expandedContent={(data) => onRenderExpandedContent?.(data as TData)}>
              <div
                ref={scrollElementRef}
                className={clsx(
                  'w-full h-full overflow-auto relative border border-gray-200',
                  classNameOuterTable,
                )}
              >
                <VirtualTableHeader headerHeight={headerHeight} headerMode={headerMode} />

                <VirtualTableBody
                  headerHeight={headerHeight}
                  headerMode={headerMode}
                  onClickRowToParent={onClickRow}
                  onDoubleClickRowToParent={onDoubleClickRow}
                  onRightClickRowToParent={onRightClickRow}
                />
              </div>

              <div
                id='resize-line'
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '1px',
                  height: '100%',
                  background: '#dbeafe',
                  display: 'none',
                  zIndex: 50,
                }}
              />
            </UIContextProvider>
          </SelectionContextProvider>
        </VirtualizerContextProvider>
      </FilterContextProvider>
    </HeaderContextProvider>
  );
}
