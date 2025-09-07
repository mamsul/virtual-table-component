import { memo, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHeaderContext } from '../../context/header-context';
import { useVirtualizerContext } from '../../context/virtualizer-context';
import { useFilterContext } from '../../context/filter-context';
import { useClickOutside } from '../../hooks';
import { DEFAULT_SIZE, type IHeader } from '../../lib';
import Icons from '../../icons';
import FilterCard from './filter-card';

const DEFAULT_ACTIONS = [
  'Sort Ascending',
  'Sort Descending',
  'Unsort',
  'Hide Kolom',
  // Filter toggle will be added dynamically
];

interface IHeaderAction {
  headerKey: string;
}

function HeaderAction({ headerKey }: IHeaderAction) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [actionCard, setActionCard] = useState({ show: false, pos: { x: 0, y: 0 } });

  const { toggleColumnVisibility, toggleFilterVisibility, isFilterVisible, columns } = useHeaderContext();
  const { columnVirtualizer } = useVirtualizerContext();
  const { sort } = useFilterContext();

  useClickOutside([cardRef], () => setActionCard({ show: false, pos: { x: 0, y: 0 } }));

  const handleOpenActionCard = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const normalLeftPosition = rect.x - DEFAULT_SIZE.CARD_FILTER_WIDTH / 2;
    const normalTopPosition = rect.y + 20;

    const totalLeftPos = rect.x + DEFAULT_SIZE.CARD_FILTER_WIDTH / 2;
    const totalTopPos = rect.y + DEFAULT_SIZE.CARD_FILTER_HEIGHT + 37;

    const isRightOverflowed = totalLeftPos > viewportWidth;
    const isLeftOverflowed = normalLeftPosition < 0;
    const isBottomOverflowed = totalTopPos > viewportHeight;

    let calculatedLeftPosition = normalLeftPosition;
    let calculatedTopPosition = normalTopPosition;

    if (isRightOverflowed) {
      // geser ke kiri biar ga overflow right.
      calculatedLeftPosition = viewportWidth - DEFAULT_SIZE.CARD_FILTER_WIDTH - 10;
    } else if (isLeftOverflowed) {
      // geser ke kanan biar ga overflow left.
      calculatedLeftPosition = 10;
    }

    if (isBottomOverflowed) {
      // geser ke atas biar ga overflow bottom.
      calculatedTopPosition = rect.top - 37;
    }

    setActionCard({
      show: true,
      pos: { x: calculatedLeftPosition, y: calculatedTopPosition },
    });
  };

  const handleActionClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, action: string) => {
    e.stopPropagation();

    const mapAction = {
      'Sort Ascending': () => sort.onChangeSpecificSort(headerKey, 'asc'),
      'Sort Descending': () => sort.onChangeSpecificSort(headerKey, 'desc'),
      Unsort: () => sort.onChangeSpecificSort(headerKey, 'unset'),
      'Tutup Filter': () => toggleFilterVisibility(),
      'Buka Filter': () => toggleFilterVisibility(),
      'Hide Kolom': () => {
        toggleColumnVisibility(headerKey);
        const index = columns.findIndex((h: IHeader<unknown>) => h.key === headerKey);

        columnVirtualizer?.resizeItem(
          index,
          columns[index]?.visible ? 0 : columns[index]?.width || DEFAULT_SIZE.COLUMN_WIDTH,
        );
      },
    };

    mapAction[action as keyof typeof mapAction]?.();
  };

  const modifiedActions = useMemo(
    () => [...DEFAULT_ACTIONS, isFilterVisible ? 'Tutup Filter' : 'Buka Filter'],
    [isFilterVisible],
  );

  return (
    <div className='relative'>
      <Icons name='menu' className='!size-4 text-gray-500 cursor-pointer' onClick={handleOpenActionCard} />

      {actionCard.show &&
        createPortal(
          <FilterCard
            ref={cardRef}
            className='fixed z-50'
            style={{ top: actionCard.pos.y, left: actionCard.pos.x }}
          >
            {modifiedActions.map((action, index) => (
              <span
                key={action + index}
                onClick={(e) => handleActionClick(e, action)}
                className='relative py-2 px-3 flex items-center hover:bg-blue-950 hover:text-white cursor-pointer'
              >
                {action}
              </span>
            ))}
          </FilterCard>,
          document.body,
        )}
    </div>
  );
}

export default memo(HeaderAction);
