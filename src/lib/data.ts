import type { IColumn } from '../components/virtual-table-2';

export interface IUser {
  id: number;
  name?: string;
  email?: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  company?: string;
}

export const dummyData: IUser[] = Array.from({ length: 1000 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  age: Math.floor(Math.random() * 50),
  gender: Math.random() > 0.5 ? 'Male' : 'Female',
  phone: `+62 ${Math.floor(Math.random() * 100)}${Math.floor(Math.random() * 100)}${Math.floor(
    Math.random() * 100,
  )}`,
  //   address: `Address ${index + 1}`,
  //   city: `City ${index + 1}`,
  //   country: `Country ${index + 1}`,
  //   company: `Company ${index + 1}`,
}));

export const columns: IColumn<IUser>[] = [
  { key: 'expand', header: '', width: 40, noStretch: true },
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email', width: 200 },
  { key: 'age', header: 'Age', width: 120 },
  { key: 'gender', header: 'Gender', width: 120 },
  { key: 'phone', header: 'Phone', width: 200 },
  //   { key: 'address', header: 'Address', width: 200 },
  //   { key: 'city', header: 'City', width: 140 },
  //   { key: 'country', header: 'Country', width: 140 },
  //   { key: 'company', header: 'Company' },
];
