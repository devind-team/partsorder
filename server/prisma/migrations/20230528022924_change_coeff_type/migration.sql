-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'SELLER';
ALTER TYPE "Role" ADD VALUE 'BUYER';
ALTER TYPE "Role" ADD VALUE 'LOGIST';

-- AlterTable
ALTER TABLE "items"
  ALTER COLUMN "coefficient" SET DEFAULT 2,
  ALTER COLUMN "coefficient" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "prices"
  DROP COLUMN "duration",
  ADD COLUMN "duration" INTEGER DEFAULT 30;
