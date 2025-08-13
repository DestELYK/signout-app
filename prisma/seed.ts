import { PrismaClient } from "@prisma/client";

import dayjs from "dayjs";

import durations from "dayjs/plugin/duration";
import { randomInt } from "node:crypto";
import { createItem, createItemLocation, createItemType } from "~/lib/items.server";
import { createPerson, createPersonRole } from "~/lib/people.server";
import { PersonFormType } from "~/lib/schemas";
import { DEFAULT_ROLES, STATUS_OPTIONS } from "~/utils/consts";
import { ItemData, PersonData, TagData } from "~/utils/types.server";

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
    },
    {
        name: "Asus Chromebook",
    },
    {
        name: "HP Chromebook",
    },
    {
        name: "Dell Laptop",
    },
    {
        name: "USB-C Cable",
    },
    {
        name: "Lightning Cable",
    },
    {
        name: "USB-A Block",
    },
    {
        name: "USB-C Charger",
    },
    {
        name: "MagSafe 2 Charger",
    },
    {
        name: "Micro-USB Cable",
    },
    {
        name: "Mini-USB Cable",
    },
    {
        name: "USB-C Block",
    },
    {
        name: "USB-C Adapter",
    },
    {
        name: "USB-C Hub",
    },
];

const LOREM_IPSUM =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ut purus in odio sagittis egestas in et massa. Suspendisse porttitor fermentum felis id euismod. Mauris tempus urna a quam blandit, et suscipit neque sodales. Morbi laoreet pretium eros a fringilla. Nunc quis ligula varius, ornare augue et, sagittis justo. Fusce sit amet lacinia ex. Aliquam condimentum dui id tortor volutpat, ut euismod enim vestibulum. Integer porta, tortor at feugiat pharetra, sem ante ultrices libero, at consequat purus nibh in metus. Aliquam molestie nulla ut ligula mollis, eu venenatis urna pretium. Nam tempus ipsum lorem. Quisque a est euismod, aliquam elit a, sodales lectus";

async function main() {
    const tags: TagData[] = [];

    for (let i = 0; i < 20; i++) {
        const tag = await prisma.tag.create({
            data: {
                name: `Tag ${i}`,
                category: "default",
                color: "#54c0ff",
            },
        });

        tags.push({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            category: tag.category,
            hidden: tag.hidden,
            priority: tag.priority,
        });
    }

    const roles = (await Promise.all(DEFAULT_ROLES.map((role) => createPersonRole(role))))
        .map((result) => {
            if (result.data) {
                return result.data;
            }
        })
        .filter((role) => role !== undefined);

    let people: PersonData[] = [];
    for (let i = 0; i < 100; i++) {
        const person: PersonFormType = {
            firstName: firstNames[randomInt(firstNames.length)],
            lastName: lastNames[randomInt(lastNames.length)],
            role: { id: roles[randomInt(roles.length)].id },
            tags: Array(randomInt(0, 5))
                .fill(0)
                .map(() => tags[randomInt(tags.length)]),
        };

        try {
            const result = await createPerson(person);

            if (result.error) {
                throw new Error();
            }

            if (result.data) {
                people.push(result.data);
            }
        } catch (e: any) {
            i--;
            continue;
        }
    }

    const itemTypes = (
        await Promise.all(itemList.map((item) => createItemType({ name: item.name })))
    )
        .map((result) => result.data)
        .filter((itemType) => itemType !== undefined);

    const locations = [(await createItemLocation({ name: "Helpdesk" })).data].filter(
        (location) => location !== undefined
    );

    let items: ItemData[] = [];
    for (let i = 0; i < 50; i++) {
        try {
            const type = itemTypes[randomInt(itemTypes.length)];
            const name = `${type.name} ${randomInt(0, 50)}`;
            const location = locations[0];
            const description =
                randomInt(0, 100) > 50
                    ? LOREM_IPSUM.slice(randomInt(0, 100), randomInt(100, 200)).slice(0, 50)
                    : undefined;
            const notes =
                randomInt(0, 100) > 50
                    ? LOREM_IPSUM.slice(randomInt(0, 100), randomInt(100, 200)).replaceAll(
                          " ",
                          "\n"
                      )
                    : undefined;
            const result = await createItem({
                name,
                type,
                description,
                location,
                notes,
                tags: Array(randomInt(0, 5))
                    .fill(0)
                    .map(() => tags[randomInt(tags.length)]),
            });

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.data) {
                items.push(result.data);
            }
        } catch (e) {
            i--;
            continue;
        }
    }

    console.log("Creating item info");
    const itemInfo = items.map((item) => {
        let currentDate = dayjs()
            .subtract(randomInt(300, 365), "day")
            .set("second", 0)
            .set("millisecond", 0);

        return {
            itemId: item.id,
            loans: Array(50)
                .fill(0)
                .map(() => {
                    const randomPerson = people[randomInt(people.length)];
                    const dateLoaned = currentDate.toDate();
                    const dateReturned = currentDate.add(randomInt(1, 500), "hour").toDate();

                    currentDate = dayjs(dateReturned).add(randomInt(1, 500), "minute");

                    if (currentDate.isAfter(dayjs())) {
                        return undefined;
                    }

                    return {
                        personId: randomPerson.id,
                        dateLoaned: dateLoaned,
                        dateReturned: dateReturned,
                    };
                })
                .filter((loan) => loan !== undefined),
        };
    });

    for (let i = 0; i < itemInfo.length; i++) {
        const item = itemInfo[i];

        await prisma.item.update({
            where: {
                id: item.itemId,
            },
            data: {
                createdDate: item.loans[0].dateLoaned,
            },
        });

        console.log("Creating %i loans for item %i", item.loans.length, item.itemId);
        for (let j = 0; j < item.loans.length; j++) {
            try {
                const loan = item.loans[j];

                const createdLoan = await prisma.loan.create({
                    data: {
                        createdDate: loan.dateLoaned,
                        updatedDate: loan.dateReturned,
                        person: {
                            connect: {
                                id: loan.personId,
                            },
                        },
                        items: {
                            create: {
                                item: {
                                    connect: {
                                        id: item.itemId,
                                    },
                                },
                                status: "returned",
                                createdDate: loan.dateLoaned,
                                updatedDate: loan.dateReturned,
                                dateLoaned: loan.dateLoaned,
                                dateReturned: loan.dateReturned,
                                returnedBy: {
                                    connect: {
                                        id:
                                            randomInt(0, 100) > 50
                                                ? loan.personId
                                                : people[randomInt(people.length)].id,
                                    },
                                },
                            },
                        },
                        tags: {
                            connect: Array(randomInt(0, 5))
                                .fill(0)
                                .map(() => ({ id: tags[randomInt(tags.length)].id })),
                        },
                    },
                });

                console.log("Created loan %i", createdLoan.id);

                if (j === item.loans.length - 1) {
                    const randomStatus = STATUS_OPTIONS[randomInt(0, STATUS_OPTIONS.length)].id;

                    const updatedItem = await prisma.loanedItem.update({
                        where: {
                            loanId_itemId: {
                                loanId: createdLoan.id,
                                itemId: item.itemId,
                            },
                        },
                        data: {
                            dateReturned: randomStatus === "out" ? null : loan.dateReturned,
                            status: randomStatus,
                            returnedById: randomStatus === "out" ? null : undefined,
                        },
                    });

                    console.log("Updated item %i status to %s", item.itemId, randomStatus);
                }
            } catch (e: any) {
                console.error(e.message);
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
