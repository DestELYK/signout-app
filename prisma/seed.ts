import { PrismaClient } from "@prisma/client";

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
