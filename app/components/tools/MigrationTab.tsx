/**
 * Migration Tab Component
 *
 * Handles automatic grade migration for students at the end of the academic year.
 * Grade 12 students are moved to Alumni status, while other students
 * are promoted to the next grade. Faculty and staff remain unchanged.
 *
 * Features:
 * - Preview migration changes before applying
 * - Grade 12 → Alumni status
 * - All grades → Next grade level
 * - Faculty/staff excluded from migration
 * - Confirmation dialog with detailed preview
 *
 * @module MigrationTab
 */

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  Modal,
  Progress,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowRight,
  IconCertificate,
  IconCheck,
  IconEdit,
  IconHistory,
  IconInfoCircle,
  IconSchool,
  IconTrash,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { MantineReactTable, type MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { formatDate } from "~/utils/utils";
import DateDisplay from "../DateDisplay";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  currentGrade: number;
  newGrade: number | "Alumni";
  role: string;
  removed?: boolean; // Flag to mark students as removed (but not deleted from list)
}

/**
 * Migration preview data
 */
interface MigrationPreview {
  students: Student[];
  totalStudents: number;
  movingToAlumni: number;
  promoting: number;
}

/**
 * Migration tab component for grade promotion
 *
 * @returns The rendered migration interface
 */
export default function MigrationTab() {
  const loaderData = useLoaderData<any>();
  const [previewData, setPreviewData] = useState<MigrationPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
  const [revertOpened, { open: openRevert, close: closeRevert }] = useDisclosure(false);

  // Role changing
  const [roleChangeModal, { open: openRoleChange, close: closeRoleChange }] = useDisclosure(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [availableRoles] = useState([
    { value: "6", label: "Grade 6" },
    { value: "7", label: "Grade 7" },
    { value: "8", label: "Grade 8" },
    { value: "9", label: "Grade 9" },
    { value: "10", label: "Grade 10" },
    { value: "11", label: "Grade 11" },
    { value: "12", label: "Grade 12" },
    { value: "Alumni", label: "Alumni" },
  ]);

  // Table selection state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isMassActionLoading, setIsMassActionLoading] = useState(false);

  // Undo/Redo functionality with action-based history
  const [actionHistory, setActionHistory] = useState<
    Array<{
      type: "REMOVE_STUDENTS" | "CHANGE_ROLE" | "MASS_ROLE_CHANGE";
      data: any;
      timestamp: number;
    }>
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [originalPreview, setOriginalPreview] = useState<MigrationPreview | null>(null);

  // Migration fetcher
  const fetcher = useFetcher<any>();

  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as any;

      if (data.success && data.preview) {
        // Preview loaded successfully
        const serverPreview = data.preview;
        const mappedPreview: MigrationPreview = {
          students: serverPreview.students.map((s: any) => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            currentGrade: s.currentGrade,
            newGrade: s.newGrade,
            role: "Student", // Simplified for UI
          })),
          totalStudents: serverPreview.totalStudents,
          movingToAlumni: serverPreview.movingToAlumni,
          promoting: serverPreview.promoting,
        };
        setPreviewData(mappedPreview);

        // Initialize history with original preview
        setOriginalPreview(mappedPreview);
        setActionHistory([]);
        setHistoryIndex(-1);

        setIsLoading(false);
      } else if (data.success && typeof data.studentsReverted === "number") {
        // Revert completed successfully
        notifications.update({
          id: "revert-migration",
          title: "Migration Reverted Successfully",
          message: `Successfully reverted changes for ${data.studentsReverted} students`,
          color: "green",
          icon: <IconCheck size={16} />,
          loading: false,
          autoClose: true,
        });

        closeRevert();
        setIsReverting(false);

        // Refresh the page to update loader data
        setTimeout(() => window.location.reload(), 1000);
      } else if (data.success && typeof data.studentsProcessed === "number") {
        // Migration completed successfully
        notifications.update({
          id: "execute-migration",
          title: "Migration Completed Successfully",
          message: `Successfully processed ${data.studentsProcessed} students (${data.promoted} promoted, ${data.movedToAlumni} moved to Alumni)`,
          color: "green",
          icon: <IconCheck size={16} />,
          loading: false,
          autoClose: true,
        });

        setIsMigrating(false);
        setProgress(100);
        close(); // Close the migration modal
        setPreviewData(null); // Clear preview data

        // Refresh the page to update loader data
        setTimeout(() => {
          setProgress(0); // Reset progress
          window.location.reload();
        }, 1000);
      } else if (data.error) {
        // Error occurred
        const errorTitle =
          data.error.includes("revert") || data.error.includes("Migration data")
            ? "Revert Failed"
            : "Operation Failed";

        notifications.update({
          id: "revert-migration",
          title: errorTitle,
          message: data.error,
          color: "red",
          icon: <IconAlertTriangle size={16} />,
          loading: false,
          autoClose: true,
        });

        // Also show a regular notification for non-revert errors
        if (!data.error.includes("revert") && !data.error.includes("Migration data")) {
          notifications.show({
            title: errorTitle,
            message: data.error,
            color: "red",
            icon: <IconAlertTriangle size={16} />,
          });
        }

        setIsLoading(false);
        setIsMigrating(false);
        setIsReverting(false);
      }
    }
  }, [fetcher.data, closeRevert, close]);

  /**
   * Load migration preview data
   */
  const loadPreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetcher.submit({ action: "preview" }, { method: "POST" });

      // The response will be handled by the fetcher automatically
      // We'll check the fetcher data in the useEffect below
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load migration preview",
        color: "red",
      });
      setIsLoading(false);
    }
  };

  /**
   * Execute the migration
   */
  const executeMigration = async () => {
    setIsMigrating(true);
    setProgress(0);

    // Show initial notification
    notifications.show({
      id: "execute-migration",
      title: "Executing Migration",
      message: "Processing grade migration...",
      color: "blue",
      loading: true,
      autoClose: false,
    });

    try {
      // Simulate migration progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Stop at 90% until server responds
          }
          return prev + 10;
        });
      }, 300);

      // Get only non-removed students for migration
      const studentsToMigrate = previewData?.students.filter((student) => !student.removed) || [];

      // Execute migration via fetcher with filtered student data
      const formData = new FormData();
      formData.append("action", "migrate");
      formData.append("students", JSON.stringify(studentsToMigrate));

      await fetcher.submit(formData, { method: "POST" });

      // Clear the interval when done
      clearInterval(interval);

      // Success/error handling is now done in the useEffect above
    } catch (error) {
      notifications.update({
        id: "execute-migration",
        title: "Migration Failed",
        message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        color: "red",
        loading: false,
        autoClose: true,
      });
      setIsMigrating(false);
      setProgress(0);
    }
  };

  /**
   * Revert the last migration
   */
  const revertMigration = async () => {
    setIsReverting(true);

    // Show initial notification
    notifications.show({
      id: "revert-migration",
      title: "Reverting Migration",
      message: "Processing revert request...",
      color: "blue",
      loading: true,
      autoClose: false,
    });

    try {
      await fetcher.submit({ action: "revert" }, { method: "POST" });

      // Success/error handling is now done in the useEffect below
    } catch (error) {
      notifications.update({
        id: "revert-migration",
        title: "Revert Failed",
        message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        color: "red",
        loading: false,
        autoClose: true,
      });
      setIsReverting(false);
    }
  };

  /**
   * Get badge color for grade status
   */
  const getGradeBadgeColor = (newGrade: number | "Alumni") => {
    if (newGrade === "Alumni") return "green";
    if (typeof newGrade === "number" && newGrade >= 12) return "blue";
    return "gray";
  };

  /**
   * Get all students for display (no filtering)
   */
  const getDisplayedStudents = () => {
    if (!previewData) return [];
    return previewData.students;
  };

  /**
   * Open role change modal for a student
   */
  const openRoleChangeModal = (student: Student) => {
    setSelectedStudent(student);
    setNewRole(student.newGrade === "Alumni" ? "Alumni" : student.newGrade.toString());
    openRoleChange();
  };

  /**
   * Confirm role change for selected student
   */
  const confirmRoleChange = () => {
    if (!selectedStudent || !previewData) return;

    const newGradeValue: number | "Alumni" = newRole === "Alumni" ? "Alumni" : parseInt(newRole);

    // Add to history before making changes
    addToHistory({
      type: "CHANGE_ROLE",
      data: {
        studentId: selectedStudent.id,
        oldGrade: selectedStudent.newGrade,
        newGrade: newGradeValue,
      },
    });

    // Update student in preview data
    const updatedStudents = previewData.students.map((s) =>
      s.id === selectedStudent.id ? { ...s, newGrade: newGradeValue } : s
    );

    // Recalculate counts
    const movingToAlumni = updatedStudents.filter((s) => s.newGrade === "Alumni").length;
    const promoting = updatedStudents.filter((s) => s.newGrade !== "Alumni").length;

    setPreviewData({
      ...previewData,
      students: updatedStudents,
      movingToAlumni,
      promoting,
    });

    notifications.show({
      title: "Role Updated",
      message: `${selectedStudent.firstName} ${selectedStudent.lastName} will now become ${
        newRole === "Alumni" ? "Alumni" : `Grade ${newRole}`
      }`,
      color: "green",
    });

    closeRoleChange();
    setSelectedStudent(null);
    setNewRole("");
  };

  /**
   * Handle mass removal of selected students from migration - mark as removed instead of deleting
   */
  const handleMassRemove = () => {
    if (!previewData) return;

    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

    if (selectedIds.length === 0) {
      notifications.show({
        title: "No Students Selected",
        message: "Please select students to remove from the migration",
        color: "orange",
      });
      return;
    }

    // Get students to be marked as removed for history
    const studentsToRemove = previewData.students.filter(
      (s) => selectedIds.includes(s.id) && !s.removed
    );

    // Add to history before making changes
    addToHistory({
      type: "REMOVE_STUDENTS",
      data: studentsToRemove,
    });

    // Mark selected students as removed instead of deleting them
    const updatedStudents = previewData.students.map((student) =>
      selectedIds.includes(student.id) ? { ...student, removed: true } : student
    );

    // Count only non-removed students for statistics
    const activeStudents = updatedStudents.filter((s) => !s.removed);
    const movingToAlumni = activeStudents.filter((s) => s.newGrade === "Alumni").length;
    const promoting = activeStudents.filter((s) => s.newGrade !== "Alumni").length;

    setPreviewData({
      ...previewData,
      students: updatedStudents,
      totalStudents: activeStudents.length, // Only count non-removed students
      movingToAlumni,
      promoting,
    });

    setRowSelection({});

    notifications.show({
      title: "Students Marked as Removed",
      message: `${selectedIds.length} student(s) marked as removed from migration`,
      color: "green",
    });
  };

  /**
   * Handle mass role change for selected students
   */
  const handleMassRoleChange = (targetRole: string) => {
    if (!previewData) return;

    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

    if (selectedIds.length === 0) {
      notifications.show({
        title: "No Students Selected",
        message: "Please select students to change their destination role",
        color: "orange",
      });
      return;
    }

    // Get current grades for students to be changed
    const changes = selectedIds.map((id) => {
      const student = previewData.students.find((s) => s.id === id);
      return {
        studentId: id,
        oldGrade: student?.newGrade,
      };
    });

    // Add to history before making changes
    addToHistory({
      type: "MASS_ROLE_CHANGE",
      data: {
        changes,
        targetRole: targetRole === "Alumni" ? "Alumni" : parseInt(targetRole),
      },
    });

    const newGradeValue: number | "Alumni" =
      targetRole === "Alumni" ? "Alumni" : parseInt(targetRole);

    const updatedStudents = previewData.students.map((s) =>
      selectedIds.includes(s.id) ? { ...s, newGrade: newGradeValue } : s
    );

    const movingToAlumni = updatedStudents.filter((s) => s.newGrade === "Alumni").length;
    const promoting = updatedStudents.filter((s) => s.newGrade !== "Alumni").length;

    setPreviewData({
      ...previewData,
      students: updatedStudents,
      movingToAlumni,
      promoting,
    });

    setRowSelection({});

    notifications.show({
      title: "Roles Updated",
      message: `${selectedIds.length} student(s) will now become ${
        targetRole === "Alumni" ? "Alumni" : `Grade ${targetRole}`
      }`,
      color: "green",
    });
  };

  /**
   * Add action to history
   */
  const addToHistory = (action: {
    type: "REMOVE_STUDENTS" | "CHANGE_ROLE" | "MASS_ROLE_CHANGE";
    data: any;
  }) => {
    // Remove any history after current index (when undoing then making new changes)
    const newHistory = actionHistory.slice(0, historyIndex + 1);
    newHistory.push({
      ...action,
      timestamp: Date.now(),
    });

    setActionHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Keep history manageable (last 20 actions)
    if (newHistory.length > 20) {
      const trimmedHistory = newHistory.slice(-20);
      setActionHistory(trimmedHistory);
      setHistoryIndex(trimmedHistory.length - 1);
    }
  };

  /**
   * Undo the last action
   */
  const handleUndo = () => {
    if (historyIndex >= 0 && previewData) {
      const action = actionHistory[historyIndex];

      // Reverse the action
      switch (action.type) {
        case "REMOVE_STUDENTS":
          // Restore the removed students by unmarking them as removed
          const studentsToRestore = action.data as Student[];
          const studentsAfterRestore = previewData.students.map((student) => {
            const toRestore = studentsToRestore.find((s) => s.id === student.id);
            return toRestore ? { ...student, removed: false } : student;
          });

          // Count only non-removed students for statistics
          const activeStudentsAfterRestore = studentsAfterRestore.filter((s) => !s.removed);
          const restoredMovingToAlumni = activeStudentsAfterRestore.filter(
            (s) => s.newGrade === "Alumni"
          ).length;
          const restoredPromoting = activeStudentsAfterRestore.filter(
            (s) => s.newGrade !== "Alumni"
          ).length;

          setPreviewData({
            ...previewData,
            students: studentsAfterRestore,
            totalStudents: activeStudentsAfterRestore.length,
            movingToAlumni: restoredMovingToAlumni,
            promoting: restoredPromoting,
          });
          break;

        case "CHANGE_ROLE":
          // Revert single role change
          const { studentId, oldGrade } = action.data;
          const studentsAfterRoleRevert = previewData.students.map((s) =>
            s.id === studentId ? { ...s, newGrade: oldGrade } : s
          );
          const roleRevertMovingToAlumni = studentsAfterRoleRevert.filter(
            (s) => s.newGrade === "Alumni"
          ).length;
          const roleRevertPromoting = studentsAfterRoleRevert.filter(
            (s) => s.newGrade !== "Alumni"
          ).length;

          setPreviewData({
            ...previewData,
            students: studentsAfterRoleRevert,
            movingToAlumni: roleRevertMovingToAlumni,
            promoting: roleRevertPromoting,
          });
          break;

        case "MASS_ROLE_CHANGE":
          // Revert mass role change
          const { changes } = action.data;
          const studentsAfterMassRevert = previewData.students.map((s) => {
            const change = changes.find((c: any) => c.studentId === s.id);
            return change ? { ...s, newGrade: change.oldGrade } : s;
          });
          const massRevertMovingToAlumni = studentsAfterMassRevert.filter(
            (s) => s.newGrade === "Alumni"
          ).length;
          const massRevertPromoting = studentsAfterMassRevert.filter(
            (s) => s.newGrade !== "Alumni"
          ).length;

          setPreviewData({
            ...previewData,
            students: studentsAfterMassRevert,
            movingToAlumni: massRevertMovingToAlumni,
            promoting: massRevertPromoting,
          });
          break;
      }

      setHistoryIndex(historyIndex - 1);
      setRowSelection({});

      notifications.show({
        title: "Action Undone",
        message: "Last change has been undone",
        color: "blue",
      });
    }
  };

  /**
   * Redo the next action
   */
  const handleRedo = () => {
    if (historyIndex < actionHistory.length - 1 && previewData) {
      const action = actionHistory[historyIndex + 1];

      // Reapply the action
      switch (action.type) {
        case "REMOVE_STUDENTS":
          // Mark the students as removed again
          const studentIdsToRemove = action.data.map((s: Student) => s.id);
          const studentsAfterRedoRemoval = previewData.students.map((student) =>
            studentIdsToRemove.includes(student.id) ? { ...student, removed: true } : student
          );

          // Count only non-removed students for statistics
          const activeStudentsAfterRedo = studentsAfterRedoRemoval.filter((s) => !s.removed);
          const removalRedoMovingToAlumni = activeStudentsAfterRedo.filter(
            (s) => s.newGrade === "Alumni"
          ).length;
          const removalRedoPromoting = activeStudentsAfterRedo.filter(
            (s) => s.newGrade !== "Alumni"
          ).length;

          setPreviewData({
            ...previewData,
            students: studentsAfterRedoRemoval,
            totalStudents: activeStudentsAfterRedo.length,
            movingToAlumni: removalRedoMovingToAlumni,
            promoting: removalRedoPromoting,
          });
          break;

        case "CHANGE_ROLE":
          // Reapply single role change
          const { studentId, newGrade } = action.data;
          const studentsAfterRoleRedo = previewData.students.map((s) =>
            s.id === studentId ? { ...s, newGrade: newGrade } : s
          );
          const roleRedoMovingToAlumni = studentsAfterRoleRedo.filter(
            (s) => s.newGrade === "Alumni"
          ).length;
          const roleRedoPromoting = studentsAfterRoleRedo.filter(
            (s) => s.newGrade !== "Alumni"
          ).length;

          setPreviewData({
            ...previewData,
            students: studentsAfterRoleRedo,
            movingToAlumni: roleRedoMovingToAlumni,
            promoting: roleRedoPromoting,
          });
          break;

        case "MASS_ROLE_CHANGE":
          // Reapply mass role change
          const { changes: redoChanges, targetRole } = action.data;
          const studentsAfterMassRedo = previewData.students.map((s) => {
            const change = redoChanges.find((c: any) => c.studentId === s.id);
            return change ? { ...s, newGrade: targetRole } : s;
          });
          const massRedoMovingToAlumni = studentsAfterMassRedo.filter(
            (s) => s.newGrade === "Alumni"
          ).length;
          const massRedoPromoting = studentsAfterMassRedo.filter(
            (s) => s.newGrade !== "Alumni"
          ).length;

          setPreviewData({
            ...previewData,
            students: studentsAfterMassRedo,
            movingToAlumni: massRedoMovingToAlumni,
            promoting: massRedoPromoting,
          });
          break;
      }

      setHistoryIndex(historyIndex + 1);
      setRowSelection({});

      notifications.show({
        title: "Action Redone",
        message: "Change has been redone",
        color: "blue",
      });
    }
  };

  /**
   * Reset to original migration preview
   */
  const handleReset = () => {
    if (originalPreview) {
      setPreviewData({ ...originalPreview });
      setActionHistory([]);
      setHistoryIndex(-1);
      setRowSelection({});

      notifications.show({
        title: "Migration Reset",
        message: "Migration has been reset to original state",
        color: "orange",
      });
    }
  };

  // Table columns configuration for MantineReactTable
  const columns = useMemo<MRT_ColumnDef<Student>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "Student Name",
        enableColumnFilter: true,
        filterFn: "contains",
        Cell: ({ row }) => (
          <Text
            fw={500}
            style={{
              textDecoration: row.original.removed ? "line-through" : "none",
              opacity: row.original.removed ? 0.6 : 1,
            }}
          >
            {row.original.firstName} {row.original.lastName}
          </Text>
        ),
        accessorFn: (row) => `${row.firstName} ${row.lastName}`, // Enable searching full name
      },
      {
        accessorKey: "currentGrade",
        header: "Current Grade",
        enableColumnFilter: true,
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: [
            { value: "6", label: "Grade 6" },
            { value: "7", label: "Grade 7" },
            { value: "8", label: "Grade 8" },
            { value: "9", label: "Grade 9" },
            { value: "10", label: "Grade 10" },
            { value: "11", label: "Grade 11" },
            { value: "12", label: "Grade 12" },
          ],
        },
        Cell: ({ row }) => (
          <Badge
            color="gray"
            variant="light"
            style={{
              textDecoration: row.original.removed ? "line-through" : "none",
              opacity: row.original.removed ? 0.6 : 1,
            }}
          >
            Grade {row.original.currentGrade}
          </Badge>
        ),
      },
      {
        accessorKey: "newGrade",
        header: "New Status",
        enableColumnFilter: true,
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: [
            { value: "7", label: "Grade 7" },
            { value: "8", label: "Grade 8" },
            { value: "9", label: "Grade 9" },
            { value: "10", label: "Grade 10" },
            { value: "11", label: "Grade 11" },
            { value: "12", label: "Grade 12" },
            { value: "Alumni", label: "Alumni" },
          ],
        },
        Cell: ({ row }) => (
          <Tooltip label="Click to change destination role" position="top" withArrow>
            <Badge
              color={getGradeBadgeColor(row.original.newGrade)}
              variant="light"
              style={{
                cursor: "pointer",
                textDecoration: row.original.removed ? "line-through" : "none",
                opacity: row.original.removed ? 0.6 : 1,
              }}
              onClick={() => openRoleChangeModal(row.original)}
            >
              {row.original.newGrade === "Alumni" ? "Alumni" : `Grade ${row.original.newGrade}`}
            </Badge>
          </Tooltip>
        ),
      },
      {
        accessorKey: "change",
        header: "Change",
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Group gap="xs" align="center">
            <Text size="sm">Grade {row.original.currentGrade}</Text>
            <IconArrowRight size={14} />
            <Text size="sm">
              {row.original.newGrade === "Alumni" ? "Alumni" : `Grade ${row.original.newGrade}`}
            </Text>
          </Group>
        ),
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: getDisplayedStudents(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    enablePagination: true,
    enableBottomToolbar: true,
    enableTopToolbar: true,
    positionToolbarAlertBanner: "bottom",
    getRowId: (row) => row.id, // Use student ID as row key
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
    enableGlobalFilter: false,
    enableColumnFilters: true,
    enableColumnActions: true,
    enableColumnFilterModes: false,
    positionActionsColumn: "last",
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableHiding: false,
    renderToolbarInternalActions: ({ table }) => {
      const numOfSelectedRows = Object.keys(rowSelection).filter((key) => rowSelection[key]).length;

      return (
        <Group ml="auto" gap="sm" align="center">
          {/* Custom Actions - moved from bottom toolbar */}
          {numOfSelectedRows > 0 && (
            <>
              <Button
                size="xs"
                color="red"
                variant="light"
                leftSection={<IconTrash size={14} />}
                onClick={handleMassRemove}
                loading={isMassActionLoading}
              >
                Remove Selected ({numOfSelectedRows})
              </Button>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button
                    size="xs"
                    color="blue"
                    variant="light"
                    leftSection={<IconEdit size={14} />}
                    loading={isMassActionLoading}
                  >
                    Change Role ({numOfSelectedRows})
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Set destination role</Menu.Label>
                  {availableRoles.map((role) => (
                    <Menu.Item key={role.value} onClick={() => handleMassRoleChange(role.value)}>
                      {role.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </>
          )}

          {/* Undo/Redo Actions */}
          <ActionIcon
            size={32}
            variant="subtle"
            color="blue"
            onClick={handleUndo}
            disabled={historyIndex < 0}
          >
            <IconArrowBackUp size={32} />
          </ActionIcon>
          <ActionIcon
            size={32}
            variant="subtle"
            color="blue"
            onClick={handleRedo}
            disabled={historyIndex >= actionHistory.length - 1}
          >
            <IconArrowForwardUp size={32} />
          </ActionIcon>
        </Group>
      );
    },
  });

  return (
    <Stack w="100%" gap="lg" p="md">
      {/* Header - Hide when preview is displayed */}
      {!previewData && (
        <Card withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Group align="center" gap="sm">
                  <IconSchool size={20} />
                  <Title order={3}>Grade Migration</Title>
                </Group>

                <Text mt="sm">
                  Automatically promote students to the next grade level. Grade 12 students will be
                  moved to Alumni status. Faculty and staff are not affected.
                </Text>
              </div>

              {/* Revert Button */}
              {loaderData.lastMigration && loaderData.lastMigration.status === "completed" && (
                <Button
                  variant="outline"
                  color="orange"
                  size="sm"
                  leftSection={<IconHistory size={16} />}
                  onClick={openRevert}
                >
                  Revert Last Migration
                </Button>
              )}
            </Group>

            {/* Migration Status Info */}
            {loaderData.lastMigration && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                color={loaderData.lastMigration.status === "completed" ? "blue" : "gray"}
              >
                <Text size="sm">
                  <DateDisplay
                    date={loaderData.lastMigration.createdDate}
                    formatOptions={{
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }}
                    prefix={<strong>Last Migration: </strong>}
                  />
                  {loaderData.lastMigration.academicYear &&
                    ` (${loaderData.lastMigration.academicYear})`}
                  <br />
                  <strong>Status:</strong>{" "}
                  {loaderData.lastMigration.status === "completed" ? "Completed" : "Reverted"}
                  <br />
                  <strong>Students Affected:</strong> {loaderData.lastMigration.studentsAffected}
                </Text>
              </Alert>
            )}

            {/* Migration Restrictions */}
            {!loaderData.canMigrate && (
              <Alert icon={<IconAlertTriangle size={16} />} color="red">
                <Text size="sm">
                  <strong>Migration Temporarily Blocked:</strong> Must wait at least 10 months
                  between migrations.
                  {loaderData.daysSinceLastMigration && (
                    <>
                      <br />
                      Last migration was {Math.floor(loaderData.daysSinceLastMigration)} days ago.
                      Need to wait{" "}
                      {Math.ceil(
                        loaderData.requiredWaitMonths * 30.44 - loaderData.daysSinceLastMigration
                      )}{" "}
                      more days.
                    </>
                  )}
                </Text>
              </Alert>
            )}

            <Alert icon={<IconAlertTriangle size={16} />} color="orange">
              <Text size="sm">
                <strong>Important:</strong> This operation will modify student records permanently.
                Please review the preview carefully before proceeding.
              </Text>
            </Alert>

            <Button
              leftSection={<IconSchool size={16} />}
              onClick={loadPreview}
              loading={isLoading}
              disabled={isLoading || !loaderData.canMigrate}
            >
              Generate Migration Preview
            </Button>
          </Stack>
        </Card>
      )}

      {/* Preview Results */}
      {isLoading && (
        <Card withBorder>
          <Center p="xl">
            <Stack align="center" gap="md">
              <Loader size="md" />
              <Text>Loading students for migration preview...</Text>
            </Stack>
          </Center>
        </Card>
      )}

      {previewData && (
        <Card withBorder>
          <Stack gap="md">
            <Title order={4}>Migration Preview</Title>

            {/* Summary Statistics */}
            <Group gap="lg">
              <Stack gap="xs" align="center">
                <Text size="xl" fw={700} c="blue">
                  {previewData.totalStudents}
                </Text>
                <Text size="sm" c="dimmed">
                  Total Students
                </Text>
              </Stack>

              <Stack gap="xs" align="center">
                <Text size="xl" fw={700} c="green">
                  {previewData.movingToAlumni}
                </Text>
                <Text size="sm" c="dimmed">
                  Moving to Alumni
                </Text>
              </Stack>

              <Stack gap="xs" align="center">
                <Text size="xl" fw={700} c="orange">
                  {previewData.promoting}
                </Text>
                <Text size="sm" c="dimmed">
                  Promoting
                </Text>
              </Stack>
            </Group>

            {/* Student Table with Selection */}
            <MantineReactTable table={table} />

            <Button
              color="orange"
              leftSection={<IconCheck size={16} />}
              onClick={open}
              disabled={previewData.totalStudents === 0}
            >
              Execute Migration
            </Button>
          </Stack>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title="Confirm Grade Migration"
        centered
        closeOnClickOutside={!isMigrating}
        closeOnEscape={!isMigrating}
      >
        <Stack gap="md">
          <Text>Are you sure you want to proceed with the grade migration? This will:</Text>

          <Stack gap="xs" pl="md">
            <Group gap="xs" align="center">
              <IconTrendingUp size={16} color="var(--mantine-color-orange-6)" />
              <Text size="sm">Promote {previewData?.promoting} students to the next grade</Text>
            </Group>
            <Group gap="xs" align="center">
              <IconCertificate size={16} color="var(--mantine-color-green-6)" />
              <Text size="sm">Move {previewData?.movingToAlumni} Grade 12 students to Alumni</Text>
            </Group>
            <Group gap="xs" align="center">
              <IconUsers size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm">Leave faculty and staff unchanged</Text>
            </Group>
          </Stack>

          <Alert color="red" icon={<IconAlertTriangle size={16} />}>
            This action cannot be undone. Please ensure you have a database backup.
          </Alert>

          {isMigrating && (
            <Stack gap="xs">
              <Text size="sm">Processing migration...</Text>
              <Progress value={progress} animated />
            </Stack>
          )}

          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={close} disabled={isMigrating}>
              Cancel
            </Button>
            <Button
              color="orange"
              onClick={executeMigration}
              loading={isMigrating}
              disabled={isMigrating}
            >
              Confirm Migration
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Role Change Modal */}
      <Modal
        opened={roleChangeModal}
        onClose={closeRoleChange}
        title="Change Student Role"
        centered
      >
        <Stack gap="md">
          {selectedStudent && (
            <>
              <Text>
                Change the destination role for{" "}
                <strong>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </strong>
                :
              </Text>

              <Group gap="sm" align="center">
                <Text size="sm">Currently: Grade {selectedStudent.currentGrade}</Text>
                <IconArrowRight size={14} />
                <Select
                  placeholder="Select new role"
                  data={availableRoles}
                  value={newRole}
                  onChange={(value: string | null) => setNewRole(value || "")}
                  style={{ minWidth: 120 }}
                />
              </Group>

              <Alert icon={<IconEdit size={16} />} color="blue">
                <Text size="sm">
                  This change will only apply to the current migration preview. The student's actual
                  role will be updated when the migration is executed.
                </Text>
              </Alert>

              <Group justify="flex-end" gap="sm">
                <Button variant="light" onClick={closeRoleChange}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmRoleChange}
                  disabled={!newRole}
                  leftSection={<IconCheck size={16} />}
                >
                  Update Role
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>

      {/* Revert Migration Modal */}
      <Modal
        opened={revertOpened}
        onClose={closeRevert}
        title="Revert Last Migration"
        centered
        closeOnClickOutside={!isReverting}
        closeOnEscape={!isReverting}
      >
        <Stack gap="md">
          <Text>Are you sure you want to revert the last grade migration?</Text>

          {loaderData.lastMigration && (
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              <Text size="sm">
                <strong>Migration Details:</strong>
                <br />
                Date:{" "}
                <ClientOnly fallback="Loading date...">
                  {() =>
                    formatDate(loaderData.lastMigration.createdDate, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                </ClientOnly>
                <br />
                Students Affected: {loaderData.lastMigration.studentsAffected}
                <br />
                Moved to Alumni: {loaderData.lastMigration.movedToAlumni}
                <br />
                Promoted: {loaderData.lastMigration.promoted}
              </Text>
            </Alert>
          )}

          <Text>This will:</Text>
          <Stack gap="xs" pl="md">
            <Group gap="xs" align="center">
              <IconHistory size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm">Restore all students to their previous grade levels</Text>
            </Group>
            <Group gap="xs" align="center">
              <IconSchool size={16} color="var(--mantine-color-orange-6)" />
              <Text size="sm">Move Alumni students back to Grade 12</Text>
            </Group>
          </Stack>

          <Alert color="orange" icon={<IconAlertTriangle size={16} />}>
            This action cannot be undone. The migration will be permanently marked as reverted.
          </Alert>

          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={closeRevert} disabled={isReverting}>
              Cancel
            </Button>
            <Button
              color="orange"
              onClick={revertMigration}
              loading={isReverting}
              disabled={isReverting}
              leftSection={<IconHistory size={16} />}
            >
              Revert Migration
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
