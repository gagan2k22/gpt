# Comprehensive Implementation Plan - Remaining Work

## 📋 Overview

This document outlines the complete implementation plan for all remaining features to make the OPEX Management System fully functional without Excel dependency.

---

## 🎯 Implementation Phases

### **Phase 1: Budget Detail & Line Item Management** (Priority: HIGH)
**Estimated Time**: 2-3 days

#### 1.1 Budget Line Detail Page
**Route**: `/budgets/:uid`
**Purpose**: Complete drilldown for a single UID

**Components**:
- `client/src/pages/BudgetDetail.jsx`
- `client/src/components/BudgetDetailTabs.jsx`
- `client/src/components/MonthlyVarianceChart.jsx`

**Backend**:
- `server/src/controllers/budgetDetail.controller.js`
- `server/src/services/budgetDetail.service.js`

**API Endpoints**:
```
GET /api/budgets/:uid/detail
Response: {
  lineItem: LineItem,
  monthlyBudgets: BudgetMonth[],
  monthlyActuals: { month: string, amount: number }[],
  linkedPOs: PO[],
  variance: { monthly: {}, cumulative: number },
  auditHistory: AuditLog[]
}
```

**Features**:
- Monthly budget vs actual comparison
- Linked POs display
- Variance visualization (chart)
- Audit history timeline
- Reconciliation notes
- Edit monthly budgets inline

---

### **Phase 2: PO Management (Complete Forms)** (Priority: CRITICAL)
**Estimated Time**: 3-4 days

#### 2.1 PO Create/Edit Forms
**Routes**: `/pos/new`, `/pos/:id/edit`, `/pos/:id`

**Components**:
- `client/src/pages/POForm.jsx` (unified create/edit)
- `client/src/components/POLineItemSelector.jsx`
- `client/src/components/CurrencyConverter.jsx`

**Backend**:
- `server/src/controllers/po.controller.js` (enhanced)
- `server/src/services/po.service.js`
- `server/src/models/POLineItem.js` (link table)

**Database Changes**:
```prisma
model POLineItem {
  id          Int      @id @default(autoincrement())
  po_id       Int
  line_item_id Int
  allocated_amount Decimal @db.Decimal(18,2)
  
  po          PO       @relation(fields: [po_id], references: [id])
  lineItem    LineItem @relation(fields: [line_item_id], references: [id])
  
  @@unique([po_id, line_item_id])
}
```

**API Endpoints**:
```
POST /api/pos
Body: {
  poNumber, poDate, vendorId, currency, poValue,
  linkedUIDs: [{ uid, allocatedAmount }]
}
Response: { po: PO, commonCurrencyValue, valueInLac }

PUT /api/pos/:id
PATCH /api/pos/:id/status (approve/reject)
GET /api/pos/:id/linked-items
```

**Business Logic**:
- Auto-calculate `commonCurrencyValue = poValue * exchangeRate`
- Auto-calculate `valueInLac = commonCurrencyValue / 100000`
- Validate linked UIDs exist
- Optional: Reserve amounts on LineItems
- Prevent duplicate PO linking (configurable)

---

### **Phase 3: Actuals Management** (Priority: CRITICAL)
**Estimated Time**: 3-4 days

#### 3.1 Actuals Manual Entry
**Route**: `/actuals/new`

**Components**:
- `client/src/pages/ActualForm.jsx`
- `client/src/components/ActualLineItemMatcher.jsx`

**API Endpoints**:
```
POST /api/actuals
Body: {
  invoiceNo, invoiceDate, amount, currency,
  lineItemId, vendorId, remarks
}
Response: {
  actual: Actual,
  month: 'Jan'|'Feb'|...,
  convertedAmount,
  lineItemVariance
}
```

**Business Logic**:
- Auto-assign `month` from `invoiceDate` (e.g., 2025-04-10 → Apr)
- Calculate `convertedAmount` using exchange rates
- Recompute LineItem variance
- Flag if actuals > budget

#### 3.2 Actuals Import
**Route**: `/actuals/import`

**Components**:
- `client/src/components/ActualsImportModal.jsx`

**Backend**:
- `server/src/controllers/actualsImport.controller.js`
- `server/src/services/actualsImport.service.js`

