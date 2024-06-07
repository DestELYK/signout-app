import { PrismaClient } from "@prisma/client";
import { randomInt, randomUUID } from "node:crypto";

import dayjs from "dayjs";

import durations from "dayjs/plugin/duration";
import { DEFAULT_TAGS } from "~/utils/consts.server";

dayjs.extend(durations);

const prisma = new PrismaClient();

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

const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ut purus in odio sagittis egestas in et massa. Suspendisse porttitor fermentum felis id euismod. Mauris tempus urna a quam blandit, et suscipit neque sodales. Morbi laoreet pretium eros a fringilla. Nunc quis ligula varius, ornare augue et, sagittis justo. Fusce sit amet lacinia ex. Aliquam condimentum dui id tortor volutpat, ut euismod enim vestibulum. Integer porta, tortor at feugiat pharetra, sem ante ultrices libero, at consequat purus nibh in metus. Aliquam molestie nulla ut ligula mollis, eu venenatis urna pretium. Nam tempus ipsum lorem. Quisque a est euismod, aliquam elit a, sodales lectus";

async function main() {
  for (let i = 0; i < DEFAULT_TAGS.length; i++) {
    try {
      await prisma.tag.create({
        data: {
          ...DEFAULT_TAGS[i],
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

  const location = await prisma.tag.findFirstOrThrow({
    where: { name: "Helpdesk" },
  });

  for (let i = 0; i < 50; i++) {
    const listItem = itemList[randomInt(0, itemList.length)];
    const description =
      randomInt(0, 100) > 50 ? LOREM_IPSUM.slice(0, 100) : null;
    const notes =
      randomInt(0, 100) > 50
        ? LOREM_IPSUM.slice(0, randomInt(50, 200)).replaceAll(" ", "\n")
        : null;

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
      tagIds.push(location);
      await prisma.item.create({
        data: {
          ...item,
          locationId: location.id,
          description: description ?? undefined,
          notes: notes ?? undefined,
          tags: {
            connect: tagIds,
          },
          qrCode: randomUUID(),
        },
      });
    } catch (e) {
      continue;
    }
  }

  for (let i = 0; i < 100; i++) {
    try {
      const firstName = firstNames[randomInt(firstNames.length)];
      const lastName = lastNames[randomInt(lastNames.length)];
      const nickname =
        randomInt(0, 100) > 75
          ? nicknames[randomInt(nicknames.length)]
          : undefined;
      const role = personRoles[randomInt(personRoles.length)];
      const personQrCode =
        randomInt(0, 100) > 50
          ? randomInt(100000, 999999).toString()
          : undefined;
      const notes =
        randomInt(0, 100) > 50
          ? LOREM_IPSUM.slice(0, randomInt(50, 200)).replaceAll(" ", "\n")
          : null;

      await prisma.person.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          tags: {
            connect: {
              id: role.id,
            },
          },
          notes: notes ?? undefined,
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
  const loanInfoTags = await prisma.tag.findMany({
    where: { category: "Loan Info" },
  });

  const noItems: number[] = [];

  // Creates 1000 loaned items for testing
  for (let i = 0, o = 0; i < 1000; i++, o++) {
    try {
      const item = items[randomInt(0, items.length)];
      const person = people[randomInt(0, people.length)];
      let dateCreated = dayjs().subtract(
        dayjs.duration({
          months: randomInt(0, 4),
          hours: randomInt(1, 24),
          minutes: randomInt(0, 60),
        })
      );
      const tags =
        randomInt(0, 100) > 60
          ? loanInfoTags[randomInt(loanInfoTags.length)]
          : undefined;

      if (noItems.includes(item.id)) continue;

      const loanedItem = await prisma.loanedItem.findFirst({
        where: { itemId: item.id, dateReturned: null },
        include: {
          loan: {
            include: {
              person: true,
            },
          },
        },
      });

      if (loanedItem) {
        const loanedDateReturned = dayjs(loanedItem.dateLoaned).add(
          dayjs.duration({
            days: randomInt(0, 7),
            hours: randomInt(1, 24),
            minutes: randomInt(0, 60),
          })
        );

        if (dayjs(loanedDateReturned).isAfter()) {
          noItems.push(loanedItem.itemId);

          const status =
            randomInt(0, 100) > 50
              ? itemStatus[randomInt(0, itemStatus.length)]
              : null;

          if (status) {
            await prisma.item.update({
              where: { id: loanedItem.itemId },
              data: {
                tags: {
                  connect: {
                    id: status.id,
                  },
                },
              },
            });
          }

          continue;
        }

        const result = await prisma.loanedItem.update({
          where: {
            loanId_itemId: {
              itemId: loanedItem.itemId,
              loanId: loanedItem.loanId,
            },
          },
          data: {
            dateReturned: loanedDateReturned.toDate(),
            returnedBy: {
              connect: {
                id: loanedItem.loan.personId,
              },
            },
          },
        });

        dateCreated = loanedDateReturned.add(
          dayjs.duration({ days: randomInt(1, 14) })
        );

        if (dateCreated.isAfter()) {
          noItems.push(loanedItem.itemId);

          continue;
        }
      } else {
        await prisma.item.update({
          where: { id: item.id },
          data: {
            createdDate: dateCreated.toDate(),
            updatedDate: dateCreated.toDate(),
          },
        });
      }

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
              dateLoaned: dateCreated.toDate(),
              createdDate: dateCreated.toDate(),
              updatedDate: dateCreated.toDate(),
            },
          },
          tags: {
            connect: tags,
          },
          createdDate: dateCreated.toDate(),
          updatedDate: dateCreated.toDate(),
        },
      });
    } catch (e) {
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
