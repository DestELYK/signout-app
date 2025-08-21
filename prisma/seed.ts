import { PrismaClient } from "@prisma/client";

import dayjs from "dayjs";

import durations from "dayjs/plugin/duration";
import { randomInt } from "node:crypto";
import { createItem, createItemLocation, createItemType } from "~/lib/items.server";
import { createPerson, createPersonRole } from "~/lib/people.server";
import { PersonFormType, TagFormType } from "~/lib/schemas";
import { createTag } from "~/lib/tags.server";
import { DEFAULT_ROLES } from "~/utils/consts";
import { ItemData, PersonData, PersonRoleData, TagData } from "~/utils/types.server";

dayjs.extend(durations);

dayjs.extend(durations);

const prisma = new PrismaClient();

const firstNames = [
  // More realistic school-age names
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "William",
  "Mia",
  "James",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Lucas",
  "Harper",
  "Henry",
  "Evelyn",
  "Alexander",
  "Abigail",
  "Michael",
  "Emily",
  "Daniel",
  "Elizabeth",
  "Matthew",
  "Sofia",
  "Elijah",
  "Avery",
  "Owen",
  "Ella",
  "Jackson",
  "Madison",
  "Sebastian",
  "Scarlett",
  "Aiden",
  "Victoria",
  "Samuel",
  "Aria",
  "David",
  "Grace",
  "Joseph",
  "Chloe",
  "Carter",
  "Camila",
  "Anthony",
  "Penelope",
  "Wyatt",
  "Riley",
  "John",
  "Layla",
  "Luke",
  "Nora",
  "Jayden",
  "Zoey",
  "Nathan",
  "Hazel",
  "Caleb",
  "Lily",
  "Ryan",
  "Eleanor",
  "Logan",
  "Addison",
  "Oliver",
  "Aubrey",
  "Jack",
  "Ellie",
  "Grayson",
  "Stella",
  "Gabriel",
  "Natalie",
  "Isaac",
  "Zoe",
  "Julian",
  "Leah",
  "Levi",
  "Audrey",
  "Lincoln",
  "Ariana",
  "Jaxon",
  "Allison",
  // International names for diversity
  "Kai",
  "Zara",
  "Leo",
  "Luna",
  "Felix",
  "Maya",
  "Diego",
  "Priya",
  "Hassan",
  "Fatima",
  "Hiroshi",
  "Aaliyah",
  "Alessandro",
  "Ingrid",
  "Jin",
  "Leila",
  "Omar",
  "Amara",
  "Viktor",
  "Sakura",
  "Mateo",
  "Aisha",
  "Nikolai",
  "Yuki",
  "Rafael",
  "Zoya",
  "Ahmed",
  "Anaya",
  "Elias",
  "Kaia",
  "Dante",
  "Nia",
  "Marcus",
  "Jade",
  "Adrian",
  "Ivy",
  "Ezra",
  "Ruby",
  "Theodore",
  "Violet",
  "Miles",
  "Savannah",
  "Asher",
  "Skylar",
  "Declan",
  "Genesis",
  "Silas",
  "Autumn",
  "Harrison",
  "Quinn",
  "Maverick",
  "Kinsley",
  "Ryder",
  "Paisley",
];

const lastNames = [
  // Mix of common surnames from different backgrounds
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  // International surnames
  "Chen",
  "Kumar",
  "Singh",
  "Kim",
  "Patel",
  "Ahmed",
  "O'Connor",
  "Mueller",
  "Nakamura",
  "Silva",
  "Rossi",
  "Johansson",
  "Petrov",
  "Andersson",
  "Nielsen",
  "Hassan",
  "Ali",
  "Wang",
  "Zhang",
  "Liu",
  "Yamamoto",
  "Tanaka",
  "Suzuki",
  "Watanabe",
  "Sato",
  "Fernandez",
  "Morales",
  "Mendoza",
  "Guerrero",
  "Herrera",
  "Santos",
  "Costa",
  "Ferrari",
  "Russo",
  "Romano",
  "Bianchi",
  "Larsson",
  "Olsson",
  "Berg",
  "Lindqvist",
  "Eriksson",
  "Joshi",
  "Sharma",
  "Gupta",
  "Reddy",
  "Iyer",
  "Khan",
  "Rahman",
  "Chowdhury",
  "Noor",
  "Okonkwo",
  "Adebayo",
  "Mensah",
  "Asante",
];

