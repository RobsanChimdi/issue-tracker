-- AlterTable
ALTER TABLE `comment` MODIFY `issueId` INTEGER NULL,
    MODIFY `videoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `like` MODIFY `issueId` INTEGER NULL,
    MODIFY `videoId` INTEGER NULL;
