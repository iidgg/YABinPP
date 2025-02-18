-- CreateTable
CREATE TABLE "TwoFA" (
    "id" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "secret" TEXT NOT NULL,
    "uri" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TwoFA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwoFA_userId_type_key" ON "TwoFA"("userId", "type");

-- AddForeignKey
ALTER TABLE "TwoFA" ADD CONSTRAINT "TwoFA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
