import { VirtualTable2 } from './components/virtual-table-2';
import { columns, dummyData } from './lib/data';

export default function App() {
  return (
    <div className='h-[90vh] w-[95%] p-5 mx-auto'>
      <VirtualTable2 data={dummyData} columns={columns} getRowKey={(user) => user?.id} />
    </div>
  );
}
