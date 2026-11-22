-- CreateEnum
CREATE TYPE "ToolId" AS ENUM ('money', 'tasks', 'training');

-- CreateTable
CREATE TABLE "user_tools" (
    "userId" TEXT NOT NULL,
    "toolId" "ToolId" NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "user_tools_pkey" PRIMARY KEY ("userId","toolId")
);

-- AddForeignKey
ALTER TABLE "user_tools" ADD CONSTRAINT "user_tools_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
