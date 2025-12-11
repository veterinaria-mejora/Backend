/*
  Warnings:

  - Added the required column `discount` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "animal" ALTER COLUMN "adoptable" SET DEFAULT false;

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "discount" INTEGER NOT NULL;
