import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useOnClickOutside from './use-click-outside';
import { calculateFixedCardPosition } from '../lib/utils';
import type { TFilterAdvanceConfig } from '../lib';

type IActiveAdvanceFilters<T> = Record<
  keyof T,
  { config_name: TFilterAdvanceConfig; value: string }
>;

interface IAdvanceFilterTable<TDataSource> {
  data: TDataSource[];
  useServerAdvanceFilter?: boolean;
  isResetFilter?: boolean;
  onChangeAdvanceFilter?: (data: IActiveAdvanceFilters<TDataSource>) => void;
}

export default function useFilterAdvance<TDataSource>(props: IAdvanceFilterTable<TDataSource>) {
  const { data, isResetFilter, onChangeAdvanceFilter, useServerAdvanceFilter = false } = props;

  const filterAdvanceCardRef = useRef<HTMLDivElement | null>(null);
  const [isFilterAdvanceCardOpen, setIsFilterAdvanceCardOpen] = useState({ show: false, key: '' });
  const [filterAdvanceCardPosition, setFilterAdvanceCardPosition] = useState({ top: 0, left: 0 });
  const [activeAdvanceFilters, setActiveAdvanceFilters] = useState<
    IActiveAdvanceFilters<TDataSource>
  >({} as IActiveAdvanceFilters<TDataSource>);

  useEffect(() => {
    if (isResetFilter) setActiveAdvanceFilters({} as IActiveAdvanceFilters<TDataSource>);
  }, [isResetFilter]);

  useOnClickOutside([filterAdvanceCardRef], () =>
    setIsFilterAdvanceCardOpen({ show: false, key: '' }),
  );

  const filteredAdvanceData = useMemo(() => {
    if (Object.keys(activeAdvanceFilters).length === 0) return data;
    if (useServerAdvanceFilter) return data;

    return data.filter((item) => {
      return Object.entries(activeAdvanceFilters).every(([key, filter]) => {
        const itemValue = String(item[key as keyof TDataSource]).toLowerCase();
        const filterValue = (filter as { value: string })?.value?.toLowerCase();

        switch ((filter as { config_name: TFilterAdvanceConfig })?.config_name) {
          case 'equal':
            return itemValue === filterValue;
          case 'notEqual':
            return itemValue !== filterValue;
          case 'startsWith':
            return itemValue.startsWith(filterValue);
          case 'endsWith':
            return itemValue.endsWith(filterValue);
          case 'contains':
            return itemValue.includes(filterValue);
          case 'notContains':
            return !itemValue.includes(filterValue);
          default:
            return true;
        }
      });
    });
  }, [data, activeAdvanceFilters, useServerAdvanceFilter]);

  const handleOpenAdvanceFilter = useCallback(
    (e: React.MouseEvent<HTMLElement>, activeFilterKey: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const { calculatedTop, calculatedLeft } = calculateFixedCardPosition(rect);

      setFilterAdvanceCardPosition({ top: calculatedTop, left: calculatedLeft });
      setIsFilterAdvanceCardOpen({ show: true, key: activeFilterKey });
    },
    [],
  );

  const applyAdvanceFilter = useCallback(
    (dataKey: keyof TDataSource | string, config_name: TFilterAdvanceConfig, value: string) => {
      setActiveAdvanceFilters((prev) => {
        const newFilters = {
          ...prev,
          [dataKey]: { config_name, value },
        };

        onChangeAdvanceFilter?.(newFilters);

        return newFilters;
      });
      setIsFilterAdvanceCardOpen({ show: false, key: '' });
    },
    [onChangeAdvanceFilter],
  );

  const resetAdvanceFilter = useCallback(
    (dataKey: keyof TDataSource | string) => {
      setActiveAdvanceFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[dataKey as keyof TDataSource];
        onChangeAdvanceFilter?.(newFilters);
        return newFilters;
      });
      setIsFilterAdvanceCardOpen({ show: false, key: '' });
    },
    [onChangeAdvanceFilter],
  );

  return {
    filteredAdvanceData,
    filterAdvanceCardPosition,
    filterAdvanceCardRef,
    isFilterAdvanceCardOpen,
    setIsFilterAdvanceCardOpen,
    handleOpenAdvanceFilter,
    applyAdvanceFilter,
    resetAdvanceFilter,
    activeAdvanceFilters,
  };
}
