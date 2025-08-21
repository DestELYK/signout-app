-- Add Alumni role for all former students (graduated or left early)
INSERT IGNORE INTO PersonRole (name, description, color, createdDate, updatedDate)
VALUES ('Alumni', 'Former students (graduated or left early)', '#228b22', NOW(), NOW());

-- CreateTable
CREATE TABLE `Migration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL DEFAULT 'grade_promotion',
    `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    `changes` JSON NOT NULL,
    `studentsAffected` INTEGER NOT NULL DEFAULT 0,
    `movedToAlumni` INTEGER NOT NULL DEFAULT 0,
    `promoted` INTEGER NOT NULL DEFAULT 0,
    `academicYear` VARCHAR(191) NULL,
    `notes` VARCHAR(500) NULL,
    `createdDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