const nicknames = [
  "Alex",
  "Sam",
  "Charlie",
  "Casey",
  "Jordan",
  "Taylor",
  "Morgan",
  "Riley",
  "Avery",
  "Quinn",
  "Drew",
  "Blake",
  "Cameron",
  "Sage",
  "River",
  "Rowan",
  "Skylar",
  "Emery",
  "Finley",
  "Reese",
  "Kai",
  "Max",
  "Eli",
  "Zoe",
  "Leo",
  "Mia",
  "Ace",
  "Bay",
  "Fox",
  "Neo",
  // Traditional nicknames
  "Mike",
  "Dave",
  "Matt",
  "Chris",
  "Nick",
  "Rob",
  "Tom",
  "Dan",
  "Ben",
  "Will",
  "Jake",
  "Luke",
  "Josh",
  "Ryan",
  "Tyler",
  "Kyle",
  "Sean",
  "Brad",
  "Chad",
  "Greg",
  // Female nicknames
  "Jess",
  "Jen",
  "Kate",
  "Liz",
  "Amy",
  "Anna",
  "Emma",
  "Sara",
  "Rachel",
  "Hannah",
  "Grace",
  "Hope",
  "Faith",
  "Joy",
  "Rose",
  "Lily",
  "Ivy",
  // Creative/modern nicknames
  "Ash",
  "Brook",
  "Clay",
  "Dash",
  "Echo",
  "Finn",
  "Gray",
  "Hunter",
  "Iris",
  "Jazz",
  "Knox",
  "Lane",
  "Mars",
  "Nova",
  "Onyx",
  "Pace",
  "Quest",
  "Rain",
  "Storm",
  "True",
  "Vale",
  "West",
  "Zara",
  // Short/simple nicknames
  "AJ",
  "BJ",
  "CJ",
  "DJ",
  "JJ",
  "KJ",
  "MJ",
  "PJ",
  "RJ",
  "TJ",
  "Zo",
  "Bo",
  "Jo",
  "Mo",
  "Ro",
  "Vi",
  "Lu",
  "Ez",
  "Iz",
  "Az",
];

const itemList = [
  // Common school technology
  { name: "MacBook Air", weight: 0.8 },
  { name: "MacBook Pro", weight: 0.6 },
  { name: "iPad", weight: 0.9 },
  { name: "Chromebook", weight: 0.7 },
  { name: "Windows Laptop", weight: 0.5 },

  // Chargers and cables (very commonly borrowed)
  { name: "MacBook Charger", weight: 1.5 },
  { name: "iPad Charger", weight: 1.8 },
  { name: "USB-C Cable", weight: 2.0 },
  { name: "Lightning Cable", weight: 2.2 },
  { name: "USB-C Charger", weight: 1.6 },
  { name: "Power Bank", weight: 1.0 },

  // Audio/Video equipment
  { name: "Wireless Microphone", weight: 0.4 },
  { name: "Camera", weight: 0.3 },
  { name: "Video Camera", weight: 0.2 },
  { name: "Tripod", weight: 0.3 },
  { name: "HDMI Cable", weight: 0.8 },
  { name: "Extension Cord", weight: 0.6 },

  // Lab and classroom equipment
  { name: "Calculator", weight: 1.2 },
  { name: "Microscope", weight: 0.1 },
  { name: "Projector Remote", weight: 1.5 },
  { name: "Laser Pointer", weight: 0.9 },

  // Sports equipment
  { name: "Basketball", weight: 0.5 },
  { name: "Soccer Ball", weight: 0.4 },
  { name: "Tennis Racket", weight: 0.3 },
  { name: "Volleyball", weight: 0.4 },

  // Art supplies
  { name: "Art Kit", weight: 0.6 },
  { name: "Easel", weight: 0.2 },

  // Musical instruments
  { name: "Guitar", weight: 0.1 },
  { name: "Keyboard", weight: 0.2 },
  { name: "Music Stand", weight: 0.3 },
];

// Realistic item descriptions based on item type (keeping them short)
const getItemDescription = (itemName: string): string | undefined => {
  const descriptions: { [key: string]: string[] } = {
    "MacBook Air": [
      "13-inch MacBook Air with M1 chip",
      "Lightweight laptop for students",
      "Apple MacBook Air for coding",
    ],
    "MacBook Pro": [
      "16-inch MacBook Pro with M1 Pro",
      "High-performance laptop",
      "Professional MacBook Pro",
    ],
    iPad: [
      "iPad with Apple Pencil support",
      "10.9-inch iPad for projects",
      "Tablet with educational apps",
    ],
    Chromebook: [
      "Google Chromebook for assignments",
      "Lightweight Chrome OS laptop",
      "Student Chromebook",
    ],
    Calculator: ["TI-84 Plus graphing calculator", "Scientific calculator", "Graphing calculator"],
    Camera: ["Digital SLR camera", "High-resolution camera", "Professional camera"],
    Microscope: ["Digital microscope for labs", "High-powered microscope", "Student microscope"],
    Guitar: ["Acoustic guitar for music class", "Classical guitar", "Student guitar with case"],
  };

  const itemDescriptions = descriptions[itemName];
  if (itemDescriptions && Math.random() > 0.3) {
    // 70% chance of having a description
    return itemDescriptions[Math.floor(Math.random() * itemDescriptions.length)];
  }
  return undefined;
};

