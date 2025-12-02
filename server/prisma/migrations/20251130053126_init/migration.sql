-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tower" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BudgetHead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tower_id" INTEGER NOT NULL,
    CONSTRAINT "BudgetHead_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gst_number" TEXT,
    "contact_person" TEXT
);

-- CreateTable
CREATE TABLE "CostCentre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "BudgetBOA" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fiscal_year" INTEGER NOT NULL,
    "tower_id" INTEGER NOT NULL,
    "budget_head_id" INTEGER NOT NULL,
    "cost_centre_id" INTEGER NOT NULL,
    "annual_budget_amount" REAL NOT NULL,
    "remarks" TEXT,
    CONSTRAINT "BudgetBOA_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetBOA_budget_head_id_fkey" FOREIGN KEY ("budget_head_id") REFERENCES "BudgetHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetBOA_cost_centre_id_fkey" FOREIGN KEY ("cost_centre_id") REFERENCES "CostCentre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetMonthly" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budget_boa_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "budget_amount" REAL NOT NULL,
    CONSTRAINT "BudgetMonthly_budget_boa_id_fkey" FOREIGN KEY ("budget_boa_id") REFERENCES "BudgetBOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetCalculation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budget_boa_id" INTEGER NOT NULL,
    "fy25_budget" REAL,
    "fy25_actual" REAL,
    "fy26_budget_with_hike" REAL,
    "variance_to_fy25" REAL,
    "variance_to_fy26" REAL,
    CONSTRAINT "BudgetCalculation_budget_boa_id_fkey" FOREIGN KEY ("budget_boa_id") REFERENCES "BudgetBOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "po_number" TEXT NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "tower_id" INTEGER NOT NULL,
    "budget_head_id" INTEGER NOT NULL,
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
    CONSTRAINT "PO_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PO_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LineItem" (
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
    "is_renewal" BOOLEAN NOT NULL DEFAULT false,
    "unit_cost" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_cost" REAL NOT NULL,
    "fy25_allocation_amount" REAL,
    "remarks" TEXT,
    CONSTRAINT "LineItem_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PO" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LineItem_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LineItem_budget_head_id_fkey" FOREIGN KEY ("budget_head_id") REFERENCES "BudgetHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActualsBOA" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fiscal_year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "tower_id" INTEGER NOT NULL,
    "budget_head_id" INTEGER NOT NULL,
    "cost_centre_id" INTEGER NOT NULL,
    "actual_amount" REAL NOT NULL,
    "remarks" TEXT,
    CONSTRAINT "ActualsBOA_tower_id_fkey" FOREIGN KEY ("tower_id") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsBOA_budget_head_id_fkey" FOREIGN KEY ("budget_head_id") REFERENCES "BudgetHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsBOA_cost_centre_id_fkey" FOREIGN KEY ("cost_centre_id") REFERENCES "CostCentre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActualsBasis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actual_boa_id" INTEGER NOT NULL,
    "line_item_id" INTEGER,
    "allocation_percentage" REAL,
    "allocated_amount" REAL NOT NULL,
    CONSTRAINT "ActualsBasis_actual_boa_id_fkey" FOREIGN KEY ("actual_boa_id") REFERENCES "ActualsBOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsBasis_line_item_id_fkey" FOREIGN KEY ("line_item_id") REFERENCES "LineItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActualsCalculation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budget_boa_id" INTEGER NOT NULL,
    "actuals_boa_id" INTEGER NOT NULL,
    "variance_amount" REAL NOT NULL,
    "variance_percentage" REAL NOT NULL,
    "run_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActualsCalculation_budget_boa_id_fkey" FOREIGN KEY ("budget_boa_id") REFERENCES "BudgetBOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActualsCalculation_actuals_boa_id_fkey" FOREIGN KEY ("actuals_boa_id") REFERENCES "ActualsBOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_id_key" ON "UserRole"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "CostCentre_code_key" ON "CostCentre"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCalculation_budget_boa_id_key" ON "BudgetCalculation"("budget_boa_id");

-- CreateIndex
CREATE UNIQUE INDEX "PO_po_number_key" ON "PO"("po_number");

-- CreateIndex
CREATE UNIQUE INDEX "LineItem_uid_key" ON "LineItem"("uid");
