import { PersonRole, Tag } from "@prisma/client";

export const DEFAULT_ROLES = [
    { id: 0, name: "Grade 4", color: "#ff0000" },
    { id: 1, name: "Grade 5", color: "#ff0000" },
    { id: 2, name: "Grade 6", color: "#ff0000" },
    { id: 3, name: "Grade 7", color: "#ffff00" },
    { id: 4, name: "Grade 8", color: "#ffff00" },
    { id: 5, name: "Grade 9", color: "#0000ff" },
    { id: 6, name: "Grade 10", color: "#0000ff" },
    { id: 7, name: "Grade 11", color: "#0000ff" },
    { id: 8, name: "Grade 12", color: "#0000ff" },
    { id: 9, name: "Staff", color: "#800080" },
] satisfies Partial<PersonRole>[];

export const DEFAULT_TAGS = [
    //#region  Item Status
    { name: "Broken", color: "red", category: "Item Status", priority: -10 },
    { name: "Lost", color: "red", category: "Item Status", priority: -10 },
    { name: "Missing", color: "red", category: "Item Status", priority: -10 },
    //#endregion

    //#region Hidden Item Types
    {
        name: "Audio",
        color: "blue",
        category: "Item Type",
        priority: 10,
        hidden: true,
    },
    {
        name: "USB-A",
        color: "blue",
        category: "Item Type",
        priority: 10,
        hidden: true,
    },
    {
        name: "USB-C",
        color: "blue",
        category: "Item Type",
        priority: 10,
        hidden: true,
    },
    {
        name: "Lightning",
        color: "blue",
        category: "Item Type",
        priority: 10,
        hidden: true,
    },
    {
        name: "MagSafe",
        color: "blue",
        category: "Item Type",
        priority: 10,
        hidden: true,
    },
    {
        name: "Cable",
        color: "blue",
        category: "Item Type",
        priority: 9,
        hidden: true,
    },
    {
        name: "Block",
        color: "blue",
        category: "Item Type",
        priority: 9,
        hidden: true,
    },
    {
        name: "Hub",
        color: "blue",
        category: "Item Type",
        priority: 9,
    },
    {
        name: "Adapter",
        color: "blue",
        category: "Item Type",
        priority: 9,
    },
    //#endregion

    //#region Item Types
    { name: "USB-C Hub", color: "blue", category: "Item Type", priority: 7 },
    {
        name: "USB-A to USB-C Adapter",
        color: "blue",
        category: "Item Type",
        priority: 7,
    },
    { name: "USB-C Cable", color: "blue", category: "Item Type", priority: 7 },
    {
        name: "Micro-USB Cable",
        color: "blue",
        category: "Item Type",
        priority: 7,
    },
    { name: "Mini-USB Cable", color: "blue", category: "Item Type", priority: 7 },
    {
        name: "Lightning Cable",
        color: "blue",
        category: "Item Type",
        priority: 7,
    },
    { name: "Aux Cable", color: "blue", category: "Item Type", priority: 7 },
    { name: "USB-A Block", color: "blue", category: "Item Type", priority: 7 },
    { name: "USB-C Block", color: "blue", category: "Item Type", priority: 7 },
    { name: "Laptop Charger", color: "blue", category: "Item Type", priority: 7 },
    { name: "Laptop", color: "blue", category: "Item Type", priority: 7 },
    { name: "MacBook", color: "blue", category: "Item Type", priority: 7 },
    { name: "Chromebook", color: "blue", category: "Item Type", priority: 7 },
    //#endregion

    //#region Item Brands
    {
        name: "Unknown",
        color: "white",
        category: "Item Brand",
        priority: -10,
        hidden: true,
    },
    {
        name: "Dell",
        color: "blue",
        category: "Item Brand",
        priority: -10,
        hidden: true,
    },
    {
        name: "Lenovo",
        color: "blue",
        category: "Item Brand",
        priority: -10,
        hidden: true,
    },
    {
        name: "Microsoft",
        color: "blue",
        category: "Item Brand",
        priority: -10,
        hidden: true,
    },
    {
        name: "Acer",
        color: "blue",
        category: "Item Brand",
        priority: -10,
        hidden: true,
    },
    {
        name: "Apple",
        color: "gray",
        category: "Item Brand",
        priority: -10,
        hidden: true,
    },
    {
        name: "HP",
        color: "blue",
        category: "Item Brand",
        priority: -10,
        hidden: true,
    },
    {
        name: "Asus",
        color: "blue",
        category: "Item Brand",
        priority: -10,
        hidden: true,
    },
    //#endregion

    //#region Loan Info
    { name: "Long-Term", color: "orange", category: "Loan Info", priority: -50 },
    { name: "Classroom", color: "blue", category: "Loan Info", priority: -50 },
    //#endregion

    //#region Locations
    { name: "Helpdesk", color: "green", category: "Location" },
    //#endregion
] satisfies Partial<Tag>[];
