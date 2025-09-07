import { memo, useState } from 'react';
import { useFilterContext } from '../../context/filter-context';
import Icon from '../../icons';
import FilterSelection from './filter-selection';
import FilterAdvance from './filter-advance';
import FilterSearch from './filter-search';
import InputSearch from '../input-search';
import clsx from 'clsx';
import { useUIContext } from '../../context/ui-context';

interface IHeaderFilter {
  headerKey: string;
  filterSelectionOptions: string[];
  headerMode: 'single' | 'double';
}

const HeaderFilter = ({ headerKey, filterSelectionOptions, headerMode }: IHeaderFilter) => {
  const { search, sort, selection, advance } = useFilterContext();
  const { filterHeight } = useUIContext();

  const isSingleHeader = headerMode === 'single';
  const calcFilterHeight = isSingleHeader ? 'auto' : filterHeight;

  return (
    <div
      style={{ height: calcFilterHeight }}
      className={clsx('flex items-center space-x-1.5', isSingleHeader ? 'w-max pr-2.5' : 'w-full px-1.5')}
    >
      {isSingleHeader ? (
        <FilterSearch
          headerKey={headerKey}
          onSearchChange={(val) => search.updateSearch(headerKey, val)}
          onSearchClear={() => search.resetSearch(headerKey)}
        />
      ) : (
        <InputSearchFilter onApplySearch={(val) => search.updateSearch(headerKey, val)} />
      )}

      <FilterSelection
        headerKey={headerKey?.toString() || ''}
        options={filterSelectionOptions}
        onApplyFilter={(value) => selection.updateFilter(headerKey as keyof unknown, value)}
        onResetFilter={() => selection.resetFilter(headerKey as keyof unknown)}
      />

      <FilterAdvance
        headerKey={headerKey?.toString() || ''}
        onResetFilter={() => advance.resetAdvanceFilter(headerKey as keyof unknown)}
        onApplyFilter={(config, value) => advance.updateAdvanceFilter(headerKey as keyof unknown, config, value)}
      />

      {isSingleHeader && (
        <Icon
          name="sort"
          className="cursor-pointer"
          sort={headerKey === sort.sortKey ? sort.sortBy : 'unset'}
          onClick={() => sort.onChangeSort(headerKey.toString())}
        />
      )}
    </div>
  );
};

const InputSearchFilter = memo(({ onApplySearch }: { onApplySearch: (value: string) => void }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <InputSearch
      className="bg-white !h-6"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onClickEnter={() => onApplySearch(searchValue)}
    />
  );
});

export default memo(HeaderFilter);
