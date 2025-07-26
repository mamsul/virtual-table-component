import { useRef, useCallback, useState } from 'react';
import { columns, dummyData } from '../lib/data';
import { VirtualTable2 } from '../components/virtual-table';

export default function SyncScroll() {
  const otherPaneRef = useRef<HTMLDivElement>(null);
  const [tableScrollEl, setTableScrollEl] = useState<HTMLDivElement | null>(null);
  const isSyncingScroll = useRef(false);

  const handleTableScroll = (scrollTop: number) => {
    if (isSyncingScroll.current) return;
    if (otherPaneRef.current) {
      isSyncingScroll.current = true;
      otherPaneRef.current.scrollTop = scrollTop;
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    }
  };

  const handleOtherPaneScroll = useCallback(() => {
    if (isSyncingScroll.current) return;
    if (tableScrollEl && otherPaneRef.current) {
      isSyncingScroll.current = true;
      tableScrollEl.scrollTop = otherPaneRef.current.scrollTop;
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    }
  }, [tableScrollEl]);

  return (
    <div className='p-5 grid grid-cols-2 gap-2 h-[500px]'>
      <div className='w-full h-full overflow-auto'>
        <VirtualTable2
          data={dummyData}
          columns={columns}
          getRowKey={(user) => user.id}
          renderExpandedRow={() => (
            <VirtualTable2 data={dummyData} columns={columns} getRowKey={(user) => user.id} />
          )}
          onScroll={handleTableScroll}
          getScrollElement={setTableScrollEl}
        />
      </div>
      <div
        className='w-full h-full overflow-auto pt-[40px]'
        ref={otherPaneRef}
        onScroll={handleOtherPaneScroll}
      >
        {Array.from({ length: 1000 }, (_, index) => (
          <div
            key={index}
            className='p-2 border-b border-gray-200 hover:bg-gray-50]'
            style={{ height: '32px' }}
          >
            Row {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
