import { memo } from 'react';
import Icons from '../icons';
import clsx from 'clsx';

function RowExpand({ isExpanded = false }: { isExpanded?: boolean }) {
  return (
    <div className='flex justify-center items-center w-full h-full'>
      <button
        data-action='expand'
        className='hover:bg-gray-300 transition-colors rounded cursor-pointer'
        type='button'
        aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
      >
        <Icons
          name='chevron'
          className={clsx(
            '!size-5 transition-transform duration-100',
            isExpanded ? 'rotate-0' : '-rotate-90',
          )}
        />
      </button>
    </div>
  );
}

export default memo(RowExpand);
