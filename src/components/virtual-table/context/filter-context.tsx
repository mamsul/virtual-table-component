import { createContext, useContext } from 'use-context-selector';
import type { TFilterAdvanceConfig, TSortOrder } from '../lib';
import { useFilterAdvance, useFilterSearch, useFilterSelection, useFilterSort } from '../hooks';

interface IFilterContext {
  filteredData: unknown[];
  sort: {
    sortKey: string | null;
    sortBy: TSortOrder;
    onChangeSort: (columnKey: string) => void;
    onChangeSpecificSort: (columnKey: string, sortBy: TSortOrder) => void;
  };
  search: {
    updateSearch: (columnkey: string, value: string) => void;
    resetSearch: (columnKey: string) => void;
  };
  selection: {
    updateFilter: (key: keyof unknown, value: string[]) => void;
    resetFilter: (key: keyof unknown) => void;
  };
  advance: {
    updateAdvanceFilter: (key: keyof unknown, config: TFilterAdvanceConfig, value: string) => void;
    resetAdvanceFilter: (key: keyof unknown) => void;
  };
}

interface IFilterContextProvider<T> {
  children: React.ReactNode;
  dataSource: T[];
  useServerFilter?: {
    sort?: boolean;
    search?: boolean;
    selection?: boolean;
    advance?: boolean;
  };
  onChangeFilter?: {
    sort?: (key: keyof T, sortBy: TSortOrder) => void;
    search?: (data: Record<keyof T, string>) => void;
    selection?: (data: Record<keyof T, string[]>) => void;
    advance?: (data: Record<keyof T, { config_name: TFilterAdvanceConfig; value: string }>) => void;
  };
}

const FilterContext = createContext<IFilterContext | null>(null);

export const useFilterContext = () => useContext(FilterContext)!;

export const FilterContextProvider = <T,>({
  children,
  dataSource,
  useServerFilter,
  onChangeFilter,
}: IFilterContextProvider<T>) => {
  const { sortKey, sortBy, handleSort, sortedData, handleSpecificSort } = useFilterSort({
    data: dataSource,
    isResetFilter: false,
    useServerSort: useServerFilter?.sort,
    onChangeSort: onChangeFilter?.sort as (key: string, sortBy: TSortOrder) => void,
  });

  const { searchedData, updateSearch, resetSearch } = useFilterSearch({
    data: sortedData,
    isResetFilter: false,
    useServerSearch: useServerFilter?.search,
    onChangeSearch: onChangeFilter?.search,
  });

  const { filteredData, updateFilter, resetFilter } = useFilterSelection({
    data: searchedData,
    isResetFilter: false,
    useServerFilter: useServerFilter?.selection,
    onChangeFilter: onChangeFilter?.selection,
  });

  const { filteredAdvanceData, updateAdvanceFilter, resetAdvanceFilter } = useFilterAdvance({
    data: filteredData,
    isResetFilter: false,
    useServerAdvanceFilter: useServerFilter?.advance,
    onChangeAdvanceFilter: onChangeFilter?.advance,
  });

  return (
    <FilterContext.Provider
      value={{
        filteredData: filteredAdvanceData,
        sort: {
          sortBy,
          sortKey,
          onChangeSort: handleSort,
          onChangeSpecificSort: handleSpecificSort,
        },
        search: { updateSearch, resetSearch },
        selection: { updateFilter, resetFilter },
        advance: { updateAdvanceFilter, resetAdvanceFilter },
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