// Realistic notes that might be found on school equipment (kept short)
const getItemNotes = (itemName: string): string | undefined => {
  const commonNotes = [
    "Return to IT office by end of day",
    "Student responsible for damages",
    "Charger included in loan",
    "Handle with care",
    "Report issues to staff",
    "Classroom use only",
    "Return clean",
    "Check accessories before return",
  ];

  const specificNotes: { [key: string]: string[] } = {
    "MacBook Air": [
      "Password: student123",
      "Adobe Creative Suite installed",
      "Battery: ~8 hours",
      "No unauthorized software",
    ],
    iPad: [
      "Apple Pencil in case",
      "Screen protector applied",
      "Educational apps installed",
      "Ask teacher for code",
    ],
    Camera: [
      "Memory card included",
      "Charge battery nightly",
      "Replace lens cap",
      "Handle strap carefully",
    ],
    Calculator: [
      "AP Calculus programs loaded",
      "Batteries recently replaced",
      "Programs cleared",
      "See manual for graphs",
    ],
  };

  if (Math.random() > 0.4) {
    // 60% chance of having notes
    const itemSpecificNotes = specificNotes[itemName];
    const allNotes = itemSpecificNotes ? [...commonNotes, ...itemSpecificNotes] : commonNotes;
    return allNotes[Math.floor(Math.random() * allNotes.length)];
  }
  return undefined;
};

