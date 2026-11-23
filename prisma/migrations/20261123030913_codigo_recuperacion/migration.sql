-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PasswordReset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeHash" TEXT NOT NULL DEFAULT '',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PasswordReset" ("createdAt", "expiresAt", "id", "usedAt", "userId") SELECT "createdAt", "expiresAt", "id", "usedAt", "userId" FROM "PasswordReset";
DROP TABLE "PasswordReset";
ALTER TABLE "new_PasswordReset" RENAME TO "PasswordReset";
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
