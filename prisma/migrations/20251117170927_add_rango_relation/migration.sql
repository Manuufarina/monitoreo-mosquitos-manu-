/*
  Warnings:

  - You are about to drop the column `permisos` on the `Usuario` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Rango" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "reglas" JSONB,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rangoId" INTEGER,
    CONSTRAINT "Usuario_rangoId_fkey" FOREIGN KEY ("rangoId") REFERENCES "Rango" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Usuario" ("creadoEn", "email", "id", "nombre", "password") SELECT "creadoEn", "email", "id", "nombre", "password" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Rango_nombre_key" ON "Rango"("nombre");
