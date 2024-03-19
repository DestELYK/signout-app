export interface ItemFormValues {
  id: number;
  qrCode?: string;
  name?: string;
  type?: string;
}

export interface PersonFormValues {
  id: number;
  qrCode?: string;
  firstName: string;
  lastName: string;
}

const TEST_PEOPLE = [
  {
    id: 0,
    qrCode: "0",
    firstName: "Kyle",
    lastName: "Dunn",
  },
  {
    id: 1,
    qrCode: "1",
    firstName: "Bailey",
    lastName: "Wells",
  },
  {
    id: 2,
    qrCode: "2",
    firstName: "Leo",
    lastName: "Alvarez",
  },
  {
    id: 3,
    qrCode: "3",
    firstName: "Junior",
    lastName: "Meyer",
  },
  {
    id: 4,
    qrCode: "4",
    firstName: "Alma",
    lastName: "Odling",
  },
  {
    id: 5,
    qrCode: "5",
    firstName: "Kelsie",
    lastName: "Reilly",
  },
  {
    id: 6,
    qrCode: "6",
    firstName: "Christopher",
    lastName: "Vasquez",
  },
  {
    id: 7,
    qrCode: "7",
    firstName: "Paige",
    lastName: "O'Gallagher",
  },
];

const TEST_ITEMS = [
  {
    id: 0,
    qrCode: "0",
    name: "MacBook 1",
    type: "MacBook",
  },
  {
    id: 1,
    qrCode: "1",
    name: "MacBook 2",
    type: "MacBook",
  },
  {
    id: 2,
    qrCode: "2",
    name: "MacBook 3",
    type: "MacBook",
  },
  {
    id: 3,
    qrCode: "3",
    name: "MacBook 4",
    type: "MacBook",
  },
  {
    id: 4,
    qrCode: "4",
    name: "MacBook 5",
    type: "MacBook",
  },
  {
    id: 5,
    qrCode: "5",
    name: "MacBook 6",
    type: "MacBook",
  },
  {
    id: 6,
    qrCode: "6",
    name: "MacBook 7",
    type: "MacBook",
  },
];

export function findItem(item: {
  qrCode?: string;
  name?: string;
}): Promise<ItemFormValues[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const foundItems = TEST_ITEMS.filter((i) => {
        return (
          item.qrCode === i.qrCode ||
          (item.name && i.name.toLowerCase().includes(item.name.toLowerCase()))
        );
      });

      return resolve(foundItems);
    }, 1000);
  });
}

export function getItems(): Promise<ItemFormValues[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve(TEST_ITEMS);
    }, 1000);
  });
}

export function findPerson(person: {
  qrCode?: string;
  name?: string;
}): Promise<PersonFormValues[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const foundPeople = TEST_PEOPLE.filter(
        (p) =>
          (person.qrCode && p.qrCode === person.qrCode) ||
          (person.name &&
            `${p.firstName} ${p.lastName}`
              .toLowerCase()
              .includes(person.name.toLowerCase()))
      );

      return resolve(foundPeople);
    });
  });
}
