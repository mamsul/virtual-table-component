import VirtualFilterSearch from '../virtual-filter-search';
import VirtualFilterAdvance from '../virtual-filter-advance';
import VirtualFilterSelection from '../virtual-filter-selection';
import { useTableContext } from '../context/table-context';

type IHeaderFilter = {
  headerKey: string;
  isShowFilter: boolean;
};

const HeaderFilter = ({ isShowFilter, headerKey }: IHeaderFilter) => {
  const { filterSearch, filterSelection, filterAdvance } = useTableContext();

  return (
    <div className='flex items-center flex-1 space-x-1.5 px-1.5'>
      {isShowFilter && (
        <>
          <VirtualFilterSearch
            headerKey={headerKey}
            onSearchClear={() => filterSearch.handleResetSearch?.(headerKey)}
            onSearchChange={(searchValue) =>
              filterSearch.handleApplySearch?.(headerKey, searchValue)
            }
          />
          <VirtualFilterAdvance
            headerKey={headerKey}
            onResetFilter={() => filterAdvance.handleResetFilter(headerKey)}
            onApplyFilter={(config, value) =>
              filterAdvance.handleApplyFilter(headerKey, config, value)
            }
          />
          <VirtualFilterSelection
            headerKey={headerKey}
            options={[]}
            onApplyFilter={(filterValue) =>
              filterSelection?.handleApplyFilter(headerKey, filterValue)
            }
            onResetFilter={() => filterSelection?.handleResetFilter(headerKey)}
          />
        </>
      )}
    </div>
  );
};

export default HeaderFilter;
