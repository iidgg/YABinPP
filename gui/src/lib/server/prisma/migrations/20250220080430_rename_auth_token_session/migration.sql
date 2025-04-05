ALTER TABLE "AuthToken" RENAME TO "Session";

-- AlterTable
ALTER TABLE "Session" RENAME CONSTRAINT "AuthToken_pkey" TO "Session_pkey";

-- RenameForeignKey
ALTER TABLE "Session" RENAME CONSTRAINT "AuthToken_userId_fkey" TO "Session_userId_fkey";

-- RenameIndex
ALTER INDEX "AuthToken_token_key" RENAME TO "Session_token_key";
