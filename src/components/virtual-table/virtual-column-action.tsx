import { memo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Icon from './icons';
import clsx from 'clsx';
import { FilterCard } from './components';
import { useClickOutside } from './hooks';
import { calculateElementOverflow, DEFAULT_SIZE, type TSortOrder } from './lib';
import { useTableContext } from './context/table-context';

interface IVirtualColumnAction {
  onClickSort: (sortBy: TSortOrder) => void;
  onToggleFilterVisibility: () => void;
}

const ACTIONS = [
  'Sort Ascending',
  'Sort Descending',
  'Unsort',
  'Hide/Filter Kolom',
  // Filter toggle will be added dynamically
];

const VirtualColumnAction = (props: IVirtualColumnAction) => {
  const { onClickSort, onToggleFilterVisibility } = props;
  const wraperRef = useRef<HTMLDivElement>(null);
  const columnVisibilityRef = useRef<HTMLDivElement>(null);

  const [showActionCard, setShowActionCard] = useState({
    show: false,
    position: { left: 0, top: 0 },
  });
  const [showColumnVisibility, setShowColumnVisibility] = useState({
    show: false,
    position: { left: 0, top: 0 },
  });

  const { isFilterVisible, columnVisibilityList, handleToggleColumnVisibility } = useTableContext();

  useClickOutside([wraperRef, columnVisibilityRef], () => {
    if (showActionCard) setShowActionCard((prev) => ({ ...prev, show: false }));
    setShowColumnVisibility((prev) => ({ ...prev, show: false }));
  });

  // Handler untuk toggle action card
  const handleClickActionToggle = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    const rect = e.currentTarget?.getBoundingClientRect();

    setShowActionCard((prev) => {
      //   if (prev.show && showColumnVisibility.show) {
      //     setShowColumnVisibility((prev) => ({ ...prev, show: false }));
      //   }

      return {
        show: !prev.show,
        position: { left: rect.left - DEFAULT_SIZE.CARD_FILTER_WIDTH + 20, top: rect.top + 20 },
      };
    });
  };

  // Handler untuk klik pada action
  const handleClickAction = useCallback(
    (action: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();

      const mapAction = {
        Unsort: () => onClickSort?.('unset'),
        'Sort Ascending': () => onClickSort?.('asc'),
        'Sort Descending': () => onClickSort?.('desc'),
        'Tutup Filter': () => onToggleFilterVisibility(),
        'Buka Filter': () => onToggleFilterVisibility(),
        'Hide/Filter Kolom': () => {
          const rect = e.currentTarget?.getBoundingClientRect();

          const { right } = calculateElementOverflow(
            rect,
            DEFAULT_SIZE.CARD_FILTER_WIDTH * 2,
            DEFAULT_SIZE.CARD_FILTER_HEIGHT,
          );

          const leftPos = right < 0 ? rect.left - DEFAULT_SIZE.CARD_FILTER_WIDTH * 2 : rect.left;

          setShowColumnVisibility((prev) => ({
            ...prev,
            show: !prev.show,
            position: rect ? { left: leftPos, top: rect.top } : prev.position,
          }));
        },
      };

      mapAction[action as keyof typeof mapAction]?.();
    },
    [onClickSort, onToggleFilterVisibility],
  );

  // Handler untuk klik pada item column visibility
  const handleClickColumnVisibility = useCallback(
    (key: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      handleToggleColumnVisibility(key);
    },
    [handleToggleColumnVisibility],
  );

  // Action list yang sudah include filter toggle
  const columnActionList = [...ACTIONS, isFilterVisible ? 'Tutup Filter' : 'Buka Filter'];

  return (
    <div className='relative'>
      <Icon
        name='menu'
        className={clsx(
          'text-gray-500 hover:text-gray-800 w-4 ml-auto cursor-pointer',
          showActionCard.show && '!text-gray-900',
        )}
        onClick={handleClickActionToggle}
      />

      {showActionCard.show &&
        createPortal(
          <FilterCard
            ref={wraperRef}
            className='fixed overflow-hidden z-[999]'
            style={{ top: showActionCard.position.top, left: showActionCard.position.left }}
          >
            <ActionList actions={columnActionList} onActionClick={handleClickAction} />
          </FilterCard>,
          document.body,
        )}

      {showColumnVisibility.show &&
        createPortal(
          <FilterCard
            ref={columnVisibilityRef}
            className='fixed bg-white z-[999] max-h-[200px] overflow-y-auto !mt-0'
            style={{
              top: showColumnVisibility.position.top,
              left: showColumnVisibility.position.left + DEFAULT_SIZE.CARD_FILTER_WIDTH,
            }}
          >
            <ColumnVisibilityList
              columns={columnVisibilityList}
              onColumnClick={handleClickColumnVisibility}
            />
          </FilterCard>,
          document.body,
        )}
    </div>
  );
};

// Komponen untuk render daftar action
const ActionList = memo(
  ({
    actions,
    onActionClick,
  }: {
    actions: string[];
    onActionClick: (action: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  }) => (
    <>
      {actions.map((action, index) => (
        <div
          key={action + index}
          className='relative py-2 px-3 flex items-center hover:bg-blue-950 hover:text-white cursor-pointer'
          onClick={(e) => onActionClick(action, e)}
        >
          <p className='font-normal'>{action}</p>
        </div>
      ))}
    </>
  ),
);

// Komponen untuk render daftar kolom yang bisa di-hide/show
const ColumnVisibilityList = memo(
  ({
    columns,
    onColumnClick,
  }: {
    columns: { key: string; caption: string; checked: boolean }[];
    onColumnClick: (key: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  }) => (
    <>
      {columns.map(({ key, caption, checked }) => (
        <div
          key={'column-visibility-' + key}
          className={clsx(
            'relative py-2 px-3 flex items-center hover:bg-blue-950/90 hover:text-white cursor-pointer',
            checked && 'bg-blue-950 text-white',
          )}
          onClick={(e) => onColumnClick(key, e)}
        >
          <div className='shrink-0 mr-2 size-4 flex justify-center items-center'>
            <Icon
              name={checked ? 'check' : 'close'}
              className={clsx(checked ? '!size-2.5' : '!size-4')}
            />
          </div>
          <p className='font-normal'>{caption}</p>
        </div>
      ))}
    </>
  ),
);

export default memo(VirtualColumnAction);
