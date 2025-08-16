import { VirtualTable } from './components/virtual-table';
import { columns, dummyData } from './lib/data';

export default function App() {
  return (
    <div className='h-[95vh] w-[95%] p-5 mx-auto flex flex-col space-y-2.5'>
      <h4>Data load: {dummyData.length}</h4>
      <div className='flex-1 overflow-auto'>
        <VirtualTable
          key='table-utama'
          rowKey='id'
          data={dummyData}
          headers={columns}
          onClickRow={(data) => console.log('PARENT Click Row: ', data)}
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
