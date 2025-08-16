import { memo } from 'react';
import Icons from '../icons';
import { useFilterContext } from '../context/filter-context';
import HeaderAction from './header-action';

/**
 * NOTE: Rendering Header.
 * - Single Header: Tampilkan caption saja.
 * - Double Header: Tampilkan caption, sorting, dan icon burger menu toggle Header Action.
 */

interface IHeaderCaption {
  isSingleHeader: boolean;
  caption: string;
  headerKey: string;
}

function HeaderCaption({ isSingleHeader, caption, headerKey }: IHeaderCaption) {
  const { sort } = useFilterContext();

  if (isSingleHeader) return caption;

  return (
    <div
      className='flex-1 flex w-full justify-between items-center border-b border-gray-200 px-1.5 cursor-pointer'
      onClick={() => sort.onChangeSort(headerKey.toString())}
    >
      <span className='flex items-center gap-1.5'>
        {caption}
        <Icons
          name='sort'
          className='cursor-pointer'
          sort={headerKey === sort.sortKey ? sort.sortBy : 'unset'}
          onClick={() => sort.onChangeSort(headerKey.toString())}
        />
      </span>

      <HeaderAction headerKey={headerKey} />
    </div>
  );
}

export default memo(HeaderCaption);
