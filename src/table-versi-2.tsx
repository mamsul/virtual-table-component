import VirtualTable2, { type IColumn } from './components/virtual-table';

interface IUser {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  company: string;
}

const dummyData: IUser[] = Array.from({ length: 1000 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  age: Math.floor(Math.random() * 50),
  gender: Math.random() > 0.5 ? 'Male' : 'Female',
  phone: `+62 ${Math.floor(Math.random() * 100)}${Math.floor(Math.random() * 100)}${Math.floor(
    Math.random() * 100,
  )}`,
  address: `Address ${index + 1}`,
  city: `City ${index + 1}`,
  country: `Country ${index + 1}`,
  company: `Company ${index + 1}`,
}));

// Main Component
export default function TableVersi2() {
  const columns: IColumn<IUser>[] = [
    { key: 'expand', header: '', width: 40 },
    { key: 'id', header: 'ID', width: 50 },
    { key: 'name', header: 'Name', width: 150 },
    { key: 'email', header: 'Email', width: 200 },
    { key: 'age', header: 'Age', width: 100 },
    { key: 'gender', header: 'Gender', width: 100 },
    { key: 'phone', header: 'Phone', width: 200 },
    { key: 'address', header: 'Address', width: 200 },
    { key: 'city', header: 'City', width: 100 },
    { key: 'country', header: 'Country', width: 100 },
    { key: 'company', header: 'Company', width: 200 },
  ];

  return (
    <div className='p-5'>
      <div className='w-full h-[500px]'>
        <VirtualTable2
          data={dummyData}
          columns={columns}
          getRowKey={(user) => user.id}
          renderExpandedRow={() => (
            <VirtualTable2 data={dummyData} columns={columns} getRowKey={(user) => user.id} />
          )}
        />
      </div>
    </div>
  );
}
