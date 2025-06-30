import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useOnClickOutside from './use-click-outside';
import { calculateFixedCardPosition } from '../lib';

interface ISearchTable<TDataSource> {
  data: TDataSource[];
  isResetFilter?: boolean;
  useServerSearch?: boolean;
  onChangeSearch?: (data: Record<keyof TDataSource, string>) => void;
}

export default function useFilterSearch<TDataSource>(props: ISearchTable<TDataSource>) {
  const { data, useServerSearch, onChangeSearch, isResetFilter } = props;

  const searchCardRef = useRef<HTMLDivElement | null>(null);
  const [isSearchCardOpen, setIsSearchCardOpen] = useState({ show: false, key: '' });
  const [searchCardPosition, setSearchCardPosition] = useState({ top: 0, left: 0 });

  const [activeSearch, seActiveSearch] = useState<Record<keyof TDataSource, string>>(
    {} as Record<keyof TDataSource, string>
  );

  useEffect(() => {
    if (isResetFilter) seActiveSearch({} as Record<keyof TDataSource, string>);
  }, [isResetFilter]);

  useOnClickOutside(searchCardRef, () => setIsSearchCardOpen({ show: false, key: '' }));

  const searchedData = useMemo(() => {
    if (!activeSearch || Object.keys(activeSearch).length === 0) return data || [];
    if (useServerSearch) return data;

    return (data || []).filter((row) =>
      Object.entries(activeSearch).every(([dataKey, searchValue]) =>
        (searchValue as string).length === 0
          ? true
          : row[dataKey as keyof TDataSource]
              ?.toString()
              ?.toLowerCase()
              ?.includes((searchValue as string).toLowerCase())
      )
    );
  }, [data, activeSearch, useServerSearch]);

  const handleOpenSearch = useCallback(
    (e: React.MouseEvent<HTMLElement>, activeSearchKey: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const { calculatedTop, calculatedLeft } = calculateFixedCardPosition(rect);

      setSearchCardPosition({ top: calculatedTop, left: calculatedLeft });
      setIsSearchCardOpen({ show: true, key: activeSearchKey });
    },
    []
  );

  const updateSearch = useCallback(
    (dataKey: keyof TDataSource | string, searchValue: string) => {
      //   gridRef.current?.scrollTo({ scrollTop: 0 });

      seActiveSearch((prev) => {
        const newSearch = { ...prev };

        if (searchValue.length === 0) {
          delete newSearch[dataKey as keyof TDataSource];
        } else {
          newSearch[dataKey as keyof TDataSource] = searchValue;
        }

        onChangeSearch?.(newSearch);

        return newSearch;
      });

      setIsSearchCardOpen({ show: false, key: '' });
    },
    [onChangeSearch]
  );

  const resetSearch = useCallback(
    (dataKey: keyof TDataSource | string) => {
      function removeKeyImmutable<K extends keyof TDataSource>(
        source: Record<keyof TDataSource, string>,
        key: K
      ): Record<Exclude<keyof TDataSource, K>, string> {
        const { [key]: _, ...rest } = source;
        return rest;
      }

      const newActiveSearch = removeKeyImmutable(activeSearch, dataKey as keyof TDataSource);

      seActiveSearch(newActiveSearch as Record<keyof TDataSource, string>);
      onChangeSearch?.(newActiveSearch as Record<keyof TDataSource, string>);
      setIsSearchCardOpen({ show: false, key: '' });
    },
    [onChangeSearch, activeSearch]
  );

  const resetAllSearch = useCallback(
    () => seActiveSearch({} as Record<keyof TDataSource, string>),
    []
  );

  return {
    searchedData,
    searchCardRef,
    searchCardPosition,
    isSearchCardOpen,
    handleOpenSearch,
    updateSearch,
    resetSearch,
    activeSearch,
    resetAllSearch,
  };
}
