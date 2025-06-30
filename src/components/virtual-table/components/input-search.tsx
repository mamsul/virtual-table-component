import clsx from 'clsx';
import { forwardRef } from 'react';
import IcClose from '../icons/ic-close';

interface ITableVirtualInput extends React.InputHTMLAttributes<HTMLInputElement> {
  onClickEnter?: () => void;
  onRemoveSearch?: () => void;
}

const InputSearch = forwardRef<HTMLInputElement, ITableVirtualInput>(
  ({ onClickEnter, className, onRemoveSearch, value, onChange, ...props }, ref) => {
    return (
      <div className="!w-full relative group/input">
        <input
          ref={ref}
          type="text"
          placeholder=""
          className={clsx(
            'outline-none border border-gray-200 rounded h-[1.625rem] px-1.5 w-full text-xs focus:border-blue-950',
            'transition-all duration-300',
            className
          )}
          value={value}
          onChange={onChange}
          onKeyDown={(e) => e.key === 'Enter' && onClickEnter?.()}
          {...props}
        />

        {!props.disabled && (
          <IcClose
            onClick={onRemoveSearch}
            className={clsx(
              '!w-4 absolute right-1 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer',
              'opacity-0 group-hover/input:opacity-100 transition-opacity duration-200 hover:text-red-600'
            )}
          />
        )}
      </div>
    );
  }
);

export default InputSearch;
