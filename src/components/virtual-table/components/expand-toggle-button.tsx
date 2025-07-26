import clsx from 'clsx';
import Icon from '../icons';

export default function ExpandToggleButton({
  onClick,
  isExpanded = false,
}: {
  onClick: () => void;
  isExpanded: boolean;
}) {
  return (
    <button className='hover:bg-gray-300 transition-colors rounded cursor-pointer' onClick={onClick}>
      <Icon name='chevron' className={clsx('!size-5 transition-transform duration-100', isExpanded ? 'rotate-0' : '-rotate-90')} />
    </button>
  );
}
