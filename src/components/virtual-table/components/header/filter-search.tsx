import { createPortal } from 'react-dom';
import { memo, useRef, useState } from 'react';
import FilterCard from './filter-card';
import clsx from 'clsx';
import FilterAction from './filter-action';
import { useClickOutside } from '../../hooks';
import { DEFAULT_SIZE } from '../../lib';
import Icons from '../../icons';
import InputSearch from '../input-search';

interface IVirtualFilterSearchProps {
  headerKey: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
}

function FilterSearch(props: IVirtualFilterSearchProps) {
  const { headerKey, onSearchChange, onSearchClear } = props;

  const filterCardRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [showCard, setShowCard] = useState({ show: false, pos: { top: 0, left: 0 } });

  useClickOutside([filterCardRef], () => {
    if (showCard.show) setShowCard({ show: false, pos: { top: 0, left: 0 } });
  });

  const handleEnterSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearchChange(search);
  };

  const handleResetSearch = () => {
    if (search.length) {
      onSearchClear();
      setSearch('');
    }
  };

  const handleApplySearch = () => {
    if (search.length) {
      onSearchChange(search);
      setShowCard({ show: false, pos: { top: 0, left: 0 } });
    }
  };

  const handleOpenCard = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setShowCard({
      show: true,
      pos: { top: rect.top + 30, left: rect.left - DEFAULT_SIZE.CARD_FILTER_WIDTH / 2 },
    });
  };

  return (
    <div className="relative">
      <div className="relative">
        <Icons
          name="search"
          onClick={handleOpenCard}
          className={clsx(
            'shrink-0 w-3.5 text-gray-500 hover:text-gray-900 cursor-pointer',
            showCard.show && '!text-gray-900'
          )}
        />
      </div>

      {showCard.show &&
        createPortal(
          <FilterCard
            ref={filterCardRef}
            className="fixed z-50"
            style={{ top: showCard.pos.top, left: showCard.pos.left }}
          >
            <div className="p-1">
              <InputSearch
                id={'filter-search-' + headerKey}
                className="!w-full bg-white"
                onKeyDown={handleEnterSearch}
                onRemoveSearch={handleResetSearch}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <FilterAction onReset={handleResetSearch} onApply={handleApplySearch} />
          </FilterCard>,
          document.body
        )}
    </div>
  );
}

export default memo(FilterSearch);
