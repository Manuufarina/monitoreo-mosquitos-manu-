/*
  Warnings:

  - A unique constraint covering the columns `[trampaId,fecha]` on the table `Informe` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Trampa" ADD COLUMN "ubicacion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Informe_trampaId_fecha_key" ON "Informe"("trampaId", "fecha");
