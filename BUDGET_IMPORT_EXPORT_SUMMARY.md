# Budget Import/Export Implementation Summary

## Overview
This document summarizes the implementation of the comprehensive budget import/export system with month-level granularity using 3-letter month enums (MMM format).

## Database Changes (Completed)

### Schema Updates
- **Month Enum**: Added `Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`
- **LineItem Model**: Restructured with camelCase fields (`towerId`, `budgetHeadId`, `costCentreId`, `fiscalYearId`)
- **BudgetMonth Model**: New table to store monthly budget amounts with unique constraint on `[lineItemId, month]`
- **FiscalYear Model**: Updated structure with `name`, `startDate`, `endDate`, `isActive`
- **PO Model**: Simplified structure with relations to LineItems
- **Actual Model**: New model for tracking actuals with optional month allocation
- **AuditLog Model**: Updated to track import/export operations

### Migration
- Schema synchronized using `npx prisma db push --accept-data-loss`
- Prisma client regenerated with `npx prisma generate`

## Backend Implementation (Completed)

### 1. Month Normalization Utility
**File**: `server/src/utils/monthNormaliser.js`
- Normalizes headers like "Jan-25", "January 2025", "MAR" to "Jan", "Feb", etc.
- Handles both 3-letter abbreviations and full month names
- Case-insensitive matching
- Throws clear errors for invalid month headers

### 2. Budget Import Service
**File**: `server/src/services/budgetImportService.js`

**Features**:
- **Dry-Run Mode**: Validates data without committing to database
  - Header detection and normalization
  - Row validation (UID, numeric values, total mismatch check)
  - Returns detailed report with accepted/rejected rows
  
- **Commit Mode**: Transactional import
  - Upserts LineItem records
  - Upserts BudgetMonth records for each month
  - Creates AuditLog entries for each import
  - Master data lookup (Tower, BudgetHead)
  
- **Validation Rules**:
  - UID required and unique
  - Month values must be numeric
  - Total budget must match sum of months (tolerance: 0.5)
  - Clear error messages for rejected rows

### 3. Budget Export Service
**File**: `server/src/services/budgetExportService.js`

**Templates**:
- **Upload Template**: Excel file ready for re-import
  - Columns: UID, Description, Tower, Budget Head, Jan-Dec, Total
  - Includes existing data for editing
  
- **Report Template**: Formatted report
  - Includes budget totals and metadata
  - Ready for variance analysis (when actuals are linked)

### 4. Budget Calculation Service
**File**: `server/src/services/budgetCalcService.js`

**Functions**:
- `calculateTotalBudgetForLineItem(lineItemId)`: Sums monthly amounts
- `applyActualToMonths(actual)`: Maps actuals to month enum based on invoice date
- `computeVariance(lineItemId)`: Calculates budget vs actuals variance
- `currencyConversion(amount, fromCurrency, toCurrency, date)`: Uses stored exchange rates
- `updateMonthlyBudgets(lineItemId, monthlyData)`: Bulk update monthly budgets

### 5. Controllers
**Files**: 
- `server/src/controllers/budgetImportController.js`
- `server/src/controllers/budgetExportController.js`

**Endpoints**:
- `POST /api/budgets/import?dryRun=true|false`: Import with preview or commit
- `GET /api/budgets/export?template=upload|report&fy=FY25`: Export budgets

### 6. Routes
**File**: `server/src/routes/budget.routes.js`
- Integrated multer for file uploads (memory storage)
- Added import and export routes with proper authentication and permissions

### 7. Dependencies Added
```json
{
  "exceljs": "^4.x.x",
  "multer": "^1.x.x"
}
```

## Frontend Implementation (Completed)

### Import Modal Component
**File**: `client/src/components/ImportModal.jsx`

**Features**:
- **Drag & Drop Upload**: User-friendly file selection
- **Dry-Run Preview**: 
  - Shows header mapping (raw → normalized)
  - Displays accepted/rejected rows with error details
  - Download rejected rows as CSV
  - Statistics: Total, Accepted, Rejected counts
  
- **Commit Confirmation**: 
  - Review before final import
  - Shows number of rows to be imported
  - Success/error handling with toast notifications
  
- **UI/UX**:
  - Material-UI components for consistency
  - Loading states and progress indicators
  - Color-coded chips for status (success/error)
  - Sticky table headers for long lists
  - Responsive design

## API Contract

