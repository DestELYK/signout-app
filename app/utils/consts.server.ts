import { Tag } from "@prisma/client";

export const DEFAULT_TAGS = [
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
  { name: "Broken", color: "red", category: "Item Status", priority: -10 },
  { name: "Lost", color: "red", category: "Item Status", priority: -10 },
  { name: "Missing", color: "red", category: "Item Status", priority: -10 },
  //#endregion
  //#region Item Type
  { name: "USB-A", color: "blue", category: "Item Type", priority: 10 },
  { name: "USB-C", color: "blue", category: "Item Type", priority: 10 },
  { name: "Lightning", color: "blue", category: "Item Type", priority: 10 },
  { name: "Cable", color: "blue", category: "Item Type", priority: 9 },
  { name: "Block", color: "blue", category: "Item Type", priority: 9 },
  { name: "Hub", color: "blue", category: "Item Type", priority: 9 },
  { name: "Adapter", color: "blue", category: "Item Type", priority: 9 },
  { name: "MacBook", color: "blue", category: "Item Type", priority: 7 },
  { name: "Chromebook", color: "blue", category: "Item Type", priority: 7 },
  { name: "Apple", color: "gray", category: "Item Type", priority: 8 },
  { name: "HP", color: "blue", category: "Item Type", priority: 8 },
  { name: "Asus", color: "blue", category: "Item Type", priority: 8 },
  //#endregion
  //#region Loan Info
  { name: "Long-Term", color: "orange", category: "Loan Info", priority: -50 },
  { name: "Classroom", color: "blue", category: "Loan Info", priority: -50 },
  //#endregion
  //#region Locations
  { name: "Helpdesk", color: "green", category: "Location" },
  //#endregion
] satisfies Partial<Tag>[];

export const ITEMS_PER_PAGE = 10;

export const MAX_RECENT_ITEMS = 5;