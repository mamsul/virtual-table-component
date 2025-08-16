import type { IHeader } from '../components/virtual-table';

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

export const dummyData: IUser[] = Array.from({ length: 500000 }, (_, index) => ({
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

export const columns: IHeader<IUser>[] = [
  { key: 'row-selection', caption: '', width: 40, noStretch: true },
  { key: 'expand', caption: '', width: 40, noStretch: true },
  { key: 'id', caption: 'ID' },
  { key: 'name', caption: 'Name' },
  { key: 'email', caption: 'Email', width: 200 },
  { key: 'age', caption: 'Age', width: 120 },
  { key: 'gender', caption: 'Gender', width: 120 },
  { key: 'phone', caption: 'Phone', width: 200 },
  { key: 'address', caption: 'Address', width: 200 },
  { key: 'city', caption: 'City', width: 140 },
  { key: 'country', caption: 'Country', width: 140 },
  { key: 'company', caption: 'Company' },
];
