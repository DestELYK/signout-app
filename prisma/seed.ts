import { PrismaClient } from "@prisma/client";
import { randomInt, randomUUID } from "node:crypto";

import dayjs from "dayjs";

import durations from "dayjs/plugin/duration";
import { DEFAULT_ROLES, DEFAULT_TAGS } from "~/utils/consts.server";

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
        name: "Dell Laptop",
        tags: [
            {
                name: "Dell",
            },
            {
                name: "Laptop",
            },
        ],
    },
    {
        name: "Lenovo Laptop",
        tags: [
            {
                name: "Lenovo",
            },
            {
                name: "Laptop",
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
            {
                name: "USB-C Cable",
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
            {
                name: "Lightning Cable",
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
            {
                name: "USB-A Block",
            },
        ],
    },
    {
        name: "Aux Cable",
        tags: [
            {
                name: "Audio",
            },
            {
                name: "Cable",
            },
            {
                name: "Aux Cable",
            },
        ],
    },
    {
        name: "USB-C Charger",
        tags: [
            {
                name: "USB-C",
            },
            {
                name: "Charger",
            },
            {
                name: "Laptop Charger",
            },
        ],
    },
    {
        name: "MagSafe 2 Charger",
        tags: [
            {
                name: "Apple",
            },
            {
                name: "MagSafe",
            },
            {
                name: "Charger",
            },
            {
                name: "Laptop Charger",
            },
        ],
    },
    {
        name: "Micro-USB Cable",
        tags: [
            {
                name: "Micro-USB",
            },
            {
                name: "USB-A",
            },
            {
                name: "Cable",
            },
            {
                name: "Micro-USB Cable",
            },
        ],
    },
    {
        name: "Mini-USB Cable",
        tags: [
            {
                name: "Mini-USB",
            },
            {
                name: "USB-A",
            },
            {
                name: "Cable",
            },
            {
                name: "Mini-USB Cable",
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
            {
                name: "USB-C Block",
            },
        ],
    },
    {
        name: "USB-C Adapter",
        tags: [
            {
                name: "USB-C",
            },
            {
                name: "Adapter",
            },
        ],
    },
    {
        name: "USB-C Hub",
        tags: [
            {
                name: "USB-C",
            },
            {
                name: "Hub",
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

    for (let i = 0; i < DEFAULT_ROLES.length; i++) {
        try {
            await prisma.personRole.create({
                data: {
                    ...DEFAULT_ROLES[i],
                },
            });
        } catch (e) {
            console.error(e);
        }
    }

    const personRoles = await prisma.personRole.findMany();

    const itemStatus = await prisma.tag.findMany({
        where: { category: "Item Status" },
    });

    const itemTypeTags = await prisma.tag.findMany({
        where: { category: "Item Type" },
    });

    const location = await prisma.tag.findFirstOrThrow({
        where: { name: "Helpdesk" },
    });

    for (let i = 0; i < 150; i++) {
        const listItem = itemList[randomInt(0, itemList.length)];
        const description = randomInt(0, 100) > 50 ? LOREM_IPSUM.slice(0, 100) : null;
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
                randomInt(0, 100) > 75 ? nicknames[randomInt(nicknames.length)] : undefined;
            const role = personRoles[randomInt(personRoles.length)];
            const personQrCode =
                randomInt(0, 100) > 50 ? randomInt(100000, 999999).toString() : undefined;
            const notes =
                randomInt(0, 100) > 50
                    ? LOREM_IPSUM.slice(0, randomInt(50, 200)).replaceAll(" ", "\n")
                    : null;

            await prisma.person.create({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    role: {
                        connect: {
                            id: role.id,
                        },
                    },
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

    let currentDate = dayjs()
        .subtract(dayjs.duration({ months: 6 }))
        .set("hour", 8)
        .set("minute", 0)
        .set("second", 0)
        .set("millisecond", 0);

    // Creates 1000 loaned items for testing
    for (let i = 0, o = 0; i < 100; i++, o++) {
        console.log("Current Date: %s", currentDate.format("YYYY-MM-DD HH:mm:ss"));

        const item = items[randomInt(0, items.length)];
        const person = people[randomInt(0, people.length)];
        let dateCreated = dayjs(currentDate).add(
            dayjs.duration({ minutes: randomInt(2, 30), seconds: randomInt(0, 60) })
        );
        console.log("Date Created: %s", dateCreated.format("YYYY-MM-DD HH:mm:ss"));

        const tags =
            randomInt(0, 100) > 60 ? loanInfoTags[randomInt(loanInfoTags.length)] : undefined;

        try {
            const lastItem = await prisma.loanedItem.findFirst({
                where: { itemId: item.id },
                include: {
                    loan: {
                        include: {
                            person: true,
                        },
                    },
                },
                orderBy: {
                    dateLoaned: "desc",
                },
            });

            if (lastItem) {
                if (lastItem.dateReturned) {
                    dateCreated = dayjs(lastItem.dateReturned).add(
                        dayjs.duration({
                            minutes: randomInt(2, 120),
                            seconds: randomInt(0, 60),
                        })
                    );
                    console.log(
                        "Date Created After Return: %s",
                        dateCreated.format("YYYY-MM-DD HH:mm:ss")
                    );
                } else {
                    const dateReturned = dayjs(lastItem.dateLoaned).add(
                        dayjs.duration({
                            days: randomInt(0, 3),
                            minutes: randomInt(2, 120),
                            seconds: randomInt(0, 60),
                        })
                    );
                    console.log(
                        "Date Loaned: %s",
                        dayjs(lastItem.dateLoaned).format("YYYY-MM-DD HH:mm:ss")
                    );
                    console.log("Date Returned: %s", dateReturned.format("YYYY-MM-DD HH:mm:ss"));

                    await prisma.loanedItem.update({
                        where: {
                            loanId_itemId: {
                                itemId: lastItem.itemId,
                                loanId: lastItem.loanId,
                            },
                        },
                        data: {
                            dateReturned: dateReturned.toDate(),
                            returnedBy: {
                                connect: {
                                    id: lastItem.loan.personId,
                                },
                            },
                        },
                    });

                    dateCreated = dayjs(
                        dateReturned.isAfter(dateCreated) ? dateReturned : dateCreated
                    ).add(dayjs.duration({ minutes: randomInt(2, 30) }));
                    console.log(
                        "Date Created After Update: %s",
                        dateCreated.format("YYYY-MM-DD HH:mm:ss")
                    );
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
            console.warn("Skipping %i", i);
        }

        console.log();

        currentDate = dayjs(dateCreated)
            .set("hour", 8)
            .add(
                dayjs.duration({
                    days: randomInt(0, 3),
                    hours: randomInt(1, 3),
                    minutes: randomInt(2, 30),
                })
            );
    }

    const loanedItems = await prisma.loanedItem.findMany({
        select: {
            itemId: true,
            loanId: true,
            dateLoaned: true,
            dateReturned: true,
        },
    });

    for (let i = 0; i < loanedItems.length; i++) {
        const generateInvalid = randomInt(0, 100) > 50;

        if (generateInvalid) {
            await prisma.item.update({
                where: { id: loanedItems[i].itemId },
                data: {
                    tags: {
                        connect: {
                            id: itemStatus[randomInt(itemStatus.length)].id,
                        },
                    },
                },
            });
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
