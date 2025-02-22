-- CreateTable
CREATE TABLE "ApiToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "scopes" BIT(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_token_key" ON "ApiToken"("token");

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
