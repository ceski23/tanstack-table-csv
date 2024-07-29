export type DataItem = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  progress: number;
  status: string;
  something: number[];
};

export const data: DataItem[] = [
  {
    firstName: "Tanner",
    lastName: "Linsley",
    age: 33,
    visits: 100,
    progress: 50,
    status: "Married",
    something: [1, 2, 3],
  },
  {
    firstName: "Kevin",
    lastName: "Vandy",
    age: 5,
    visits: 200,
    progress: 100,
    status: "Single",
    something: [4, 5, 6],
  },
  {
    firstName: "Tanner",
    lastName: "Vandy",
    age: 55,
    visits: 20,
    progress: 10,
    status: "Single",
    something: [7, 8, 9],
  },
];
