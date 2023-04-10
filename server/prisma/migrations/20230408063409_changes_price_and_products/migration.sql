-- AlterTable
ALTER TABLE "prices" ALTER COLUMN "duration" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "name" DROP NOT NULL;
