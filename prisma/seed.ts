import { PrismaClient } from "@prisma/client";
import { randomInt, randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const itemStatus = [
    "IN",
    "OUT",
    "LOST"
]

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
    "Laura"
]

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
    "Proctor"
]

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
]

const roles = [
    "Staff",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
]

const itemList = [
    {
        name: "MacBook 1",
        type: "MacBook"
    },
    {
        name: "MacBook 2",
        type: "MacBook"
    },
    {
        name: "MacBook 3",
        type: "MacBook"
    },
    {
        name: "MacBook 4",
        type: "MacBook"
    },
    {
        name: "USB-C Cable 1",
        type: "USB-C Cable"
    },
    {
        name: "USB-C Cable 2",
        type: "USB-C Cable"
    },
    {
        name: "USB-C Cable 3",
        type: "USB-C Cable"
    },
    {
        name: "USB-C Cable 4",
        type: "USB-C Cable",
    },
]

async function main() {
    let outCount = 0;
    itemList.forEach(async (item) => {
        try {
        await prisma.item.create({
            data: {
                ...item,

        qrCode: randomUUID()
            }
        })
    } catch (e) {
        console.error(e);
    }
    })

    for (let i = 0; i < 30; i++) {
        try {
            const firstName = firstNames[randomInt(firstNames.length - 1)]
            const lastName = lastNames[randomInt(lastNames.length - 1)]
            const nickname = randomInt(0, 100) > 75 ? nicknames[randomInt(nicknames.length - 1)] : undefined
            const role = roles[randomInt(roles.length - 1)]
            const personQrCode = randomInt(100000, 999999).toString();

            await prisma.person.create({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    role: role,
                    qrCode: personQrCode,
                    ...nickname && {nickname: nickname}
                }
            })

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
            console.error(e)
            continue
        }
    }
}

main()
.then(async () => {
    await prisma.$disconnect()
})
.catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})