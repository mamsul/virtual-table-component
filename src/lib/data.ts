import type { IHeader } from '../components/virtual-table';
import { faker } from '@faker-js/faker';

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
  name: faker.person.fullName(),
  email: faker.internet.email(),
  age: faker.number.int({ min: 18, max: 80 }),
  gender: faker.person.sex(),
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  country: faker.location.country(),
  company: faker.company.name(),
}));

const getFilterSelectionOptions = (key: keyof IUser): string[] => {
  const values = dummyData
    .map((item) => item[key])
    .filter((v): v is string | number => v !== undefined && v !== null)
    .map((v) => String(v));
  return Array.from(new Set(values));
};

export const columns: IHeader<IUser>[] = [
  { key: 'row-selection', caption: '', width: 40, noStretch: true, freeze: 'left' },
  { key: 'expand', caption: '', width: 40, noStretch: true, freeze: 'left' },
  { key: 'id', caption: 'ID', width: 100, noStretch: true },
  { key: 'name', caption: 'Name', filterSelectionOptions: getFilterSelectionOptions('name') },
  {
    key: 'email',
    caption: 'Email',
    width: 200,
    filterSelectionOptions: getFilterSelectionOptions('email'),
  },
  { key: 'age', caption: 'Age', width: 120 },
  { key: 'gender', caption: 'Gender', width: 120 },
  { key: 'phone', caption: 'Phone', width: 200 },
  { key: 'address', caption: 'Address', width: 200, freeze: 'right' },
  { key: 'city', caption: 'City', width: 140 },
  { key: 'country', caption: 'Country', width: 140 },
  { key: 'company', caption: 'Company' },
];
