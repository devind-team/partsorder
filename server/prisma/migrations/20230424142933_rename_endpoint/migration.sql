/*
  Warnings:

  - You are about to drop the column `end_point` on the `files` table. All the data in the column will be lost.
  - Added the required column `server_url` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" RENAME COLUMN "end_point" TO "server_url";
