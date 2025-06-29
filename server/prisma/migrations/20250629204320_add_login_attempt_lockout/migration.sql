-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lockOutUntil" TIMESTAMP(3),
ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0;
