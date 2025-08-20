/**
 * Server-Side Constants
 *
 * Server-only constant definitions for the signout application including
 * default tags, system configurations, and initialization data.
 *
 *
 * @module consts.server
 *
 * @author Kyle Dunn
 */

import { TagData } from "./types.server";

/** Default system tags organized by category */
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
] as TagData[];
