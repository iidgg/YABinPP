-- CreateTable
CREATE TABLE "mfaTicket" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "mfaId" TEXT NOT NULL,

    CONSTRAINT "mfaTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mfaTicket_token_key" ON "mfaTicket"("token");

-- AddForeignKey
ALTER TABLE "mfaTicket" ADD CONSTRAINT "mfaTicket_mfaId_fkey" FOREIGN KEY ("mfaId") REFERENCES "mfa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