**API Endpoints**:
```
POST /api/actuals/import?dryRun=true|false
Body: FormData (Excel file)
Response: {
  dryRun: true,
  report: { accepted: [], rejected: [] },
  headerMapping: {}
}
```

**Excel Format**:
```
Invoice No | Invoice Date | Amount | Currency | UID | Vendor | Remarks
INV-001    | 2025-04-15  | 5000   | INR      | UID-001 | Vendor A | Payment
```

**Features**:
- Auto-match UID to LineItem
- Suggest matches for unmatched invoices
- Prorate option for multi-month invoices
- Bulk import with validation

#### 3.3 Actuals Reconciliation
**Route**: `/actuals/reconcile`

**Components**:
- `client/src/pages/ActualsReconciliation.jsx`
- `client/src/components/UnmatchedActualsTable.jsx`

**Features**:
- Show unmatched actuals
- Suggest LineItem matches (by vendor, description)
- Manual linking UI
- Bulk reconciliation

---

### **Phase 4: Reports & Analytics** (Priority: HIGH)
**Estimated Time**: 2-3 days

#### 4.1 Reports Dashboard
**Route**: `/reports`

**Components**:
- `client/src/pages/ReportsPage.jsx`
- `client/src/components/ReportCard.jsx`

**Sub-Routes**:
- `/reports/summary` - FY summary
- `/reports/variance` - Variance heatmap
- `/reports/tower` - Tower-wise spend
- `/reports/monthly` - Monthly trend

#### 4.2 Backend Reports Service
**Backend**:
- `server/src/controllers/reports.controller.js`
- `server/src/services/reports.service.js`

**API Endpoints**:
```
GET /api/reports/summary?fy=2025
Response: {
  totalBudget, totalActuals, totalVariance,
  utilizationRate, byTower: [], byBudgetHead: []
}

GET /api/reports/variance?fy=2025
Response: {
  monthlyVariance: [
    { month: 'Jan', budget: 100, actual: 90, variance: 10 }
  ],
  heatmapData: []
}

GET /api/reports/export?type=summary&format=excel|pdf
Response: File download
```

**Features**:
- Aggregated queries (no full table scans)
- Cached results for performance
- Excel/PDF export
- Drill-down capability

---

### **Phase 5: Import History & Audit** (Priority: MEDIUM)
**Estimated Time**: 2 days

#### 5.1 Import History Page
**Route**: `/imports`

**Components**:
- `client/src/pages/ImportHistory.jsx`
- `client/src/components/ImportJobCard.jsx`

**Database Changes**:
```prisma
model ImportJob {
  id          Int      @id @default(autoincrement())
  userId      Int
  filename    String
  fileSize    Int
  rowsTotal   Int
  rowsAccepted Int
  rowsRejected Int
  status      String   // 'pending', 'completed', 'failed'
  importType  String   // 'budgets', 'actuals'
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}
```

**API Endpoints**:
```
GET /api/imports
Response: { imports: ImportJob[] }

GET /api/imports/:id
Response: { import: ImportJob, details: [] }

POST /api/imports/:id/rollback
Response: { success: true, rowsDeleted: 128 }
```

**Features**:
- List all imports with metadata
- View rejected rows
- Download original file
- Rollback import (admin only)
- Audit trail

---

### **Phase 6: Fiscal Year Management UI** (Priority: LOW)
**Estimated Time**: 1 day

#### 6.1 Fiscal Year CRUD
**Route**: `/settings/fiscal-years`

**Components**:
- `client/src/pages/FiscalYearManagement.jsx`

**API Endpoints** (already exist):
```
GET /api/fiscal-years
POST /api/fiscal-years
PUT /api/fiscal-years/:id
DELETE /api/fiscal-years/:id
```

**Features**:
- Create new fiscal years
- Set active fiscal year
- Edit start/end dates
- Validation (no overlapping dates)

---

### **Phase 7: Bulk Operations & Advanced Features** (Priority: MEDIUM)
**Estimated Time**: 2-3 days

#### 7.1 Bulk Edit Endpoint
**API Endpoints**:
```
PATCH /api/budgets/bulk
Body: {
  updates: [
    { uid: 'UID-001', monthlyData: { Jan: 1000, Feb: 1500 } },
    { uid: 'UID-002', monthlyData: { Jan: 2000, Feb: 2500 } }
  ]
}
Response: { updated: 2, failed: 0 }
```

