-- CreateTable
CREATE TABLE "nfse_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "xml" TEXT NOT NULL,
    "business_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nfse_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfse_emissions" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "competence" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "dps_id" TEXT,
    "signed_xml" TEXT,
    "access_key" TEXT,
    "response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfse_emissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nfse_templates_user_id_name_key" ON "nfse_templates"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "nfse_templates_user_id_business_key_key" ON "nfse_templates"("user_id", "business_key");

-- CreateIndex
CREATE UNIQUE INDEX "nfse_emissions_number_key" ON "nfse_emissions"("number");

-- CreateIndex
CREATE INDEX "nfse_emissions_user_id_created_at_idx" ON "nfse_emissions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "nfse_emissions_template_id_competence_key" ON "nfse_emissions"("template_id", "competence");

-- AddForeignKey
ALTER TABLE "nfse_templates" ADD CONSTRAINT "nfse_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfse_emissions" ADD CONSTRAINT "nfse_emissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfse_emissions" ADD CONSTRAINT "nfse_emissions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "nfse_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "nfse_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nfse_emissions" ENABLE ROW LEVEL SECURITY;
