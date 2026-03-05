/*
  Warnings:

  - The primary key for the `competent_authorities` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "hs_ca_control" DROP CONSTRAINT "hs_ca_control_ca_code_fkey";

-- DropForeignKey
ALTER TABLE "product_ca_control" DROP CONSTRAINT "product_ca_control_ca_code_fkey";

-- AlterTable
ALTER TABLE "competent_authorities" DROP CONSTRAINT "competent_authorities_pkey",
ALTER COLUMN "ca_code" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "competent_authorities_pkey" PRIMARY KEY ("ca_code");

-- AlterTable
ALTER TABLE "hs_ca_control" ALTER COLUMN "ca_code" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "product_ca_control" ALTER COLUMN "ca_code" SET DATA TYPE VARCHAR(100);

-- AddForeignKey
ALTER TABLE "hs_ca_control" ADD CONSTRAINT "hs_ca_control_ca_code_fkey" FOREIGN KEY ("ca_code") REFERENCES "competent_authorities"("ca_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ca_control" ADD CONSTRAINT "product_ca_control_ca_code_fkey" FOREIGN KEY ("ca_code") REFERENCES "competent_authorities"("ca_code") ON DELETE CASCADE ON UPDATE CASCADE;
