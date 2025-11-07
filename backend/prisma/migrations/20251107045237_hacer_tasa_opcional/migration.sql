/*
  Warnings:

  - Made the column `tasaInteres` on table `solicitudes_cdt` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "solicitudes_cdt" ALTER COLUMN "tasaInteres" SET NOT NULL,
ALTER COLUMN "tasaInteres" SET DEFAULT 0;
