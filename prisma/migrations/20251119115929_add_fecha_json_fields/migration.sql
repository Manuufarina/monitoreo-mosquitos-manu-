/*
  Warnings:

  - You are about to drop the column `cantidad` on the `Informe` table. All the data in the column will be lost.
  - You are about to drop the column `semana` on the `Informe` table. All the data in the column will be lost.
  - You are about to drop the column `tipoMosquito` on the `Informe` table. All the data in the column will be lost.
  - You are about to drop the column `tipoTrampa` on the `Informe` table. All the data in the column will be lost.
  - Added the required column `cantidades` to the `Informe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha` to the `Informe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipos` to the `Informe` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Informe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "tipos" JSONB NOT NULL,
    "cantidades" JSONB NOT NULL,
    "notas" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trampaId" INTEGER NOT NULL,
    CONSTRAINT "Informe_trampaId_fkey" FOREIGN KEY ("trampaId") REFERENCES "Trampa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Informe" ("creadoEn", "id", "trampaId") SELECT "creadoEn", "id", "trampaId" FROM "Informe";
DROP TABLE "Informe";
ALTER TABLE "new_Informe" RENAME TO "Informe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
