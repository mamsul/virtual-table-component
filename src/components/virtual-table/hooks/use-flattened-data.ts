import { useMemo } from 'react';

export default function useFlattenedData<T>(
  data: T[] | undefined,
  expanded: Set<string | number>,
  getRowKey: (item: T) => string | number
) {
  return useMemo(() => {
    if (!data) return [];

    return data.flatMap((item) => {
      const key = getRowKey(item);
      return expanded.has(key)
        ? [
            { type: 'row', item },
            { type: 'expanded', item },
          ]
        : [{ type: 'row', item }];
    });
  }, [data, expanded, getRowKey]);
}
