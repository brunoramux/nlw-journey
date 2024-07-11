/*
  Warnings:

  - You are about to drop the column `accours_at` on the `activities` table. All the data in the column will be lost.
  - Added the required column `accurs_at` to the `activities` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "accurs_at" DATETIME NOT NULL,
    "trip_id" TEXT NOT NULL,
    CONSTRAINT "activities_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_activities" ("id", "title", "trip_id") SELECT "id", "title", "trip_id" FROM "activities";
DROP TABLE "activities";
ALTER TABLE "new_activities" RENAME TO "activities";
CREATE UNIQUE INDEX "activities_id_key" ON "activities"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
