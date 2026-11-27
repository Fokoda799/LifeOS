-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('income', 'expense', 'transfer');

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "toAccountId" TEXT,
    "categoryId" TEXT,
    "date" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_userId_date_idx" ON "transactions"("userId", "date" DESC);

-- CreateIndex
CREATE INDEX "transactions_accountId_idx" ON "transactions"("accountId");

-- CreateIndex
CREATE INDEX "transactions_toAccountId_idx" ON "transactions"("toAccountId");

-- CreateIndex
CREATE INDEX "transactions_categoryId_idx" ON "transactions"("categoryId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_amount_positive" CHECK ("amount" > 0);
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_shape" CHECK (
  ("type" = 'transfer' AND "toAccountId" IS NOT NULL AND "categoryId" IS NULL AND "toAccountId" <> "accountId")
  OR ("type" <> 'transfer' AND "toAccountId" IS NULL AND "categoryId" IS NOT NULL)
);
