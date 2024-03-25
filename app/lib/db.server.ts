import { Item, Person, Prisma } from "@prisma/client";
import { prisma } from "./prisma.server";

export function findItem(item: {
    qrCode?: string;
    name?: string;
  }): Promise<Item[]> {
    return new Promise(async (resolve) => {
        const filter: Prisma.ItemWhereInput | null = item.qrCode ? {
            qrCode: item.qrCode
        } : item.name ? {
            name: {
                contains: item.name
            }
        } : null

        if (!filter) return resolve([]);

        const items = await prisma.item.findMany({
            where: filter
        })

        return resolve(items)
    });
  }
  
  export function findPerson(person: {
    qrCode?: string;
    name?: string;
  }): Promise<Person[]> {
    return new Promise(async (resolve) => {
        const filter: Prisma.PersonWhereInput | null = person.qrCode ? {
            qrCode: person.qrCode
        } : person.name ? {
            OR: [
                {
                    firstName: {
                        contains: person.name
                    }
                },
                {
                    lastName: {
                        contains: person.name
                    }
                },
                {
                    AND: [
                        {firstName: {contains: person.name.split(' ')[0]}},
                        {lastName: {contains: person.name.split(' ')[1]}}
                    ]
                }
            ]
        } : null

        if (!filter) return resolve([]);

        const people = await prisma.person.findMany({
            where: filter
        })

        return resolve(people);
    });
  }
  