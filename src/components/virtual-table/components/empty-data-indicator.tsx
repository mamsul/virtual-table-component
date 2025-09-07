import { useVirtualizerContext } from '../context/virtualizer-context';

function EmptyDataIndicator() {
  const { rowVirtualItems } = useVirtualizerContext();

  if (rowVirtualItems.length) return;

  return (
    <div className='absolute inset-0 flex justify-center items-center'>
      <p className='text-lg font-medium text-gray-400'>Tidak ada data yang tersedia</p>
    </div>
  );
}

export default EmptyDataIndicator;
