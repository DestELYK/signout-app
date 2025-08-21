/**
 * Migration Server Operations
 *
 * Server-side functions for student grade migration operations including
 * grade promotion and Alumni transition with audit trail logging.
 *
 * Features:
 * - Grade migration with Alumni promotion
 * - Migration preview and validation
 * - Transaction-safe operations
 * - Audit trail logging
 * - Migration reversion capabilities
 *
 * @module MigrationServer
 */

import { prisma } from "./prisma.server";

/**
 * Preview data for grade migration
 */
export interface MigrationPreview {
  students: {
    id: string;
    firstName: string;
    lastName: string;
    currentGrade: number;
    currentRoleName: string;
    newGrade: number | "Alumni";
    newRoleName: string;
  }[];
  totalStudents: number;
  movingToAlumni: number;
  promoting: number;
}

/**
 * Result of migration execution
 */
export interface MigrationResult {
  success: boolean;
  studentsProcessed: number;
  movedToAlumni: number;
  promoted: number;
  errors: string[];
  migrationId?: number;
}

/**
 * Migration record from database
 */
export interface MigrationRecord {
  id: number;
  type: string;
  status: string;
  changes: string;
  studentsAffected: number;
  movedToAlumni: number;
  promoted: number;
  academicYear: string | null;
  notes: string | null;
  createdDate: Date;
  updatedDate: Date;
}

/**
 * Generate a preview of what the grade migration will do
 * Shows which students will be promoted and which will become Alumni
 */
export async function generateMigrationPreview(): Promise<MigrationPreview> {
  try {
    // Get all roles for mapping
    const roles = await prisma.personRole.findMany();
    const roleMap = new Map(roles.map((role) => [role.id, role.name]));
    const reverseRoleMap = new Map(roles.map((role) => [role.name, role.id]));

    // Get Alumni role ID
    const alumniRole = roles.find((role) => role.name === "Alumni");
    if (!alumniRole) {
      throw new Error("Alumni role not found. Please run the migration first.");
    }

    // Get all students (exclude Staff)
    const students = await prisma.person.findMany({
      include: {
        role: true,
      },
      where: {
        role: {
          name: {
            not: "Staff",
          },
        },
      },
    });

    const preview: MigrationPreview = {
      students: [],
      totalStudents: 0,
      movingToAlumni: 0,
      promoting: 0,
    };

    for (const student of students) {
      const currentRoleName = student.role.name;

      // Skip if already Alumni
      if (currentRoleName === "Alumni") {
        continue;
      }

      let newGrade: number | "Alumni";
      let newRoleName: string;

      // Check if this is a grade-based role
      const gradeMatch = currentRoleName.match(/^Grade (\d+)$/);

      if (gradeMatch) {
        const currentGrade = parseInt(gradeMatch[1]);

        if (currentGrade === 12) {
          // Grade 12 → Alumni
          newGrade = "Alumni";
          newRoleName = "Alumni";
          preview.movingToAlumni++;
        } else {
          const nextGrade = currentGrade + 1;
          newGrade = nextGrade;
          newRoleName = `Grade ${nextGrade}`;
          preview.promoting++;
        }

        preview.students.push({
          id: student.id.toString(),
          firstName: student.firstName,
          lastName: student.lastName,
          currentGrade: currentGrade,
          currentRoleName,
          newGrade,
          newRoleName,
        });

        preview.totalStudents++;
      }
    }

    return preview;
  } catch (error) {
    console.error("Error generating migration preview:", error);
    throw new Error("Failed to generate migration preview");
  }
}

/**
 * Get the last migration record from the database
 */
export async function getLastMigration(): Promise<MigrationRecord | null> {
  try {
    const migration = await prisma.migration.findFirst({
      orderBy: {
        createdDate: "desc",
      },
    });

    return migration;
  } catch (error) {
    console.error("Error fetching last migration:", error);
    return null;
  }
}

/**
 * Check if a migration can be performed (must be at least 10 months since last migration)
 */
