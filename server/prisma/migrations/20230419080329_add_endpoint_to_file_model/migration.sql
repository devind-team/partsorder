/*
  Warnings:

  - Added the required column `end_point` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "end_point" VARCHAR(64) NOT NULL;
