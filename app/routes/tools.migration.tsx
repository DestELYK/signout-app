/**
 * Grade Migration Tools Route
 *
 * Handles automatic grade promotion for students at the end of the academic year.
 * Grade 12 students are moved to graduated status, while other students
 * are promoted to the next grade level.
 *
 * @module ToolsMigrationRoute
 */

import { json, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import MigrationTab from "~/components/tools/MigrationTab";
import {
  canPerformMigration,
  executeMigration,
  generateMigrationPreview,
  getLastMigration,
  revertLastMigration,
} from "~/lib/migration.server";

/**
 * Loader for migration tools
 */
export const loader: LoaderFunction = async ({ request }) => {
  // TODO: Add authentication/authorization checks

  try {
    // Execute queries in parallel for better performance
    const [migrationCheck, lastMigration] = await Promise.all([
      canPerformMigration(),
      getLastMigration(),
    ]);

    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    return json({
      canMigrate: migrationCheck.canMigrate,
      academicYear,
      lastMigration: lastMigration,
      daysSinceLastMigration: migrationCheck.daysSinceLastMigration,
      requiredWaitMonths: migrationCheck.requiredWaitMonths,
    });
  } catch (error) {
    console.error("Error loading migration data:", error);
    return json({
      canMigrate: false,
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      lastMigration: null,
      error: "Failed to load migration data",
    });
  }
};

/**
 * Action handler for migration operations
 */
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "preview":
      try {
        const preview = await generateMigrationPreview();
        return json({ success: true, preview });
      } catch (error) {
        console.error("Error generating migration preview:", error);
        return json(
          {
            error: error instanceof Error ? error.message : "Failed to generate preview",
          },
          { status: 500 }
        );
      }

    case "migrate":
      try {
        // Check if migration is allowed
        const migrationCheck = await canPerformMigration();
        if (!migrationCheck.canMigrate) {
          const daysRemaining =
            migrationCheck.requiredWaitMonths * 30.44 -
            (migrationCheck.daysSinceLastMigration || 0);
          return json(
            {
              error: `Cannot perform migration. Must wait ${Math.ceil(
                daysRemaining
              )} more days since last migration. Last migration was performed ${
                migrationCheck.daysSinceLastMigration
              } days ago.`,
            },
            { status: 400 }
          );
        }

        const result = await executeMigration();

        if (result.success) {
          return json({
            success: true,
            message: "Grade migration completed successfully",
            studentsProcessed: result.studentsProcessed,
            movedToAlumni: result.movedToAlumni,
            promoted: result.promoted,
            migrationId: result.migrationId,
          });
        } else {
          return json(
            {
              error: `Migration completed with errors: ${result.errors.join(", ")}`,
              studentsProcessed: result.studentsProcessed,
              movedToAlumni: result.movedToAlumni,
              promoted: result.promoted,
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error executing migration:", error);
        return json(
          {
            error: error instanceof Error ? error.message : "Migration failed",
          },
          { status: 500 }
        );
      }

    case "revert":
      try {
        const result = await revertLastMigration();

        if (result.success) {
          return json({
            success: true,
            message: "Migration successfully reverted",
            studentsReverted: result.studentsReverted,
            migrationId: result.migrationId,
          });
        } else {
          return json(
            {
              error: `Revert completed with errors: ${result.errors.join(", ")}`,
              studentsReverted: result.studentsReverted,
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error reverting migration:", error);
        return json(
          {
            error: error instanceof Error ? error.message : "Revert failed",
          },
          { status: 500 }
        );
      }

    default:
      return json({ error: "Unknown action" }, { status: 400 });
  }
};

/**
 * Grade migration tools component
 */
export default function ToolsMigrationRoute() {
  const loaderData = useLoaderData<typeof loader>();

  return <MigrationTab />;
}
