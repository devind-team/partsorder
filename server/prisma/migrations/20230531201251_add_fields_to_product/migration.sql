/*
  Warnings:

  - You are about to drop the column `name` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[price,duration,supplier_name,valid_at]` on the table `prices` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "relevant" BOOLEAN DEFAULT true,
ALTER COLUMN "duration" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "name",
ADD COLUMN     "brutto" DECIMAL(9,2),
ADD COLUMN     "name_en" VARCHAR(256),
ADD COLUMN     "name_pl" VARCHAR(256),
ADD COLUMN     "name_ru" VARCHAR(256),
ADD COLUMN     "netto" DECIMAL(9,2),
ADD COLUMN     "tnved" VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "prices_price_duration_supplier_name_valid_at_key" ON "prices"("price", "duration", "supplier_name", "valid_at");
