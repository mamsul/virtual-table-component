import { VirtualTable } from './components/virtual-table';
import { columns, dummyData } from './lib/data';

export default function App() {
  return (
    <div className='h-[95vh] w-full p-5 mx-auto flex flex-col space-y-2.5'>
      <h4>Data load: {dummyData.length}</h4>
      <div className='flex-1 overflow-auto mt-8'>
        <VirtualTable
          key='table-utama'
          useFooter
          rowKey='id'
          data={dummyData}
          headers={columns}
          useServerFilter={{
            sort: true,
          }}
          onClickRow={(data) => console.log('PARENT Click Row: ', data)}
          onChangeFilter={{
            sort: (key, sortBy) => console.log('Filter Sort', { key, sortBy }),
            search: (data) => console.log('Filter Search: ', data),
            selection: (data) => console.log('Filter Selection: ', data),
            advance: (data) => console.log('Filter Advance: ', data),
          }}
          onChangeCheckboxRowSelection={(selectedRow, deselectedRows, isSelectAll) =>
            console.log('Checkbox Row: ', { selectedRow, deselectedRows, isSelectAll })
          }
          onScrollTouchBottom={() => alert('Scroll reached bottom!')}
          onRenderExpandedContent={(data) => (
            <div className='p-5 border border-gray-200 bg-green-50'>
              <h4 className='text-lg font-semibold'>Expanded Content</h4>
              <pre>
                <code>{JSON.stringify(data, null, 2)}</code>
              </pre>
            </div>
          )}
        />
      </div>
    </div>
  );
}
