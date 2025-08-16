import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual';
import { memo, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import useOnClickOutside from '../hooks/use-click-outside';
import FilterCard from './utility/filter-card';
import FilterAction from './filter-action';
import { DEFAULT_SIZE } from '../lib';
import { createPortal } from 'react-dom';
import Icon from '../icons';
import InputSearch from './utility/input-search';
import Checkbox from './utility/checkbox';

interface IFilterSelection {
  headerKey: string;
  options: string[];
  onApplyFilter: (value: string[]) => void;
  onResetFilter: () => void;
}

interface ISelectionList extends Pick<IFilterSelection, 'options' | 'headerKey'> {
  scrollRef: React.RefObject<HTMLDivElement>;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  isEmptyOptions?: boolean;
  isCheked: (value: string) => boolean;
  onCheckboxChange: (value: string) => void;
}

const filteringOptions = (options: string[], searchQuery: string) => {
  if (!options) return [];

  const cleanOptions = options.filter((opt) => typeof opt === 'string' || typeof opt === 'number');

  if (!searchQuery) return cleanOptions;

  return cleanOptions.filter((option) => {
    const optionStr = String(option).toLowerCase(); // ubah ke string
    return optionStr.includes(searchQuery.toLowerCase());
  });
};

function FilterSelection(props: IFilterSelection) {
  const { options, headerKey, onApplyFilter, onResetFilter } = props;

  const filterRef = useRef<HTMLDivElement>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const [showFilterCard, setShowFilterCard] = useState({
    show: false,
    position: { top: 0, left: 0 },
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const filteredOptions = useMemo(() => {
    return filteringOptions(options || [], searchQuery);
  }, [options, searchQuery]);

  useOnClickOutside([filterRef], () => {
    if (showFilterCard.show) setShowFilterCard({ show: false, position: { top: 0, left: 0 } });
  });

  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => filterScrollRef.current,
    estimateSize: () => 24,
    overscan: 5,
  });

  const handleApplyFilter = () => {
    onApplyFilter(selectedOptions);
    setShowFilterCard({ show: false, position: { top: 0, left: 0 } });
  };

  const handleResetFilter = () => {
    onResetFilter();
    setSelectedOptions([]);
    setShowFilterCard({ show: false, position: { top: 0, left: 0 } });
  };

  const onCheckboxChange = (value: string) => {
    setSelectedOptions((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const handleOpenFilterCard = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e?.currentTarget.getBoundingClientRect();
    setShowFilterCard((prev) => ({
      ...prev,
      show: true,
      position: { top: rect.top + 25, left: rect.left - DEFAULT_SIZE.CARD_FILTER_WIDTH / 2 },
    }));
  };

  const isEmptyOpts = options.length < 1;

  return (
    <div className='relative'>
      <div className='relative'>
        {selectedOptions.length > 0 && (
          <div className='absolute top-0 -right-1 size-2 rounded-full bg-knitto-blue-100 z-10' />
        )}
        <Icon
          name='filterMultiple'
          className={clsx(
            'shrink-0 w-3.5 text-gray-500 hover:text-gray-900 cursor-pointer',
            showFilterCard.show && '!text-gray-900',
          )}
          onClick={handleOpenFilterCard}
        />
      </div>

      {showFilterCard.show &&
        createPortal(
          <FilterCard
            ref={filterRef}
            className='fixed z-[999]'
            style={{ top: showFilterCard.position.top, left: showFilterCard.position.left }}
          >
            {!isEmptyOpts && (
              <div className='px-1.5 pt-1.5'>
                <InputSearch
                  id={`filter-selection-search-${headerKey}`}
                  value={searchQuery}
                  disabled={!filteredOptions.length}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            <SelectionList
              scrollRef={filterScrollRef as React.RefObject<HTMLDivElement>}
              rowVirtualizer={rowVirtualizer}
              options={filteredOptions}
              headerKey={headerKey}
              isEmptyOptions={isEmptyOpts}
              isCheked={(value) => selectedOptions.includes(value || '')}
              onCheckboxChange={onCheckboxChange}
            />

            <FilterAction onApply={handleApplyFilter} onReset={handleResetFilter} />
          </FilterCard>,
          document.body,
        )}
    </div>
  );
}

const SelectionList = (props: ISelectionList) => {
  const {
    options,
    headerKey,
    rowVirtualizer,
    isCheked,
    isEmptyOptions,
    onCheckboxChange,
    scrollRef,
  } = props;

  return (
    <div
      ref={scrollRef}
      className={clsx(
        'relative overflow-auto h-40 my-1.5 mx-1.5 filter-scrollbar',
        isEmptyOptions && '!h-16',
      )}
    >
      {isEmptyOptions ? (
        <div className='size-full flex justify-center items-center'>
          <span className='text-gray-400 text-xs font-normal'>No data available!</span>
        </div>
      ) : (
        rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const optionLabel = options[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <Checkbox
                id={`filter-selection-checkbox-${headerKey}-${virtualRow.index}`}
                label={optionLabel}
                checked={isCheked(optionLabel)}
                onChecked={() => onCheckboxChange(optionLabel)}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default memo(FilterSelection);
