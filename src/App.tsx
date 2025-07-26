import { VirtualTable } from './components/virtual-table';
import { columns, dummyData } from './lib/data';

export default function App() {
  return (
    <div className='h-[95vh] w-[95%] p-5 mx-auto flex flex-col space-y-2.5'>
      <h4>Data load: {dummyData.length}</h4>
      <div className='flex-1 overflow-auto'>
        <VirtualTable data={dummyData} headers={columns} getRowKey={(user) => user?.id} />
      </div>
    </div>
  );
}
