-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('NOT_INSPECTED', 'GOOD', 'FAIR', 'NEEDS_SERVICE');

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionItem" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "condition" "ItemCondition" NOT NULL DEFAULT 'NOT_INSPECTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionPhoto" (
    "id" TEXT NOT NULL,
    "inspectionItemId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_workOrderId_key" ON "Inspection"("workOrderId");
CREATE INDEX "InspectionItem_inspectionId_idx" ON "InspectionItem"("inspectionId");
CREATE UNIQUE INDEX "InspectionItem_inspectionId_category_name_key" ON "InspectionItem"("inspectionId", "category", "name");
CREATE INDEX "InspectionPhoto_inspectionItemId_idx" ON "InspectionPhoto"("inspectionItemId");

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InspectionItem" ADD CONSTRAINT "InspectionItem_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InspectionPhoto" ADD CONSTRAINT "InspectionPhoto_inspectionItemId_fkey" FOREIGN KEY ("inspectionItemId") REFERENCES "InspectionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
