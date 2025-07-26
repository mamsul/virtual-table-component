import { memo, useRef } from 'react';
import { InputSearch } from './components';

interface IVirtualFilterSearchProps {
  headerKey: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
}

function VirtualFilterSearch(props: IVirtualFilterSearchProps) {
  const { headerKey, onSearchChange, onSearchClear } = props;
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
      id={'filter-search-' + headerKey}
      className='!w-full bg-white'
      ref={inputRef}
      onKeyDown={handleEnterSearch}
      onRemoveSearch={handleClickResetSearch}
    />
  );
}

export default memo(VirtualFilterSearch);