async function main() {
  // Realistic school-based tags with appropriate colors and priorities
  const schoolTags: TagFormType[] = [
    { name: "Science Lab", color: "#28a745", category: "Department", priority: 5, hidden: false },
    { name: "Art Class", color: "#fd7e14", category: "Department", priority: 4, hidden: false },
    {
      name: "Music Department",
      color: "#6f42c1",
      category: "Department",
      priority: 3,
      hidden: false,
    },
    { name: "Mathematics", color: "#007bff", category: "Department", priority: 6, hidden: false },
    { name: "English", color: "#20c997", category: "Department", priority: 4, hidden: false },
    { name: "History", color: "#6c757d", category: "Department", priority: 2, hidden: false },
    {
      name: "Physical Education",
      color: "#dc3545",
      category: "Department",
      priority: 1,
      hidden: false,
    },
    {
      name: "Technology Lab",
      color: "#17a2b8",
      category: "Department",
      priority: 8,
      hidden: false,
    },

    { name: "High Priority", color: "#dc3545", category: "Priority", priority: 10, hidden: false },
    { name: "Fragile", color: "#ffc107", category: "Condition", priority: 7, hidden: false },
    { name: "New Equipment", color: "#28a745", category: "Status", priority: 3, hidden: false },
    { name: "Needs Repair", color: "#fd7e14", category: "Condition", priority: 8, hidden: false },
    { name: "Student Projects", color: "#6f42c1", category: "Usage", priority: 2, hidden: false },
    { name: "Teacher Use Only", color: "#495057", category: "Access", priority: 9, hidden: false },
    { name: "Overnight Loan", color: "#17a2b8", category: "Duration", priority: 4, hidden: false },
    { name: "Exam Period", color: "#e83e8c", category: "Special", priority: 7, hidden: false },
    { name: "Library", color: "#795548", category: "Location", priority: 1, hidden: false },
    { name: "Gymnasium", color: "#ff5722", category: "Location", priority: 1, hidden: false },
    { name: "Auditorium", color: "#9c27b0", category: "Location", priority: 2, hidden: false },
    { name: "Multimedia", color: "#ff9800", category: "Type", priority: 5, hidden: false },
  ];

  const tags: TagData[] = [];

  // Create or get existing tags
  for (let i = 0; i < schoolTags.length; i++) {
    try {
      const tagData = schoolTags[i];
      // First, try to find existing tag
      const existingTag = await prisma.tag.findFirst({
        where: {
          name: tagData.name,
          category: tagData.category,
        },
      });

      if (existingTag) {
        tags.push({
          id: existingTag.id,
          name: existingTag.name,
          color: existingTag.color,
          category: existingTag.category,
          hidden: existingTag.hidden,
          priority: existingTag.priority,
        });
      } else {
        // Tag doesn't exist, create it using server function
        const result = await createTag(tagData);
        if (result.tag) {
          tags.push(result.tag);
        } else {
          console.error(`Failed to create tag ${tagData.name}:`, result.error);
        }
      }
    } catch (error) {
      console.error(`Error handling tag ${schoolTags[i].name}:`, error);
    }
  }

  // Create or get existing roles
  const roles: PersonRoleData[] = [];

  for (const roleData of DEFAULT_ROLES) {
    try {
      // First, try to find existing role
      const existingRole = await prisma.personRole.findUnique({
        where: { name: roleData.name },
      });

      if (existingRole) {
        roles.push({
          id: existingRole.id,
          name: existingRole.name,
          description: existingRole.description,
          color: existingRole.color,
        });
      } else {
        // Role doesn't exist, create it
        const result = await createPersonRole(roleData);
        if (result.data) {
          roles.push(result.data);
        } else {
          console.error(`Failed to create role ${roleData.name}:`, result.error);
        }
      }
    } catch (error) {
      console.error(`Error handling role ${roleData.name}:`, error);
    }
  }

  // Create people with realistic grade distribution
  let people: PersonData[] = [];
  const totalPeopleToCreate = 250; // Increased for more realistic school size

  for (let i = 0; i < totalPeopleToCreate; i++) {
    // Weight distribution towards middle grades (more realistic)
    let selectedRole;
    const rand = Math.random();

    if (rand < 0.05) {
      // 5% staff
      selectedRole = roles.find((r) => r.name === "Staff") || roles[randomInt(roles.length)];
    } else if (rand < 0.08) {
      // 3% alumni
      selectedRole = roles.find((r) => r.name === "Alumni") || roles[randomInt(roles.length)];
    } else {
      // 92% students - weighted towards middle grades
      const studentRoles = roles.filter((r) => r.name.includes("Grade"));
      if (studentRoles.length > 0) {
        const gradeWeights = [0.08, 0.1, 0.12, 0.15, 0.16, 0.15, 0.12, 0.08, 0.04]; // Realistic school distribution
        let cumulative = 0;
        const target = Math.random();

        for (let j = 0; j < Math.min(gradeWeights.length, studentRoles.length); j++) {
          cumulative += gradeWeights[j];
          if (target <= cumulative) {
            selectedRole = studentRoles[j];
            break;
          }
        }

        if (!selectedRole) {
          selectedRole = studentRoles[randomInt(studentRoles.length)];
        }
      } else {
        selectedRole = roles[randomInt(roles.length)];
      }
    }

    // Assign fewer tags to people (more realistic)
    const numTags = Math.random() < 0.7 ? 0 : randomInt(1, 3); // 70% no tags, others 1-2 tags

    const person: PersonFormType = {
      firstName: firstNames[randomInt(firstNames.length)],
      lastName: lastNames[randomInt(lastNames.length)],
      nickname: Math.random() < 0.3 ? nicknames[randomInt(nicknames.length)] : undefined, // 30% have nicknames
      role: { id: selectedRole.id },
      tags: Array(numTags)
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

  // Create or get existing item types
  const itemTypes = [];
  for (const item of itemList) {
    try {
      // First, try to find existing item type
      const existingType = await prisma.itemType.findUnique({
        where: { name: item.name },
      });

      if (existingType) {
        itemTypes.push(existingType);
      } else {
        // Type doesn't exist, create it
        const result = await createItemType({ name: item.name });
        if (result.data) {
          itemTypes.push(result.data);
        } else {
          console.error(`Failed to create item type ${item.name}:`, result.error);
        }
      }
    } catch (error) {
      console.error(`Error handling item type ${item.name}:`, error);
    }
  }

  // Create realistic school locations
  const schoolLocations = [
    { name: "IT Help Desk", description: "Main technology support center" },
    { name: "Library", description: "School library and media center" },
    { name: "Science Lab Storage", description: "Equipment storage for science department" },
    { name: "Art Room", description: "Art supplies and equipment storage" },
    { name: "Music Room", description: "Musical instruments and audio equipment" },
    { name: "Gymnasium Storage", description: "Sports equipment storage" },
    { name: "Main Office", description: "Administrative equipment storage" },
  ];

  const locations: any[] = [];
  for (const locationData of schoolLocations) {
    try {
      // First, try to find existing location
      const existingLocation = await prisma.location.findUnique({
        where: { name: locationData.name },
      });

      if (existingLocation) {
        locations.push(existingLocation);
      } else {
        // Location doesn't exist, create it
        const result = await createItemLocation({
          name: locationData.name,
        });
        if (result.data) {
          locations.push(result.data);
        } else {
          console.error(`Failed to create location ${locationData.name}:`, result.error);
        }
      }
    } catch (error) {
      console.error(`Error handling location ${locationData.name}:`, error);
    }
  }

  let items: ItemData[] = [];

  // Helper function to assign appropriate location based on item type
  const getItemLocation = (itemName: string) => {
    if (
      itemName.includes("MacBook") ||
      itemName.includes("iPad") ||
      itemName.includes("Chromebook") ||
      itemName.includes("Charger") ||
      itemName.includes("Cable")
    ) {
      return locations.find((loc) => loc.name === "IT Help Desk") || locations[0];
    } else if (itemName.includes("Microscope") || itemName.includes("Calculator")) {
      return locations.find((loc) => loc.name === "Science Lab Storage") || locations[0];
    } else if (itemName.includes("Guitar") || itemName.includes("Keyboard")) {
      return locations.find((loc) => loc.name === "Music Room") || locations[0];
    } else if (
      itemName.includes("Basketball") ||
      itemName.includes("Soccer") ||
      itemName.includes("Tennis") ||
      itemName.includes("Volleyball")
    ) {
      return locations.find((loc) => loc.name === "Gymnasium Storage") || locations[0];
    } else if (itemName.includes("Art") || itemName.includes("Easel")) {
      return locations.find((loc) => loc.name === "Art Room") || locations[0];
    } else if (itemName.includes("Camera") || itemName.includes("Projector")) {
      return locations.find((loc) => loc.name === "Library") || locations[0];
    }
    return locations[0]; // Default to first location
  };

  // Only create items if we have types and locations
  if (itemTypes.length > 0 && locations.length > 0) {
    for (let i = 0; i < 75; i++) {
      // Increased from 50 for more variety
      try {
        const type = itemTypes[randomInt(itemTypes.length)];
        const baseName = `${type.name}`;
        let name = `${baseName} ${String(i + 1).padStart(3, "0")}`; // Better numbering with padding
        let attemptNumber = i + 1;

        // Check if item with this name already exists
        while (await prisma.item.findUnique({ where: { name } })) {
          attemptNumber += 100; // Increment by 100 to avoid conflicts
          name = `${baseName} ${String(attemptNumber).padStart(3, "0")}`;
        }

        const location = getItemLocation(type.name);
        const description = getItemDescription(type.name);
        const notes = getItemNotes(type.name);
        const result = await createItem({
          name,
          type,
          description,
          location,
          notes,
          tags: Array(randomInt(0, 3)) // Reduced max tags for realism
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
  } else {
    console.log("Skipping item creation - missing item types or locations");
  }

  console.log("Creating realistic loan patterns with day-by-day generation");

  // Define item bundles that are commonly loaned together (keeping existing function)
  const getRelatedItems = (primaryItem: ItemData, allItems: ItemData[]) => {
    const relatedItems: ItemData[] = [primaryItem];

    if (primaryItem.name.includes("MacBook")) {
      // MacBooks often go with chargers
      const charger = allItems.find(
        (item) => item.name.includes("MacBook Charger") && item.id !== primaryItem.id
      );
      if (charger && Math.random() < 0.7) {
        // 70% chance of including charger
        relatedItems.push(charger);
      }

      // Sometimes with cables too
      const cable = allItems.find(
        (item) => item.name.includes("USB-C Cable") && item.id !== primaryItem.id
      );
      if (cable && Math.random() < 0.3) {
        // 30% chance of cable
        relatedItems.push(cable);
      }
    } else if (primaryItem.name.includes("iPad")) {
      // iPads often go with chargers
      const charger = allItems.find(
        (item) => item.name.includes("iPad Charger") && item.id !== primaryItem.id
      );
      if (charger && Math.random() < 0.6) {
        // 60% chance of charger
        relatedItems.push(charger);
      }
    } else if (primaryItem.name.includes("Camera")) {
      // Cameras might go with tripods or memory cards
      const tripod = allItems.find(
        (item) => item.name.includes("Tripod") && item.id !== primaryItem.id
      );
      if (tripod && Math.random() < 0.4) {
        // 40% chance of tripod
        relatedItems.push(tripod);
      }
    } else if (primaryItem.name.includes("Guitar")) {
      // Guitars might go with music stands
      const stand = allItems.find(
        (item) => item.name.includes("Music Stand") && item.id !== primaryItem.id
      );
      if (stand && Math.random() < 0.5) {
        // 50% chance of stand
        relatedItems.push(stand);
      }
    }

    // Sometimes add random accessories (cables, power banks)
    if (Math.random() < 0.2) {
      // 20% chance of random accessory
      const accessories = allItems.filter(
        (item) =>
          (item.name.includes("Cable") || item.name.includes("Power Bank")) &&
          !relatedItems.some((related) => related.id === item.id)
      );
      if (accessories.length > 0) {
        relatedItems.push(accessories[randomInt(accessories.length)]);
      }
    }

    return relatedItems;
  };

  // Apply status when returning items (low chance of problems)
  const getReturnStatus = (itemName: string) => {
    const rand = Math.random();

    // Very low chance of problems on return
    // Chargers/cables more likely to have issues
    if (itemName.includes("Charger") || itemName.includes("Cable")) {
      if (rand < 0.02) return "lost"; // 2% chance
      if (rand < 0.04) return "damaged"; // 2% chance
      if (rand < 0.05) return "unknown"; // 1% chance
    } else if (itemName.includes("MacBook") || itemName.includes("iPad")) {
      // Expensive items handled more carefully
      if (rand < 0.005) return "lost"; // 0.5% chance
      if (rand < 0.015) return "damaged"; // 1% chance
      if (rand < 0.02) return "unknown"; // 0.5% chance
    } else if (itemName.includes("Ball") || itemName.includes("Racket")) {
      // Sports equipment gets damaged more
      if (rand < 0.01) return "lost"; // 1% chance
      if (rand < 0.05) return "damaged"; // 4% chance
      if (rand < 0.06) return "unknown"; // 1% chance
    } else {
      // Default items
      if (rand < 0.01) return "lost"; // 1% chance
      if (rand < 0.025) return "damaged"; // 1.5% chance
      if (rand < 0.03) return "unknown"; // 0.5% chance
    }

    return "returned"; // Default status
  };

  // Generate realistic loan descriptions (optional - 60% chance)
  const getLoanDescription = (items: ItemData[], person: PersonData): string | undefined => {
    if (Math.random() > 0.6) return undefined; // 40% chance of having description

    const purposes = [
      "For class project",
      "Science fair preparation",
      "Student presentation",
      "Homework assignment",
      "Research project",
      "Group work",
      "Digital art project",
      "Video production",
      "Online exam",
      "Study session",
      "Lab work",
      "Field trip preparation",
      "Music practice",
      "Sports event",
      "After-school program",
      "Tutoring session",
      "Guest speaker setup",
      "School event",
      "Photography assignment",
      "Coding project",
    ];

    const timeframes = [
      "until end of class",
      "for the weekend",
      "for one week",
      "until project due date",
      "for today only",
      "for the semester",
      "until further notice",
      "for two weeks",
      "for the month",
      "until exam period",
    ];

    // Create contextual descriptions based on item types
    const primaryItem = items[0];
    let description = "";

    if (primaryItem.name.includes("MacBook") || primaryItem.name.includes("Laptop")) {
      description =
        Math.random() < 0.5
          ? `${purposes[randomInt(purposes.length)]} - coding and research needed`
          : `Student presentation ${timeframes[randomInt(timeframes.length)]}`;
    } else if (primaryItem.name.includes("iPad")) {
      description =
        Math.random() < 0.5
          ? `Digital art project using Procreate`
          : `Interactive presentation ${timeframes[randomInt(timeframes.length)]}`;
    } else if (primaryItem.name.includes("Camera")) {
      description = `${
        purposes.filter((p) => p.includes("project") || p.includes("assignment"))[randomInt(3)]
      } - photography required`;
    } else if (primaryItem.name.includes("Calculator")) {
      description = `Math ${Math.random() < 0.5 ? "exam" : "homework"} ${
        timeframes[randomInt(timeframes.length)]
      }`;
    } else if (primaryItem.name.includes("Microscope")) {
      description = `Biology lab work - specimen analysis`;
    } else if (primaryItem.name.includes("Ball") || primaryItem.name.includes("Racket")) {
      description = `${Math.random() < 0.5 ? "PE class" : "After-school sports"} ${
        timeframes[randomInt(timeframes.length)]
      }`;
    } else if (primaryItem.name.includes("Guitar") || primaryItem.name.includes("Keyboard")) {
      description = `Music ${Math.random() < 0.5 ? "practice" : "performance"} preparation`;
    } else if (primaryItem.name.includes("Charger") || primaryItem.name.includes("Cable")) {
      description = `Device charging - ${
        Math.random() < 0.5 ? "student forgot charger" : "backup needed"
      }`;
    } else {
      description = `${purposes[randomInt(purposes.length)]} ${
        timeframes[randomInt(timeframes.length)]
      }`;
    }

    // Add multi-item context
    if (items.length > 1) {
      description += ` (${items.length} items total)`;
    }

    return description;
  };

  // Generate loans day by day, skipping weekends and summer months
  const generateDailyLoans = async () => {
    console.log("Starting day-by-day loan generation (skipping weekends and summer)");

    // Track currently loaned items and their loan info
    const currentlyLoaned = new Map<
      number,
      { loanId: number; dateLoaned: Date; person: PersonData }
    >();

    // Start from 2 years ago
    const startDate = dayjs().subtract(2, "year").startOf("day");
    const endDate = dayjs().startOf("day");

    let currentDate = startDate;
    let totalLoansCreated = 0;
    let totalItemsReturned = 0;

    while (currentDate.isBefore(endDate)) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = currentDate.day();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDate = currentDate.add(1, "day");
        continue;
      }

      // Skip summer months (June = 5, July = 6, August = 7)
      const month = currentDate.month();
      if (month === 5 || month === 6 || month === 7) {
        currentDate = currentDate.add(1, "day");
        continue;
      }

      console.log(`Processing ${currentDate.format("YYYY-MM-DD")} (${currentDate.format("dddd")})`);

      // Calculate dynamic return rate to maintain at least 10% outstanding loans
      // As we get closer to the end date, reduce return rate to keep items out
      const daysFromStart = currentDate.diff(startDate, "day");
      const totalDays = endDate.diff(startDate, "day");
      const progressRatio = daysFromStart / totalDays;

      // Target: at least 10% of loans should remain outstanding
      // Reduce return probability as we approach the end date
      let baseReturnRate = 0.4; // Start with 40% return rate

      // In the last 25% of the time period, significantly reduce returns to keep items out
      if (progressRatio > 0.75) {
        baseReturnRate = 0.15; // Only 15% return rate in final quarter
      } else if (progressRatio > 0.5) {
        baseReturnRate = 0.25; // 25% return rate in third quarter
      } else if (progressRatio > 0.25) {
        baseReturnRate = 0.35; // 35% return rate in second quarter
      }

      console.log(
        `  Progress: ${(progressRatio * 100).toFixed(1)}%, Return rate: ${(
          baseReturnRate * 100
        ).toFixed(0)}%`
      );

      // First, handle returns with dynamic rate
      const itemsToReturn = [];
      for (const [itemId, loanInfo] of currentlyLoaned.entries()) {
        if (Math.random() < baseReturnRate) {
          itemsToReturn.push({ itemId, loanInfo });
        }
      }

      // Process returns
      for (const { itemId, loanInfo } of itemsToReturn) {
        const item = items.find((i) => i.id === itemId);
        if (!item) continue;

        const returnStatus = getReturnStatus(item.name);
        const returnedBy =
          Math.random() > 0.5 ? loanInfo.person.id : people[randomInt(people.length)].id;

        await prisma.loanedItem.update({
          where: {
            loanId_itemId: {
              loanId: loanInfo.loanId,
              itemId: itemId,
            },
          },
          data: {
            status: returnStatus,
            updatedDate: currentDate.toDate(),
            dateReturned: currentDate.toDate(),
            returnedById: returnedBy,
          },
        });

        // Remove from currently loaned
        currentlyLoaned.delete(itemId);
        totalItemsReturned++;

        console.log(`  Returned: ${item.name} with status ${returnStatus}`);
      }

      // Then, create new loans (1-8 loans per day, weighted towards fewer loans)
      const maxLoansToday =
        Math.random() < 0.3
          ? 0 // 30% chance of no loans
          : Math.random() < 0.6
          ? randomInt(1, 3) // 30% chance of 1-2 loans
          : Math.random() < 0.9
          ? randomInt(2, 5) // 30% chance of 2-4 loans
          : randomInt(4, 9); // 10% chance of 4-8 loans

      let loansCreatedToday = 0;
      for (let loanIndex = 0; loanIndex < maxLoansToday; loanIndex++) {
        try {
          const randomPerson = people[randomInt(people.length)];

          // Get available items (not currently loaned out)
          const availableItems = items.filter((item) => !currentlyLoaned.has(item.id));
          if (availableItems.length === 0) {
            console.log("  No available items for new loans");
            break;
          }

          // Pick primary item
          const primaryItem = availableItems[randomInt(availableItems.length)];
          const loanItems = [primaryItem];

          // Get related items, but only if they're available
          const relatedItems = getRelatedItems(primaryItem, availableItems).filter(
            (item) => item.id !== primaryItem.id && !currentlyLoaned.has(item.id)
          );

          // Add related items, ensuring no duplicates and they're available
          for (const relatedItem of relatedItems) {
            if (
              !loanItems.some((existing) => existing.id === relatedItem.id) &&
              !currentlyLoaned.has(relatedItem.id)
            ) {
              loanItems.push(relatedItem);
            }
          }

          // Create the loan
          const loanDescription = getLoanDescription(loanItems, randomPerson);

          const createdLoan = await prisma.loan.create({
            data: {
              createdDate: currentDate.toDate(),
              updatedDate: currentDate.toDate(),
              notes: loanDescription || "",
              person: {
                connect: { id: randomPerson.id },
              },
              tags: {
                connect: Array(randomInt(0, 3))
                  .fill(0)
                  .map(() => ({ id: tags[randomInt(tags.length)].id })),
              },
            },
          });

          // Before creating new loans, ensure no conflicting statuses
          // Set any previous non-returned loans of these items to "returned"
          for (const item of loanItems) {
            await prisma.loanedItem.updateMany({
              where: {
                itemId: item.id,
                status: {
                  in: ["out", "lost", "damaged", "unknown"],
                },
              },
              data: {
                status: "returned",
                updatedDate: currentDate.toDate(),
                dateReturned: currentDate.toDate(),
              },
            });
          }

          // Create loaned items (all start as "out")
          for (const item of loanItems) {
            await prisma.loanedItem.create({
              data: {
                loanId: createdLoan.id,
                itemId: item.id,
                status: "out",
                createdDate: currentDate.toDate(),
                updatedDate: currentDate.toDate(),
                dateLoaned: currentDate.toDate(),
                dateReturned: null,
                returnedById: null,
              },
            });

            // Add to currently loaned tracking
            currentlyLoaned.set(item.id, {
              loanId: createdLoan.id,
              dateLoaned: currentDate.toDate(),
              person: randomPerson,
            });
          }

          totalLoansCreated++;
          loansCreatedToday++;
          console.log(
            `  Created loan ${createdLoan.id} with ${loanItems.length} items: ${loanItems
              .map((i) => i.name)
              .join(", ")}`
          );
        } catch (error: any) {
          console.error(`  Error creating loan: ${error.message}`);
        }
      }

      console.log(
        `  Day summary: ${itemsToReturn.length} returns, ${loansCreatedToday} new loans, ${currentlyLoaned.size} items currently out`
      );

      // Move to next day
      currentDate = currentDate.add(1, "day");
    }

    console.log(`\nLoan generation complete:`);
    console.log(`Total loans created: ${totalLoansCreated}`);
    console.log(`Total items returned: ${totalItemsReturned}`);
    console.log(`Items still out: ${currentlyLoaned.size}`);

    // Calculate outstanding percentage
    const outstandingPercentage =
      totalLoansCreated > 0 ? (currentlyLoaned.size / totalLoansCreated) * 100 : 0;
    console.log(
      `Outstanding rate: ${outstandingPercentage.toFixed(1)}% (${
        currentlyLoaned.size
      }/${totalLoansCreated})`
    );

    if (outstandingPercentage >= 10.0) {
      console.log("At least 10% outstanding loans achieved!");
    } else {
      console.log(`${outstandingPercentage.toFixed(1)}% outstanding loans generated`);
    }

    // Update item creation dates based on first loan
    console.log("Updating item creation dates based on first loans...");
    const itemsWithLoans = await prisma.item.findMany({
      where: {
        loans: { some: {} },
      },
      include: {
        loans: {
          orderBy: { dateLoaned: "asc" },
          take: 1,
        },
      },
    });

    for (const item of itemsWithLoans) {
      if (item.loans.length > 0) {
        await prisma.item.update({
          where: { id: item.id },
          data: { createdDate: item.loans[0].dateLoaned },
        });
      }
    }

    console.log(`Updated creation dates for ${itemsWithLoans.length} items`);
  };

  await generateDailyLoans();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed successfully!");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
