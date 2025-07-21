import { memo, useRef, useState } from 'react';
import Icon from './icons';
import clsx from 'clsx';
import { FilterCard } from './components';
import { useClickOutside } from './hooks';
import type { TSortOrder } from './lib';
import { useTableContext } from './context/table-context';

interface IVirtualColumnAction {
  columnKey: string;
  onClickSort: (sortBy: TSortOrder) => void;
  onToggleFilterVisibility: () => void;
}

function VirtualColumnAction(props: IVirtualColumnAction) {
  const { columnKey, onClickSort, onToggleFilterVisibility } = props;

  const wraperRef = useRef<HTMLDivElement>(null);
  const [showActionCard, setShowActionCard] = useState(false);

  const { isFilterVisible } = useTableContext();

  useClickOutside(wraperRef, () => {
    if (showActionCard) setShowActionCard(false);
  });

  const handleClickAction = (action: string) => {
    const mapAction = {
      'Sort Ascending': () => onClickSort?.('asc'),
      'Sort Descending': () => onClickSort?.('desc'),
      Unsort: () => onClickSort?.('unset'),
      'Hide/Filter Kolom': () => console.log(`Hiding/filtering column ${columnKey}`),
      'Tutup Filter': () => onToggleFilterVisibility(),
      'Buka Filter': () => onToggleFilterVisibility(),
    };

    mapAction[action as keyof typeof mapAction]();
  };

  const columnActionList = [
    'Sort Ascending',
    'Sort Descending',
    'Unsort',
    'Hide/Filter Kolom',
    isFilterVisible ? 'Tutup Filter' : 'Buka Filter',
  ];

  return (
    <div ref={wraperRef} className='relative'>
      <Icon
        name='menu'
        className={clsx(
          'text-gray-500 hover:text-gray-800 w-4 ml-auto cursor-pointer',
          showActionCard && '!text-gray-900',
        )}
        onClick={(e) => {
          e.stopPropagation();
          setShowActionCard((prev) => !prev);
        }}
      />

      {showActionCard && (
        <FilterCard className='overflow-hidden'>
          {columnActionList.map((action, index) => (
            <div
              key={action + index}
              className='py-2 px-3 flex items-center hover:bg-blue-950 hover:text-white cursor-pointer transition duration-150'
              onClick={(e) => {
                e.stopPropagation();
                handleClickAction(action);
              }}
            >
              <p className='font-normal'>{action}</p>
            </div>
          ))}
        </FilterCard>
      )}
    </div>
  );
}

export default memo(VirtualColumnAction);
