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

-- Drop unique index Person_schoolId_key on Person.schoolId if it exists
DROP INDEX IF EXISTS `Person_schoolId_key` ON `Person`;

UPDATE `Person`
SET nickname = '' WHERE nickname IS NULL;

ALTER TABLE `Person`
MODIFY COLUMN `nickname` VARCHAR(191) NOT NULL DEFAULT '';

-- Add default roles
INSERT IGNORE INTO PersonRole (name, description, color, createdDate, updatedDate)
VALUES 
    ('Grade 1', 'Students in Grade 1', '#cf1010', NOW(), NOW()),
    ('Grade 2', 'Students in Grade 2', '#cf1010', NOW(), NOW()),
    ('Grade 3', 'Students in Grade 3', '#cf1010', NOW(), NOW()),
    ('Grade 4', 'Students in Grade 4', '#cf1010', NOW(), NOW()),
    ('Grade 5', 'Students in Grade 5', '#cf1010', NOW(), NOW()),
    ('Grade 6', 'Students in Grade 6', '#cf1010', NOW(), NOW()),
    ('Grade 7', 'Students in Grade 7', '#800080', NOW(), NOW()),
    ('Grade 8', 'Students in Grade 8', '#800080', NOW(), NOW()),
    ('Grade 9', 'Students in Grade 9', '#0c0cb4', NOW(), NOW()),
    ('Grade 10', 'Students in Grade 10', '#0c0cb4', NOW(), NOW()),
    ('Grade 11', 'Students in Grade 11', '#0c0cb4', NOW(), NOW()),
    ('Grade 12', 'Students in Grade 12', '#0c0cb4', NOW(), NOW()),
    ('Alumni', 'Former students (graduated or left early)', '#228b22', NOW(), NOW()),
    ('Staff', 'School staff and teachers', '#800080', NOW(), NOW());