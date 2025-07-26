import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual';
import { memo, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Checkbox, FilterAction, FilterCard, InputSearch } from './components';
import { useClickOutside } from './hooks';
import Icon from './icons';

// ======================= VARIABLES and TYPE DEFINITIONS =======================
// ==============================================================================
interface VirtualFilterSelectionProps {
  headerKey: string;
  options: string[];
  onApplyFilter: (value: string[]) => void;
  onResetFilter: () => void;
}

interface SelectionListProps extends Pick<VirtualFilterSelectionProps, 'options' | 'headerKey'> {
  scrollRef: React.RefObject<HTMLDivElement | null>;
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

// ======================= MAIN COMPONENT =======================
// ==============================================================
function VirtualFilterSelection(props: VirtualFilterSelectionProps) {
  const { options, headerKey, onApplyFilter, onResetFilter } = props;

  const filterRef = useRef<HTMLDivElement>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const [showFilterCard, setShowFilterCard] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const filteredOptions = useMemo(() => {
    return filteringOptions(options || [], searchQuery);
  }, [options, searchQuery]);

  useClickOutside([filterRef], () => {
    if (showFilterCard) setShowFilterCard(false);
  });

  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => filterScrollRef.current,
    estimateSize: () => 24,
    overscan: 5,
  });

  const handleApplyFilter = () => {
    onApplyFilter(selectedOptions);
    setShowFilterCard(false);
  };

  const handleResetFilter = () => {
    onResetFilter();
    setSelectedOptions([]);
    setShowFilterCard(false);
  };

  const onCheckboxChange = (value: string) => {
    setSelectedOptions((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const isEmptyOpts = options.length < 1;

  return (
    <div ref={filterRef} className='relative'>
      <Icon
        name='filterMultiple'
        className={clsx(
          'shrink-0 w-3.5 text-gray-500 hover:text-gray-900 cursor-pointer',
          showFilterCard && '!text-gray-900',
        )}
        onClick={() => setShowFilterCard((prev) => !prev)}
      />

      {showFilterCard && (
        <FilterCard>
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
            scrollRef={filterScrollRef}
            rowVirtualizer={rowVirtualizer}
            options={filteredOptions}
            headerKey={headerKey}
            isEmptyOptions={isEmptyOpts}
            isCheked={selectedOptions.includes}
            onCheckboxChange={onCheckboxChange}
          />

          <FilterAction onApply={handleApplyFilter} onReset={handleResetFilter} />
        </FilterCard>
      )}
    </div>
  );
}

// ======================= SELECTION LIST COMPONENT =======================
// ========================================================================
const SelectionList = (props: SelectionListProps) => {
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

export default memo(VirtualFilterSelection);