#### 7.2 Saved Views & Filters
**Components**:
- `client/src/components/SavedViewsDropdown.jsx`

**Database**:
```prisma
model SavedView {
  id        Int      @id @default(autoincrement())
  userId    Int
  name      String
  filters   Json
  page      String   // 'budgets', 'pos', 'actuals'
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
}
```

#### 7.3 Background Job Queue
**Purpose**: Handle large imports asynchronously

**Technology**: Bull + Redis

**Implementation**:
- `server/src/jobs/importJob.js`
- `server/src/jobs/reportJob.js`

**API Endpoints**:
```
GET /api/jobs/:jobId/status
Response: { status: 'processing', progress: 45 }
```

---

## 📊 Database Schema Additions

### New Models Needed

```prisma
// Link table for PO to LineItems
model POLineItem {
  id               Int      @id @default(autoincrement())
  po_id            Int
  line_item_id     Int
  allocated_amount Decimal  @db.Decimal(18,2)
  
  po               PO       @relation(fields: [po_id], references: [id], onDelete: Cascade)
  lineItem         LineItem @relation(fields: [line_item_id], references: [id])
  
  @@unique([po_id, line_item_id])
  @@index([po_id])
  @@index([line_item_id])
}

// Import job tracking
model ImportJob {
  id            Int      @id @default(autoincrement())
  userId        Int
  filename      String
  fileSize      Int
  rowsTotal     Int
  rowsAccepted  Int
  rowsRejected  Int
  status        String   @default("pending")
  importType    String   // 'budgets', 'actuals'
  metadata      Json?
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
}

// Saved views for filters
model SavedView {
  id        Int      @id @default(autoincrement())
  userId    Int
  name      String
  filters   Json
  page      String
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, name, page])
}

// Reconciliation notes
model ReconciliationNote {
  id           Int      @id @default(autoincrement())
  lineItemId   Int
  actualId     Int?
  note         String
  createdBy    Int
  createdAt    DateTime @default(now())
  
  lineItem     LineItem @relation(fields: [lineItemId], references: [id])
  actual       Actual?  @relation(fields: [actualId], references: [id])
  user         User     @relation(fields: [createdBy], references: [id])
}
```

---

## 🔐 Security & Permissions

### New Permissions Needed

```javascript
const PERMISSIONS = {
  // Existing
  VIEW_DASHBOARDS: ['Viewer', 'Editor', 'Approver', 'Admin'],
  CREATE_LINE_ITEMS: ['Editor', 'Approver', 'Admin'],
  EDIT_LINE_ITEMS: ['Editor', 'Approver', 'Admin'],
  
  // New
  APPROVE_PO: ['Approver', 'Admin'],
  REJECT_PO: ['Approver', 'Admin'],
  POST_ACTUALS: ['Editor', 'Approver', 'Admin'],
  RECONCILE_ACTUALS: ['Editor', 'Approver', 'Admin'],
  VIEW_REPORTS: ['Viewer', 'Editor', 'Approver', 'Admin'],
  EXPORT_REPORTS: ['Editor', 'Approver', 'Admin'],
  ROLLBACK_IMPORTS: ['Admin'],
  MANAGE_FISCAL_YEARS: ['Admin']
};
```

---

## 🧪 Testing Strategy

### Unit Tests
- Month normalization
- Variance calculations
- Currency conversion
- Total budget calculations

### Integration Tests
- Import flow (dry-run → commit)
- PO creation with UID linking
- Actuals posting and variance update
- Report generation

### E2E Tests (Playwright/Cypress)
- Complete import workflow
- Budget editing and saving
- PO approval workflow
- Actuals reconciliation

---

## 📈 Performance Optimizations

### Database Indexes
```sql
CREATE INDEX idx_budget_month_line_item ON BudgetMonth(lineItemId);
CREATE INDEX idx_actual_line_item_month ON Actual(lineItemId, month);
CREATE INDEX idx_po_line_item ON POLineItem(line_item_id);
CREATE INDEX idx_line_item_uid ON LineItem(uid);
```

### Caching Strategy
- Redis cache for master data (Towers, BudgetHeads)
- Cache report results for 5 minutes
- Invalidate cache on data updates

