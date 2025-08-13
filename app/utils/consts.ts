import { PersonRole } from "@prisma/client";
import { ItemStatusData, TagData } from "./types.server";

export const INITIAL_PAGE_SIZE = 15;
export const MAX_PAGE_SIZE = 100;

export const MAX_RECENT_ITEMS = 20;

export const ROLE_ORDER = [
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "Staff",
];

export const DEFAULT_ROLES = [
    { id: 0, name: "Grade 4", color: "#cf1010" },
    { id: 1, name: "Grade 5", color: "#cf1010" },
    { id: 2, name: "Grade 6", color: "#cf1010" },
    { id: 3, name: "Grade 7", color: "#ffc400" },
    { id: 4, name: "Grade 8", color: "#ffc400" },
    { id: 5, name: "Grade 9", color: "#0c0cb4" },
    { id: 6, name: "Grade 10", color: "#0c0cb4" },
    { id: 7, name: "Grade 11", color: "#0c0cb4" },
    { id: 8, name: "Grade 12", color: "#0c0cb4" },
    { id: 9, name: "Staff", color: "#800080" },
] satisfies Partial<PersonRole>[];

export const ITEM_OPTIONS = [
    {
        id: 0,
        name: "Modify Item Types",
        value: "types",
    },
    {
        id: 1,
        name: "Modify Item Statuses",
        value: "statuses",
    },
];

export const EXAMPLE_TAGS = [
    {
        id: -100,
        name: "-100",
        color: "gray",
        description: "Example tag with priority -100",
        priority: -100,
        hidden: false,
        category: "example",
    },
    {
        id: -200,
        name: "-50",
        color: "gray",
        description: "Example tag with priority -50",
        priority: -50,
        hidden: false,
        category: "example",
    },
    {
        id: -300,
        name: "-25",
        color: "gray",
        description: "Example tag with priority -25",
        priority: -25,
        hidden: false,
        category: "example",
    },
    {
        id: -400,
        name: "0",
        color: "gray",
        description: "Example tag with priority 0",
        priority: 0,
        hidden: false,
        category: "example",
    },
    {
        id: -500,
        name: "25",
        color: "gray",
        description: "Example tag with priority 25",
        priority: 25,
        hidden: false,
        category: "example",
    },
    {
        id: -600,
        name: "50",
        color: "gray",
        description: "Example tag with priority 50",
        priority: 50,
        hidden: false,
        category: "example",
    },
    {
        id: -700,
        name: "100",
        color: "gray",
        description: "Example tag with priority 100",
        priority: 100,
        hidden: false,
        category: "example",
    },
] as TagData[];

export const STATUS_OPTIONS = [
    {
        id: "returned",
        name: "Returned",
        color: "green",
    },
    {
        id: "lost",
        name: "Lost",
        color: "#dd6300",
    },
    {
        id: "damaged",
        name: "Damaged",
        color: "#cc0000",
    },
    {
        id: "unknown",
        name: "Unknown Status",
        color: "gray",
    },
    {
        id: "out",
        name: "Outstanding",
        color: "red",
    },
] as ItemStatusData[];

export const INVALID_STATUS_IDS = ["lost", "damaged", "unknown"];

export const LOAN_STATUSES = {
    returned: {
        id: "returned",
        name: "Returned",
        color: "green",
    },
    outstanding: {
        id: "outstanding",
        name: "Outstanding",
        color: "red",
    },
    invalid: {
        id: "invalid",
        name: "Invalid Items",
        color: "gray",
    },
};
