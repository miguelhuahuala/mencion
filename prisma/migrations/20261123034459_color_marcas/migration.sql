-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "color" TEXT NOT NULL DEFAULT '#2a78d6',
    "competitors" TEXT NOT NULL DEFAULT '[]',
    "country" TEXT NOT NULL DEFAULT 'PE',
    "language" TEXT NOT NULL DEFAULT 'es',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("aliases", "competitors", "country", "createdAt", "domain", "id", "isDemo", "language", "name", "userId") SELECT "aliases", "competitors", "country", "createdAt", "domain", "id", "isDemo", "language", "name", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE INDEX "Project_userId_idx" ON "Project"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
