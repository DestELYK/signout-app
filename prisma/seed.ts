import { PrismaClient } from "@prisma/client";

import fs from "fs";

const prisma = new PrismaClient();

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

  if (process.env.IMPORT_PATH) {
    const text = fs.readFileSync(process.env.IMPORT_PATH).toString("utf-8");

    const json: {
      loans: {
        id: number;
        personId: number;
        items: {
          loanId: number;
          itemId: number;
          dateLoaned: string;
          dateReturned: string;
        }[];
        longTerm: boolean;
        notes?: string | null;
      }[];
      people: {
        id: number;
        firstName: string;
        lastName: string;
        nickname?: string | null;
        role: string;
      }[];
      items: {
        id: number;
        name: string;
        type: string;
        state?: "lost" | null;
      }[];
    } = JSON.parse(text);

    if ("people" in json) {
      for (let i = 0; i < json.people.length; i++) {
        const person = json.people[i];
        try {
          await prisma.person.create({
            data: {
              id: person.id,
              firstName: person.firstName,
              lastName: person.lastName,
              nickname: person.nickname,
              tags: {
                connectOrCreate: {
                  where: {
                    name:
                      person.role === "Staff"
                        ? "Staff"
                        : `Grade ${person.role}`,
                  },
                  create: {
                    name: person.role,
                    color: "#ffffff",
                    category: "Person Role",
                  },
                },
              },
            },
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    if ("items" in json) {
      for (let i = 0; i < json.items.length; i++) {
        const item = json.items[i];
        try {
          await prisma.item.create({
            data: {
              id: item.id,
              name: item.name,
              tags: {
                ...(item.state &&
                  item.state == "lost" && {
                    connect: {
                      name: "Lost",
                    },
                  }),
                connectOrCreate: [
                  {
                    where: { name: item.type },
                    create: {
                      name: item.type,
                      color: "#ffffff",
                      category: "Item Type",
                    },
                  },
                ],
              },
            },
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    if ("loans" in json) {
      let existingItems: number[] = [];

      for (let i = 0; i < json.loans.length; i++) {
        try {
          const loan = json.loans[i];
          await prisma.loan.create({
            data: {
              id: loan.id,
              personId: loan.personId,
              createdDate: new Date(loan.items[0].dateLoaned),
              ...(loan.items[0].dateReturned
                ? {
                    updatedDate: new Date(loan.items[0].dateReturned),
                  }
                : { updatedDate: new Date(loan.items[0].dateLoaned) }),
              tags: {
                ...(loan.longTerm && {
                  connect: {
                    name: "Long-Term",
                  },
                }),
              },
              notes: loan.notes || undefined,
            },
          });

          for (let i = 0; i < loan.items.length; i++) {
            try {
              const item = loan.items[i];

              if (!(item.itemId in existingItems)) {
                await prisma.item.update({
                  where: { id: item.itemId },
                  data: {
                    createdDate: new Date(item.dateLoaned),
                    ...(item.dateReturned && {
                      updatedDate: new Date(item.dateReturned),
                    }),
                  },
                });

                existingItems.push(item.itemId);
              }

              await prisma.loanedItem.create({
                data: {
                  itemId: item.itemId,
                  loanId: item.loanId,
                  dateLoaned: new Date(item.dateLoaned),
                  dateReturned: item.dateReturned
                    ? new Date(item.dateReturned)
                    : undefined,
                  createdDate: new Date(item.dateLoaned),
                  updatedDate: item.dateReturned
                    ? new Date(item.dateReturned)
                    : undefined,
                  returnedById: loan.personId,
                },
              });
            } catch (e) {
              console.error("Item: ", e);
            }
          }
        } catch (e) {
          console.error("Loan: ", e);
        }
      }
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
