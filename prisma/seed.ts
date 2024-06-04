import { PrismaClient } from "@prisma/client";
import { DEFAULT_TAGS } from "~/utils/consts.server";

const prisma = new PrismaClient();

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
