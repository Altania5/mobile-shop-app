-- AlterTable: add squareOrderId to Invoice for webhook matching
ALTER TABLE "Invoice" ADD COLUMN "squareOrderId" TEXT;
