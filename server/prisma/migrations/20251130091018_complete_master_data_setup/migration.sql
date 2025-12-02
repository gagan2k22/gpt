-- CreateTable
CREATE TABLE "POEntity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AllocationBasis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActualsBOA" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fiscal_year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "tower_id" INTEGER NOT NULL,
    "budget_head_id" INTEGER NOT NULL,
    "cost_centre_id" INTEGER NOT NULL,
    "allocation_basis_id" INTEGER,
    "actual_amount" REAL NOT NULL,
    "remarks" TEXT,
    CONSTRAINT "ActualsBOA_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsBOA_budget_head_id_fkey" FOREIGN KEY ("budget_head_id") REFERENCES "BudgetHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsBOA_cost_centre_id_fkey" FOREIGN KEY ("cost_centre_id") REFERENCES "CostCentre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsBOA_allocation_basis_id_fkey" FOREIGN KEY ("allocation_basis_id") REFERENCES "AllocationBasis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ActualsBOA" ("actual_amount", "budget_head_id", "cost_centre_id", "fiscal_year", "id", "month", "remarks", "tower_id") SELECT "actual_amount", "budget_head_id", "cost_centre_id", "fiscal_year", "id", "month", "remarks", "tower_id" FROM "ActualsBOA";
DROP TABLE "ActualsBOA";
ALTER TABLE "new_ActualsBOA" RENAME TO "ActualsBOA";
CREATE UNIQUE INDEX "ActualsBOA_fiscal_year_month_tower_id_budget_head_id_cost_centre_id_key" ON "ActualsBOA"("fiscal_year", "month", "tower_id", "budget_head_id", "cost_centre_id");
CREATE TABLE "new_BudgetBOA" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fiscal_year" INTEGER NOT NULL,
    "tower_id" INTEGER NOT NULL,
    "budget_head_id" INTEGER NOT NULL,
    "cost_centre_id" INTEGER NOT NULL,
    "allocation_basis_id" INTEGER,
    "annual_budget_amount" REAL NOT NULL,
    "remarks" TEXT,
    CONSTRAINT "BudgetBOA_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetBOA_budget_head_id_fkey" FOREIGN KEY ("budget_head_id") REFERENCES "BudgetHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetBOA_cost_centre_id_fkey" FOREIGN KEY ("cost_centre_id") REFERENCES "CostCentre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetBOA_allocation_basis_id_fkey" FOREIGN KEY ("allocation_basis_id") REFERENCES "AllocationBasis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BudgetBOA" ("annual_budget_amount", "budget_head_id", "cost_centre_id", "fiscal_year", "id", "remarks", "tower_id") SELECT "annual_budget_amount", "budget_head_id", "cost_centre_id", "fiscal_year", "id", "remarks", "tower_id" FROM "BudgetBOA";
DROP TABLE "BudgetBOA";
ALTER TABLE "new_BudgetBOA" RENAME TO "BudgetBOA";
CREATE UNIQUE INDEX "BudgetBOA_fiscal_year_tower_id_budget_head_id_cost_centre_id_key" ON "BudgetBOA"("fiscal_year", "tower_id", "budget_head_id", "cost_centre_id");
CREATE TABLE "new_LineItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uid" TEXT NOT NULL,
    "parent_uid" TEXT,
    "po_id" INTEGER,
    "vendor_id" INTEGER NOT NULL,
    "service_description" TEXT NOT NULL,
    "service_start_date" DATETIME,
    "service_end_date" DATETIME,
    "tower_id" INTEGER NOT NULL,
    "budget_head_id" INTEGER NOT NULL,
    "po_entity_id" INTEGER,
    "service_type_id" INTEGER,
    "allocation_basis_id" INTEGER,
    "is_renewal" BOOLEAN NOT NULL DEFAULT false,
    "unit_cost" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_cost" REAL NOT NULL,
    "fy25_allocation_amount" REAL,
    "remarks" TEXT,
    CONSTRAINT "LineItem_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PO" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LineItem_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LineItem_budget_head_id_fkey" FOREIGN KEY ("budget_head_id") REFERENCES "BudgetHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LineItem_po_entity_id_fkey" FOREIGN KEY ("po_entity_id") REFERENCES "POEntity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "ServiceType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_allocation_basis_id_fkey" FOREIGN KEY ("allocation_basis_id") REFERENCES "AllocationBasis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LineItem" ("budget_head_id", "fy25_allocation_amount", "id", "is_renewal", "parent_uid", "po_id", "quantity", "remarks", "service_description", "service_end_date", "service_start_date", "total_cost", "tower_id", "uid", "unit_cost", "vendor_id") SELECT "budget_head_id", "fy25_allocation_amount", "id", "is_renewal", "parent_uid", "po_id", "quantity", "remarks", "service_description", "service_end_date", "service_start_date", "total_cost", "tower_id", "uid", "unit_cost", "vendor_id" FROM "LineItem";
DROP TABLE "LineItem";
ALTER TABLE "new_LineItem" RENAME TO "LineItem";
CREATE UNIQUE INDEX "LineItem_uid_key" ON "LineItem"("uid");
CREATE TABLE "new_PO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "po_number" TEXT NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "tower_id" INTEGER NOT NULL,
    "budget_head_id" INTEGER NOT NULL,
    "po_entity_id" INTEGER,
    "po_date" DATETIME NOT NULL,
    "po_start_date" DATETIME,
    "po_end_date" DATETIME,
    "total_po_value" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "created_by_id" INTEGER NOT NULL,
    "approved_by_id" INTEGER,
    "approval_date" DATETIME,
    "remarks" TEXT,
    CONSTRAINT "PO_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PO_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PO_budget_head_id_fkey" FOREIGN KEY ("budget_head_id") REFERENCES "BudgetHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PO_po_entity_id_fkey" FOREIGN KEY ("po_entity_id") REFERENCES "POEntity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PO_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PO_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PO" ("approval_date", "approved_by_id", "budget_head_id", "created_by_id", "currency", "id", "po_date", "po_end_date", "po_number", "po_start_date", "remarks", "status", "total_po_value", "tower_id", "vendor_id") SELECT "approval_date", "approved_by_id", "budget_head_id", "created_by_id", "currency", "id", "po_date", "po_end_date", "po_number", "po_start_date", "remarks", "status", "total_po_value", "tower_id", "vendor_id" FROM "PO";
DROP TABLE "PO";
ALTER TABLE "new_PO" RENAME TO "PO";
CREATE UNIQUE INDEX "PO_po_number_key" ON "PO"("po_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "POEntity_name_key" ON "POEntity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_name_key" ON "ServiceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AllocationBasis_name_key" ON "AllocationBasis"("name");
