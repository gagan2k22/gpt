-- DropIndex
DROP INDEX "LineItem_uid_key";

-- CreateTable
CREATE TABLE "CurrencyRate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "from_currency" TEXT NOT NULL,
    "to_currency" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "effective_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "CurrencyRate_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActualBOAData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendor_service" TEXT NOT NULL,
    "fiscal_year" TEXT NOT NULL,
    "basis_of_allocation" TEXT,
    "total_count" REAL,
    "jpm_corporate" REAL,
    "jphi_corporate" REAL,
    "biosys_bengaluru" REAL,
    "biosys_noida" REAL,
    "biosys_greater_noida" REAL,
    "pharmova_api" REAL,
    "jgl_dosage" REAL,
    "jgl_ibp" REAL,
    "cadista_dosage" REAL,
    "jdi_radio_pharmaceuticals" REAL,
    "jdi_radiopharmacies" REAL,
    "jhs_gp_cmo" REAL,
    "jhs_llc_cmo" REAL,
    "jhs_llc_allergy" REAL,
    "ingrevia" REAL,
    "jil_jacpl" REAL,
    "jfl" REAL,
    "consumer" REAL,
    "jti" REAL,
    "jogpl" REAL,
    "enpro" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BudgetBOAData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendor_service" TEXT NOT NULL,
    "basis_of_allocation" TEXT,
    "total_count" REAL,
    "jpm_corporate" REAL,
    "jphi_corporate" REAL,
    "biosys_bengaluru" REAL,
    "biosys_noida" REAL,
    "biosys_greater_noida" REAL,
    "pharmova_api" REAL,
    "jgl_dosage" REAL,
    "jgl_ibp" REAL,
    "cadista_dosage" REAL,
    "jdi_radio_pharmaceuticals" REAL,
    "jdi_radiopharmacies" REAL,
    "jhs_gp_cmo" REAL,
    "jhs_llc_cmo" REAL,
    "jhs_llc_allergy" REAL,
    "ingrevia" REAL,
    "jil_jacpl" REAL,
    "jfl" REAL,
    "consumer" REAL,
    "jti" REAL,
    "jogpl" REAL,
    "enpro" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "CurrencyRate_from_currency_to_currency_idx" ON "CurrencyRate"("from_currency", "to_currency");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_from_currency_to_currency_key" ON "CurrencyRate"("from_currency", "to_currency");
