import { useRef, useState } from 'react';
import clsx from 'clsx';

import { Dropdown, FilterCard, InputSearch } from './components';
import { FILTER_ADVANCE_CONFIG, getObjKeyByValue, type TFilterAdvanceConfig } from './lib';
import { useClickOutside } from './hooks';
import Icon from './icons';
import FilterAction from './components/filter-action';

// ======================= VARIABLES and TYPE DEFINITIONS =======================
// ==============================================================================
interface VirtualFilterAdvanceProps {
  columnKey: string;
  onApplyFilter: (config: TFilterAdvanceConfig, value: string) => void;
  onResetFilter: () => void;
}

interface IFilterCard {
  show: boolean;
  position: { top: number; left: number };
}

interface IFilterValue {
  config: string;
  value: string;
}

const CONFIG_OPTIONS = Object.values(FILTER_ADVANCE_CONFIG).map((value) => value);

const DEFAULT_FILTER_CARD: IFilterCard = {
  show: false,
  position: { top: 0, left: 0 },
};

const DEFAULT_FILTER_VALUE: IFilterValue = {
  config: CONFIG_OPTIONS[0],
  value: '',
};

// ======================= MAIN COMPONENT =======================
// ==============================================================
export default function VirtualFilterAdvance(props: VirtualFilterAdvanceProps) {
  const { columnKey, onApplyFilter, onResetFilter } = props;

  const filterRef = useRef<HTMLDivElement>(null);
  const [filterCard, setFilterCard] = useState<IFilterCard>(DEFAULT_FILTER_CARD);
  const [filterValue, setFilterValue] = useState<IFilterValue>(DEFAULT_FILTER_VALUE);

  useClickOutside(filterRef, () => filterCard.show && setFilterCard(DEFAULT_FILTER_CARD));

  const handleConfigChange = (config: string) => {
    setFilterValue((prev) => ({ ...prev, config }));
    if (config === 'None') setFilterValue((prev) => ({ ...prev, value: '' }));
  };

  const handleApplyFilter = () => {
    const getConfigKey = getObjKeyByValue(FILTER_ADVANCE_CONFIG, filterValue.config);
    onApplyFilter(getConfigKey as TFilterAdvanceConfig, filterValue.value);
    setFilterCard(DEFAULT_FILTER_CARD);
  };

  const handleResetFilter = () => {
    onResetFilter();
    setFilterValue(DEFAULT_FILTER_VALUE);
    setFilterCard(DEFAULT_FILTER_CARD);
  };

  return (
    <div ref={filterRef} className='relative'>
      <Icon
        name='filterAdvance'
        className={clsx(
          'shrink-0 w-5 text-gray-400 hover:text-gray-600 cursor-pointer',
          filterCard.show && '!text-gray-600',
        )}
        onClick={() => setFilterCard((prev) => ({ ...prev, show: !prev.show }))}
      />

      {filterCard.show && (
        <FilterCard>
          <div className='p-1.5 w-full flex flex-col items-start space-y-1'>
            <span className='text-xs text-gray-800'>Filter dengan</span>
            <Dropdown
              options={CONFIG_OPTIONS}
              value={filterValue.config}
              onSelect={handleConfigChange}
            />

            {filterValue.config !== 'None' && (
              <InputSearch
                id={`filter-advance-value-${columnKey}`}
                disabled={filterValue.config === 'None'}
                value={filterValue.value}
                onChange={(e) => setFilterValue((prev) => ({ ...prev, value: e.target.value }))}
              />
            )}
          </div>

          <FilterAction onApply={handleApplyFilter} onReset={handleResetFilter} />
        </FilterCard>
      )}
    </div>
  );
}
