import { PrismaClient } from "@prisma/client";
import { randomInt, randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const itemStatus = ["IN", "OUT", "LOST"];

const firstNames = [
  "Bailey",
  "Leo",
  "Junior",
  "Alma",
  "Kelsie",
  "Christopher",
  "Paige",
  "Mollie",
  "Caoimhe",
  "Ty",
  "Audrey",
  "Luna",
  "Jonty",
  "Mariam",
  "Beth",
  "Myrtle",
  "Kaan",
  "Fatma",
  "Tessa",
  "Laura",
];

const lastNames = [
  "Gardner",
  "Andersen",
  "Pham",
  "Stevenson",
  "Cannon",
  "Saunders",
  "Morrow",
  "Bishop",
  "Irwin",
  "Slater",
  "Spence",
  "Wells",
  "Alvarez",
  "Meyer",
  "Odling",
  "Reilly",
  "Vasquez",
  "O'Gallagher",
  "Durham",
  "Proctor",
];

const nicknames = [
  "Parker",
  "Cristal",
  "Evie",
  "Azaria",
  "Uriel",
  "Braden",
  "Elisa",
  "Quinn",
  "Kaylin",
  "Blaze",
  "Sterling",
  "Emery",
  "Jagger",
  "Donovan",
  "Emilia",
  "Marley",
  "Alec",
  "Nigel",
  "Cara",
  "Taniyah",
];

const itemList = [
  {
    name: "MacBook",
    tags: [
      {
        name: "Apple",
      },
      {
        name: "MacBook",
      },
    ],
  },
  {
    name: "Asus Chromebook",
    tags: [
      {
        name: "Asus",
      },
      {
        name: "Chromebook",
      },
    ],
  },
  {
    name: "HP Chromebook",
    tags: [
      {
        name: "HP",
      },
      {
        name: "Chromebook",
      },
    ],
  },
  {
    name: "USB-C Cable",
    tags: [
      {
        name: "USB-C",
      },
      {
        name: "Cable",
      },
    ],
  },
  {
    name: "USB-C Block",
    tags: [
      {
        name: "USB-C",
      },
      {
        name: "Block",
      },
    ],
  },
  {
    name: "Lightning Cable",
    tags: [
      {
        name: "Lightning",
      },
      {
        name: "Cable",
      },
    ],
  },
  {
    name: "USB-A Block",
    tags: [
      {
        name: "USB-A",
      },
      {
        name: "Block",
      },
    ],
  },
];

const TAGS = [
  //#region Person Roles
  { name: "Grade 4", color: "red", category: "Person Role" },
  { name: "Grade 5", color: "red", category: "Person Role" },
  { name: "Grade 6", color: "red", category: "Person Role" },
  { name: "Grade 7", color: "yellow", category: "Person Role" },
  { name: "Grade 8", color: "yellow", category: "Person Role" },
  { name: "Grade 9", color: "blue", category: "Person Role" },
  { name: "Grade 10", color: "blue", category: "Person Role" },
  { name: "Grade 11", color: "blue", category: "Person Role" },
  { name: "Grade 12", color: "blue", category: "Person Role" },
  { name: "Staff", color: "purple", category: "Person Role" },
  //#endregion
  //#region  Item Status
  { name: "Broken", color: "red", category: "Item Status" },
  { name: "Lost", color: "red", category: "Item Status" },
  { name: "Missing", color: "red", category: "Item Status" },
  //#endregion
  //#region Item Type
  { name: "USB-A", color: "blue", category: "Item Type" },
  { name: "USB-C", color: "blue", category: "Item Type" },
  { name: "Lightning", color: "blue", category: "Item Type" },
  { name: "Cable", color: "blue", category: "Item Type" },
  { name: "Block", color: "blue", category: "Item Type" },
  { name: "Hub", color: "blue", category: "Item Type" },
  { name: "Adapter", color: "blue", category: "Item Type" },
  { name: "MacBook", color: "blue", category: "Item Type" },
  { name: "Chromebook", color: "blue", category: "Item Type" },
  { name: "Apple", color: "gray", category: "Item Type" },
  { name: "HP", color: "blue", category: "Item Type" },
  { name: "Asus", color: "blue", category: "Item Type" },
  //#endregion
  //#region Loan Info
  { name: "Long-Term", color: "orange", category: "Loan Info" },
  { name: "Classroom", color: "blue", category: "Loan Info" },
  //#endregion
];

async function main() {
  for (let i = 0; i < TAGS.length; i++) {
    try {
      await prisma.tag.create({
        data: {
          ...TAGS[i],
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  const personRoles = await prisma.tag.findMany({
    where: { category: "Person Role" },
  });

  const itemStatus = await prisma.tag.findMany({
    where: { category: "Item Status" },
  });

  const itemTypeTags = await prisma.tag.findMany({
    where: { category: "Item Type" },
  });

  for (let i = 0; i < 50; i++) {
    const listItem = itemList[randomInt(0, itemList.length)];

    const item = {
      ...listItem,
      name: `${listItem.name} ${randomInt(1, 50)}`,
    };

    try {
      const tagIds = await prisma.tag.findMany({
        where: {
          OR: item.tags.map((t) => {
            return { name: t.name };
          }),
        },
        select: {
          id: true,
        },
      });
      await prisma.item.create({
        data: {
          ...item,
          tags: {
            connect: tagIds,
          },
          qrCode: randomUUID(),
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  for (let i = 0; i < 30; i++) {
    try {
      const firstName = firstNames[randomInt(firstNames.length - 1)];
      const lastName = lastNames[randomInt(lastNames.length - 1)];
      const nickname =
        randomInt(0, 100) > 75
          ? nicknames[randomInt(nicknames.length - 1)]
          : undefined;
      const role = personRoles[randomInt(personRoles.length - 1)];
      const personQrCode = randomInt(100000, 999999).toString();

      await prisma.person.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          role: {
            connect: {
              id: role.id,
            },
          },
          qrCode: personQrCode,
          ...(nickname && { nickname: nickname }),
        },
      });

      // const dateReturned = outCount >= 15 ? new Date() : ((randomInt(1)) ? new Date() : null)

      // const status =  dateReturned ? "IN" : "OUT"

      // const loan = await prisma.loan.create({
      //     data: {
      //         person: {
      //             create: {
      //                 firstName: firstName,
      //                 lastName: lastName,
      //                 role: role,
      //                 qrCode: personQrCode
      //             }
      //         },
      //         items: {
      //             create: [
      //                 {
      //                     item: {
      //                         create: {
      //                             name: item.name,
      //                             type: item.type,
      //                             status: status
      //                         }
      //                     },
      //                     dateLoaned: new Date(),
      //                     dateReturned: dateReturned
      //                 }
      //             ]
      //         }
      //     }
      // })

      // if (status === "OUT") {
      //     outCount++;
      // }
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  const items = await prisma.item.findMany();
  const people = await prisma.person.findMany();

  // Creates 1000 loaned items for testing
  for (let i = 0, o = 0; i < 1000; i++, o++) {
    try {
      const item = items[randomInt(0, items.length - 1)];
      const person = people[randomInt(0, people.length - 1)];
      const dateReturned = randomInt(0, 100) < 90 ? new Date() : null;

      await prisma.loan.create({
        data: {
          person: {
            connect: {
              id: person.id,
            },
          },
          items: {
            create: {
              item: {
                connect: {
                  id: item.id,
                },
              },
              dateReturned: dateReturned
            },
          },
        },
      });
    } catch (e) {
      console.error(e);
      continue;
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
