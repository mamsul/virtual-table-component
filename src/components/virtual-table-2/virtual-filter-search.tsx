import { memo, useRef } from 'react';
import { InputSearch } from './components';

interface IVirtualFilterSearchProps {
  columnKey: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
}

function VirtualFilterSearch(props: IVirtualFilterSearchProps) {
  const { columnKey, onSearchChange, onSearchClear } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEnterSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearchChange(inputRef.current?.value || '');
  };

  const handleClickResetSearch = () => {
    if (inputRef.current?.value.length) onSearchClear();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <InputSearch
      id={'filter-search-' + columnKey}
      className='!w-full bg-white'
      ref={inputRef}
      onKeyDown={handleEnterSearch}
      onRemoveSearch={handleClickResetSearch}
    />
  );
}

export default memo(VirtualFilterSearch);
