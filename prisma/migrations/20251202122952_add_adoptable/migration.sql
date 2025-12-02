/*
  Warnings:

  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "animal" DROP CONSTRAINT "animal_dueño_fkey";

-- AlterTable
ALTER TABLE "animal" ADD COLUMN     "adoptable" BOOLEAN DEFAULT false,
ADD COLUMN     "usuarioId" INTEGER;

-- DropTable
DROP TABLE "appointments";

-- DropTable
DROP TABLE "pets";

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("idusuario") ON DELETE SET NULL ON UPDATE CASCADE;
