import { memo, useRef, useState } from 'react';
import clsx from 'clsx';

import {
  DEFAULT_SIZE,
  FILTER_ADVANCE_CONFIG,
  getObjKeyByValue,
  type TFilterAdvanceConfig,
} from '../lib';
import useOnClickOutside from '../hooks/use-click-outside';
import FilterAction from './filter-action';
import FilterCard from './utility/filter-card';
import Dropdown from './utility/dropdown';
import { createPortal } from 'react-dom';
import Icon from '../icons';
import InputSearch from './utility/input-search';

interface IFilterAdvance {
  headerKey: string;
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

function FilterAdvance(props: IFilterAdvance) {
  const { headerKey, onApplyFilter, onResetFilter } = props;

  const filterRef = useRef<HTMLDivElement>(null);
  const [filterCard, setFilterCard] = useState<IFilterCard>(DEFAULT_FILTER_CARD);
  const [filterValue, setFilterValue] = useState<IFilterValue>(DEFAULT_FILTER_VALUE);

  useOnClickOutside([filterRef], () => filterCard.show && setFilterCard(DEFAULT_FILTER_CARD));

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

  const handleOpenFilterCard = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e?.currentTarget.getBoundingClientRect();
    setFilterCard((prev) => ({
      ...prev,
      show: true,
      position: { top: rect.top + 25, left: rect.left - DEFAULT_SIZE.CARD_FILTER_WIDTH / 2 },
    }));
  };

  return (
    <div className='relative'>
      <div className='relative'>
        {filterValue.config !== 'None' && filterValue.value.length > 0 && (
          <div className='absolute top-0 -right-1 size-2 rounded-full bg-knitto-blue-100 z-10' />
        )}
        <Icon
          name='filterAdvance'
          className={clsx(
            'shrink-0 w-5 text-gray-400 hover:text-gray-600 cursor-pointer',
            filterCard.show && '!text-gray-600',
          )}
          onClick={handleOpenFilterCard}
        />
      </div>

      {filterCard.show &&
        createPortal(
          <FilterCard
            ref={filterRef}
            className='fixed z-[999]'
            style={{ top: filterCard.position.top, left: filterCard.position.left }}
          >
            <div className='p-1.5 w-full flex flex-col items-start space-y-1'>
              <span className='text-xs text-gray-800'>Filter dengan</span>
              <Dropdown
                options={CONFIG_OPTIONS}
                value={filterValue.config}
                onSelect={handleConfigChange}
              />

              {filterValue.config !== 'None' && (
                <InputSearch
                  id={`filter-advance-value-${headerKey}`}
                  disabled={filterValue.config === 'None'}
                  value={filterValue.value}
                  onChange={(e) => setFilterValue((prev) => ({ ...prev, value: e.target.value }))}
                />
              )}
            </div>

            <FilterAction onApply={handleApplyFilter} onReset={handleResetFilter} />
          </FilterCard>,
          document.body,
        )}
    </div>
  );
}

export default memo(FilterAdvance);
