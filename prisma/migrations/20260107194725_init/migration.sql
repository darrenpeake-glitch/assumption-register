-- CreateEnum
CREATE TYPE "AssumptionArea" AS ENUM ('CUSTOMER', 'PROBLEM', 'SOLUTION', 'CHANNEL', 'PRICING', 'OPS', 'OTHER');

-- CreateEnum
CREATE TYPE "AssumptionStatus" AS ENUM ('UNTESTED', 'TESTING', 'VALIDATED', 'INVALIDATED', 'PARKED');

-- CreateTable
CREATE TABLE "Assumption" (
    "id" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "area" "AssumptionArea" NOT NULL,
    "risk" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "status" "AssumptionStatus" NOT NULL DEFAULT 'UNTESTED',
    "testPlan" TEXT,
    "decisionNote" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "assumptionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evidence_assumptionId_createdAt_idx" ON "Evidence"("assumptionId", "createdAt");

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_assumptionId_fkey" FOREIGN KEY ("assumptionId") REFERENCES "Assumption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