### Query Optimization
- Use aggregation pipelines for reports
- Pagination for large lists (100 items/page)
- Lazy loading for detail views
- Virtualization for grids (>1000 rows)

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Run all migrations
- [ ] Seed master data
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Performance testing

### Deployment
- [ ] Backup database
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Run smoke tests
- [ ] Monitor logs

### Post-Deployment
- [ ] Verify imports working
- [ ] Check report generation
- [ ] Test PO workflow
- [ ] Monitor performance metrics

---

## 📅 Implementation Timeline

### Week 1
- **Days 1-2**: Budget Detail Page
- **Days 3-5**: PO Create/Edit Forms

### Week 2
- **Days 1-3**: Actuals Management (Entry + Import)
- **Days 4-5**: Actuals Reconciliation

### Week 3
- **Days 1-2**: Reports Dashboard
- **Days 3-4**: Import History & Audit
- **Day 5**: Fiscal Year Management UI

### Week 4
- **Days 1-2**: Bulk Operations
- **Days 3-4**: Testing & Bug Fixes
- **Day 5**: Documentation & Deployment

---

## 📚 File Structure (Complete)

```
server/
├── src/
│   ├── controllers/
│   │   ├── budgetDetail.controller.js       ⭐ NEW
│   │   ├── po.controller.js                 ✏️ ENHANCE
│   │   ├── actualsImport.controller.js      ⭐ NEW
│   │   ├── reports.controller.js            ⭐ NEW
│   │   ├── imports.controller.js            ⭐ NEW
│   │   └── savedViews.controller.js         ⭐ NEW
│   ├── services/
│   │   ├── budgetDetail.service.js          ⭐ NEW
│   │   ├── po.service.js                    ⭐ NEW
│   │   ├── actualsImport.service.js         ⭐ NEW
│   │   ├── reports.service.js               ⭐ NEW
│   │   └── reconciliation.service.js        ⭐ NEW
│   ├── jobs/
│   │   ├── importJob.js                     ⭐ NEW
│   │   └── reportJob.js                     ⭐ NEW
│   └── routes/
│       ├── budgetDetail.routes.js           ⭐ NEW
│       ├── po.routes.js                     ✏️ ENHANCE
│       ├── actuals.routes.js                ✏️ ENHANCE
│       ├── reports.routes.js                ⭐ NEW
│       └── imports.routes.js                ⭐ NEW
└── prisma/
    └── schema.prisma                        ✏️ ADD MODELS

client/
└── src/
    ├── pages/
    │   ├── BudgetDetail.jsx                 ⭐ NEW
    │   ├── POForm.jsx                       ⭐ NEW
    │   ├── ActualForm.jsx                   ⭐ NEW
    │   ├── ActualsReconciliation.jsx        ⭐ NEW
    │   ├── ReportsPage.jsx                  ⭐ NEW
    │   ├── ImportHistory.jsx                ⭐ NEW
    │   └── FiscalYearManagement.jsx         ⭐ NEW
    └── components/
        ├── BudgetDetailTabs.jsx             ⭐ NEW
        ├── MonthlyVarianceChart.jsx         ⭐ NEW
        ├── POLineItemSelector.jsx           ⭐ NEW
        ├── CurrencyConverter.jsx            ⭐ NEW
        ├── ActualLineItemMatcher.jsx        ⭐ NEW
        ├── ActualsImportModal.jsx           ⭐ NEW
        ├── UnmatchedActualsTable.jsx        ⭐ NEW
        ├── ReportCard.jsx                   ⭐ NEW
        ├── ImportJobCard.jsx                ⭐ NEW
        └── SavedViewsDropdown.jsx           ⭐ NEW
```

---

## 🎯 Success Metrics

### Functional
- ✅ All imports work without Excel dependency
- ✅ Variance calculations accurate
- ✅ PO workflow complete
- ✅ Reports match Excel outputs

### Performance
- ✅ Import <30s for 5k rows
- ✅ Reports load <3s
- ✅ Grid renders <1s for 1k rows

### User Experience
- ✅ Intuitive navigation
- ✅ Clear error messages
- ✅ Responsive design
- ✅ Keyboard shortcuts

---

**Status**: 📋 **PLAN READY - READY TO START IMPLEMENTATION**

**Next Action**: Begin with Phase 1 (Budget Detail Page) or specify which phase to start with.
