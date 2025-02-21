-- CreateTable
CREATE TABLE "AuthTicket" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "mfaId" TEXT NOT NULL,

    CONSTRAINT "AuthTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthTicket_token_key" ON "AuthTicket"("token");

-- AddForeignKey
ALTER TABLE "AuthTicket" ADD CONSTRAINT "AuthTicket_mfaId_fkey" FOREIGN KEY ("mfaId") REFERENCES "mfa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
