ALTER TABLE "TwoFA" RENAME TO "mfa";

-- AlterTable
ALTER TABLE "mfa" RENAME CONSTRAINT "TwoFA_pkey" TO "mfa_pkey";

-- RenameForeignKey
ALTER TABLE "mfa" RENAME CONSTRAINT "TwoFA_userId_fkey" TO "mfa_userId_fkey";

-- RenameIndex
ALTER INDEX "TwoFA_userId_type_key" RENAME TO "mfa_userId_type_key";
