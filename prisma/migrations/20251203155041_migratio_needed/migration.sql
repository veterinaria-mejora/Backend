/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `animal` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `consultas` table. All the data in the column will be lost.
  - You are about to drop the `perfil` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `turno` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "animal" DROP CONSTRAINT "animal_perfilId_fkey";

-- DropForeignKey
ALTER TABLE "animal" DROP CONSTRAINT "animal_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "consultas" DROP CONSTRAINT "consultas_nombre_fkey";

-- DropForeignKey
ALTER TABLE "turno" DROP CONSTRAINT "turno_mascota_fkey";

-- AlterTable
ALTER TABLE "animal" DROP COLUMN "usuarioId",
ALTER COLUMN "adoptable" SET DEFAULT true;

-- AlterTable
ALTER TABLE "consultas" DROP COLUMN "nombre",
ADD COLUMN     "idusuario" INTEGER;

-- DropTable
DROP TABLE "perfil";

-- DropTable
DROP TABLE "turno";

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_dueño_fkey" FOREIGN KEY ("dueño") REFERENCES "users"("idusuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "users"("idusuario") ON DELETE SET NULL ON UPDATE CASCADE;
