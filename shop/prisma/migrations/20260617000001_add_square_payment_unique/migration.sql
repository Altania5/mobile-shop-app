-- AlterTable: make squarePaymentId unique on Payment
CREATE UNIQUE INDEX "Payment_squarePaymentId_key" ON "Payment"("squarePaymentId");
