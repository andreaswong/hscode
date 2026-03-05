-- CreateTable
CREATE TABLE "hs_codes" (
    "hs_code" VARCHAR(10) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(100),
    "chapter" VARCHAR(2),
    "heading" VARCHAR(4),
    "subheading" VARCHAR(6),
    "is_dutiable" BOOLEAN NOT NULL DEFAULT false,
    "duty_rate" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_codes_pkey" PRIMARY KEY ("hs_code")
);

-- CreateTable
CREATE TABLE "product_codes" (
    "product_code" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_codes_pkey" PRIMARY KEY ("product_code")
);

-- CreateTable
CREATE TABLE "competent_authorities" (
    "ca_code" VARCHAR(10) NOT NULL,
    "ca_name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "contact_info" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competent_authorities_pkey" PRIMARY KEY ("ca_code")
);

-- CreateTable
CREATE TABLE "hs_product_mapping" (
    "id" SERIAL NOT NULL,
    "hs_code" VARCHAR(10) NOT NULL,
    "product_code" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_product_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hs_ca_control" (
    "id" SERIAL NOT NULL,
    "hs_code" VARCHAR(10) NOT NULL,
    "ca_code" VARCHAR(10) NOT NULL,
    "control_type" VARCHAR(50),
    "requirements" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_ca_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_ca_control" (
    "id" SERIAL NOT NULL,
    "product_code" VARCHAR(20) NOT NULL,
    "ca_code" VARCHAR(10) NOT NULL,
    "control_type" VARCHAR(50),
    "requirements" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_ca_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_pairs" (
    "id" SERIAL NOT NULL,
    "product_code_1" VARCHAR(20) NOT NULL,
    "product_code_2" VARCHAR(20) NOT NULL,
    "relationship_type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "parent_category_id" INTEGER,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hs_codes_category_idx" ON "hs_codes"("category");

-- CreateIndex
CREATE INDEX "hs_codes_is_dutiable_idx" ON "hs_codes"("is_dutiable");

-- CreateIndex
CREATE INDEX "hs_codes_chapter_idx" ON "hs_codes"("chapter");

-- CreateIndex
CREATE INDEX "product_codes_category_idx" ON "product_codes"("category");

-- CreateIndex
CREATE INDEX "hs_product_mapping_hs_code_idx" ON "hs_product_mapping"("hs_code");

-- CreateIndex
CREATE INDEX "hs_product_mapping_product_code_idx" ON "hs_product_mapping"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "hs_product_mapping_hs_code_product_code_key" ON "hs_product_mapping"("hs_code", "product_code");

-- CreateIndex
CREATE INDEX "hs_ca_control_ca_code_idx" ON "hs_ca_control"("ca_code");

-- CreateIndex
CREATE INDEX "hs_ca_control_hs_code_idx" ON "hs_ca_control"("hs_code");

-- CreateIndex
CREATE UNIQUE INDEX "hs_ca_control_hs_code_ca_code_key" ON "hs_ca_control"("hs_code", "ca_code");

-- CreateIndex
CREATE INDEX "product_ca_control_ca_code_idx" ON "product_ca_control"("ca_code");

-- CreateIndex
CREATE INDEX "product_ca_control_product_code_idx" ON "product_ca_control"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_ca_control_product_code_ca_code_key" ON "product_ca_control"("product_code", "ca_code");

-- CreateIndex
CREATE INDEX "product_pairs_product_code_1_idx" ON "product_pairs"("product_code_1");

-- CreateIndex
CREATE INDEX "product_pairs_product_code_2_idx" ON "product_pairs"("product_code_2");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- AddForeignKey
ALTER TABLE "hs_product_mapping" ADD CONSTRAINT "hs_product_mapping_hs_code_fkey" FOREIGN KEY ("hs_code") REFERENCES "hs_codes"("hs_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hs_product_mapping" ADD CONSTRAINT "hs_product_mapping_product_code_fkey" FOREIGN KEY ("product_code") REFERENCES "product_codes"("product_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hs_ca_control" ADD CONSTRAINT "hs_ca_control_hs_code_fkey" FOREIGN KEY ("hs_code") REFERENCES "hs_codes"("hs_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hs_ca_control" ADD CONSTRAINT "hs_ca_control_ca_code_fkey" FOREIGN KEY ("ca_code") REFERENCES "competent_authorities"("ca_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ca_control" ADD CONSTRAINT "product_ca_control_product_code_fkey" FOREIGN KEY ("product_code") REFERENCES "product_codes"("product_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ca_control" ADD CONSTRAINT "product_ca_control_ca_code_fkey" FOREIGN KEY ("ca_code") REFERENCES "competent_authorities"("ca_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_pairs" ADD CONSTRAINT "product_pairs_product_code_1_fkey" FOREIGN KEY ("product_code_1") REFERENCES "product_codes"("product_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_pairs" ADD CONSTRAINT "product_pairs_product_code_2_fkey" FOREIGN KEY ("product_code_2") REFERENCES "product_codes"("product_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