export async function canPerformMigration(): Promise<{
  canMigrate: boolean;
  lastMigration?: MigrationRecord;
  daysSinceLastMigration?: number;
  requiredWaitMonths: number;
}> {
  try {
    const lastMigration = await getLastMigration();

    if (!lastMigration || lastMigration.status === "reverted") {
      return {
        canMigrate: true,
        requiredWaitMonths: 10,
      };
    }

    const now = new Date();
    const lastMigrationDate = new Date(lastMigration.createdDate);
    const daysSinceLastMigration = Math.floor(
      (now.getTime() - lastMigrationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const monthsSinceLastMigration = daysSinceLastMigration / 30.44; // Average days per month

    return {
      canMigrate: monthsSinceLastMigration >= 10,
      lastMigration,
      daysSinceLastMigration,
      requiredWaitMonths: 10,
    };
  } catch (error) {
    console.error("Error checking migration eligibility:", error);
    return {
      canMigrate: false,
      requiredWaitMonths: 10,
    };
  }
}

/**
 * Record a migration in the database
 */
async function recordMigration(
  changes: any,
  studentsAffected: number,
  movedToAlumni: number,
  promoted: number,
  academicYear?: string
): Promise<number> {
  try {
    const migration = await prisma.migration.create({
      data: {
        type: "grade_promotion",
        status: "completed",
        changes: typeof changes === "string" ? changes : JSON.stringify(changes),
        studentsAffected,
        movedToAlumni,
        promoted,
        academicYear,
        notes: `Grade migration: ${promoted} students promoted, ${movedToAlumni} moved to Alumni`,
      },
    });

    return migration.id;
  } catch (error) {
    console.error("Error recording migration:", error);
    throw error;
  }
}

/**
 * Revert the last migration by restoring student roles
 */
export async function revertLastMigration(): Promise<{
  success: boolean;
  studentsReverted: number;
  errors: string[];
  migrationId?: number;
}> {
  const result = {
    success: false,
    studentsReverted: 0,
    errors: [] as string[],
    migrationId: undefined as number | undefined,
  };

  try {
    const lastMigration = await getLastMigration();

    if (!lastMigration) {
      result.errors.push("No migration found to revert");
      return result;
    }

    if (lastMigration.status === "reverted") {
      result.errors.push("Last migration has already been reverted");
      return result;
    }

    // Use transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      const changes = lastMigration.changes as any;

      // Validate migration data structure
      if (!changes) {
        throw new Error("Migration data is missing or corrupted - cannot revert");
      }

      // Handle different possible migration data formats
      let studentChanges: any[] = [];

      if (typeof changes === "string") {
        try {
          const parsedChanges = JSON.parse(changes);
          studentChanges = parsedChanges.studentChanges || [];
        } catch (parseError) {
          throw new Error("Migration data is corrupted (invalid JSON) - cannot revert");
        }
      } else if (changes.studentChanges && Array.isArray(changes.studentChanges)) {
        studentChanges = changes.studentChanges;
      } else {
        throw new Error(
          "Migration data format is invalid (missing studentChanges array) - cannot revert"
        );
      }

      if (studentChanges.length === 0) {
        throw new Error("No student changes found in migration data - nothing to revert");
      }

      // Get all roles for mapping
      const roles = await tx.personRole.findMany();
      const roleMap = new Map(roles.map((role) => [role.name, role.id]));

      // Revert each student's role
      for (const change of studentChanges) {
        // Validate each change record
        if (!change || !change.studentId || !change.originalRole) {
          result.errors.push("Invalid change record found - skipping");
          continue;
        }

        const originalRoleId = roleMap.get(change.originalRole);

        if (!originalRoleId) {
          result.errors.push(
            `Original role "${change.originalRole}" not found for student ID ${change.studentId}`
          );
          continue;
        }

        await tx.person.update({
          where: { id: change.studentId },
          data: { roleId: originalRoleId },
        });

        result.studentsReverted++;
      }

      // Mark the migration as reverted
      await tx.migration.update({
        where: { id: lastMigration.id },
        data: {
          status: "reverted",
          notes: `${lastMigration.notes || ""} - REVERTED on ${new Date().toISOString()}`,
        },
      });

      result.migrationId = lastMigration.id;
    });

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    console.error("Error reverting migration:", error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error occurred");
    return result;
  }
}

/**
 * Execute the grade migration
 * Promotes all students to next grade and moves Grade 12 to Alumni
 */
export async function executeMigration(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    studentsProcessed: 0,
    movedToAlumni: 0,
    promoted: 0,
    errors: [],
  };

  try {
    // Track changes for potential reversion
    const studentChanges: any[] = [];

    // Use transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Get all roles
      const roles = await tx.personRole.findMany();
      const roleMap = new Map(roles.map((role) => [role.name, role.id]));

      // Ensure Alumni role exists
      const alumniRoleId = roleMap.get("Alumni");
      if (!alumniRoleId) {
        throw new Error("Alumni role not found");
      }

      // Get all students (exclude Staff and Alumni)
      const students = await tx.person.findMany({
        include: {
          role: true,
        },
        where: {
          role: {
            name: {
              notIn: ["Staff", "Alumni"],
            },
          },
        },
      });

      for (const student of students) {
        const currentRoleName = student.role.name;
        const gradeMatch = currentRoleName.match(/^Grade (\d+)$/);

        if (!gradeMatch) {
          continue; // Skip non-grade roles
        }

        const currentGrade = parseInt(gradeMatch[1]);
        let newRoleId: number | null = null;
        let newRoleName: string = "";

        if (currentGrade === 12) {
          // Grade 12 → Alumni
          newRoleId = alumniRoleId;
          newRoleName = "Alumni";
          result.movedToAlumni++;
        } else {
          // All other grades → Next grade
          const nextGrade = currentGrade + 1;
          newRoleName = `Grade ${nextGrade}`;
          newRoleId = roleMap.get(newRoleName) || null;

          if (newRoleId) {
            result.promoted++;
          } else {
            result.errors.push(
              `Role "${newRoleName}" not found for student ${student.firstName} ${student.lastName}`
            );
            continue;
          }
        }

        if (newRoleId) {
          // Track the change for potential reversion
          studentChanges.push({
            studentId: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            originalRole: currentRoleName,
            newRole: newRoleName,
            originalRoleId: student.roleId,
            newRoleId: newRoleId,
          });

          await tx.person.update({
            where: { id: student.id },
            data: { roleId: newRoleId },
          });

          result.studentsProcessed++;
        }
      }

      // Record the migration if successful
      if (result.errors.length === 0 && studentChanges.length > 0) {
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;

        const migration = await tx.migration.create({
          data: {
            type: "grade_promotion",
            status: "completed",
            changes: JSON.stringify({
              studentChanges,
              executedAt: new Date().toISOString(),
              executedBy: "system", // TODO: Add user tracking
            }),
            studentsAffected: result.studentsProcessed,
            movedToAlumni: result.movedToAlumni,
            promoted: result.promoted,
            academicYear,
            notes: `Grade migration: ${result.promoted} students promoted, ${result.movedToAlumni} moved to Alumni`,
          },
        });

        result.migrationId = migration.id;
      }
    });

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    console.error("Error executing migration:", error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error occurred");
    return result;
  }
}
