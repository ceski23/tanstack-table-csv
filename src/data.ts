import { faker } from "@faker-js/faker";

export type DataItem = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
};

faker.seed(Math.PI);

export const createDataItem = (): DataItem => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  age: faker.number.int({ min: 1, max: 100 }),
  visits: faker.number.int({ min: 1, max: 999 }),
  status: faker.helpers.arrayElement(["Married", "Single"]),
});