### Import Endpoint
```
POST /api/budgets/import
Content-Type: multipart/form-data
Query Params: dryRun=true|false
Body: file (Excel .xlsx)
```

**Dry-Run Response**:
```json
{
  "dryRun": true,
  "report": {
    "totalRows": 132,
    "accepted": [
      {
        "rowIndex": 2,
        "uid": "UID-001",
        "computedMonths": { "Jan": 100, "Feb": 200 },
        "sumMonths": 300,
        "totalBudget": 300
      }
    ],
    "rejected": [
      {
        "rowIndex": 5,
        "uid": "UID-005",
        "errors": ["Missing UID", "Total mismatch"]
      }
    ]
  },
  "headerMapping": {
    "rawHeaders": ["UID", "Description", "Jan-25", "Feb-25", "Total"],
    "normalizedHeaders": ["UID", "Description", "Jan", "Feb", "Total"]
  }
}
```

**Commit Response**:
```json
{
  "success": true,
  "imported": 128,
  "details": [
    { "uid": "UID-001", "lineItemId": 23 }
  ]
}
```

### Export Endpoint
```
GET /api/budgets/export?template=upload|report&fy=FY25
Response: Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
```

## Security & Permissions

- **Import**: Requires `EDIT_BUDGET_BOA` permission
- **Export**: Requires `VIEW_DASHBOARDS` permission
- **File Validation**: Only .xlsx and .xls files accepted
- **Size Limits**: 5MB limit (configurable in express.json middleware)
- **Audit Logging**: All imports logged with user ID and diff

## Next Steps (To Be Implemented)

### High Priority
1. **Editable Grid Component**: Excel-like grid for viewing/editing monthly budgets
2. **PO & Actuals Linking**: Connect POs and Actuals to LineItems by UID
3. **Master Data Import**: Bulk import for Towers, BudgetHeads, Vendors, etc.
4. **Unit Tests**: For month normalization, validation, and calculation services

### Medium Priority
5. **Background Job Queue**: For large imports (>5k rows) using Bull + Redis
6. **Rollback Functionality**: Admin UI to revert imports
7. **Performance Optimization**: Streaming for large files, bulk DB operations
8. **E2E Tests**: Cypress/Playwright tests for import flow

### Low Priority
9. **Advanced Filtering**: In editable grid (by tower, budget head, fiscal year)
10. **Bulk Actions**: Bulk assign tower, bulk set months
11. **Copy/Paste Support**: In editable grid for Excel-like experience
12. **Monitoring & Alerts**: Track import durations, success rates

## Testing Checklist

- [ ] Import dry-run recognizes headers: Jan, Jan-25, January 2025, MAR
- [ ] Import rejects rows with missing UID
- [ ] Import rejects rows with total mismatch (beyond 0.5 tolerance)
- [ ] Import commit creates LineItem and BudgetMonth records
- [ ] Import creates AuditLog entries
- [ ] Export generates valid Excel file
- [ ] Re-importing exported file works without errors
- [ ] Currency conversion uses correct exchange rates
- [ ] Variance calculation is accurate
- [ ] Month allocation from invoice date works correctly

## File Structure

```
server/
├── src/
│   ├── controllers/
│   │   ├── budgetImportController.js
│   │   └── budgetExportController.js
│   ├── services/
│   │   ├── budgetImportService.js
│   │   ├── budgetExportService.js
│   │   └── budgetCalcService.js
│   ├── utils/
│   │   └── monthNormaliser.js
│   └── routes/
│       └── budget.routes.js (updated)
└── prisma/
    └── schema.prisma (updated)

client/
└── src/
    └── components/
        └── ImportModal.jsx
```

## Known Limitations

1. **Synchronous Import**: Large files (>5k rows) may timeout - queue system needed
2. **Master Data Creation**: `createMissingMasters` flag not fully implemented
3. **Multi-month Actuals**: Prorate mode for actuals spanning multiple months not implemented
4. **Header Mapping UI**: User cannot manually edit detected headers (auto-detection only)
5. **Partial Rollback**: No transaction ID tracking for selective rollback

## Deployment Notes

1. Run database migration in staging first
2. Backup database before production deployment
3. Test import/export with real data in staging
4. Monitor first 24-72 hours for errors
5. Ensure `exceljs` and `multer` are in production dependencies

---

**Status**: Core import/export functionality complete and ready for integration testing.
**Next Action**: Integrate ImportModal into BudgetList page and test end-to-end flow.
