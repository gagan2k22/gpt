# OPEX Management System - Testing Guide

## 🧪 Comprehensive Testing Checklist

This guide provides step-by-step testing procedures for all features in the OPEX Management System.

---

## Prerequisites for Testing

- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- Database initialized with schema
- At least one user account (admin@example.com / admin123)

---

## Test Suite 1: Authentication & Authorization

### Test 1.1: Login
- [ ] Navigate to `http://localhost:5173/login`
- [ ] Enter valid credentials (admin@example.com / admin123)
- [ ] Click "Sign In"
- [ ] **Expected**: Redirected to Dashboard

### Test 1.2: Invalid Login
- [ ] Try logging in with wrong password
- [ ] **Expected**: Error message displayed

### Test 1.3: Role-Based Access
- [ ] Login as Viewer
- [ ] Try to create a PO
- [ ] **Expected**: Permission denied or button disabled

---

## Test Suite 2: Budget Management

### Test 2.1: View Budget List
- [ ] Navigate to Budget Tracker
- [ ] **Expected**: Table displays with columns (UID, Description, Tower, etc.)
- [ ] Apply filters (Tower, Budget Head)
- [ ] **Expected**: List filters correctly

### Test 2.2: Budget Import (Dry Run)
- [ ] Click "Import Budget" button
- [ ] Upload sample Excel file
- [ ] Click "Preview"
- [ ] **Expected**: Preview shows accepted/rejected rows
- [ ] Check for validation errors

### Test 2.3: Budget Import (Commit)
- [ ] After successful preview, click "Commit Import"
- [ ] **Expected**: Success message
- [ ] Refresh budget list
- [ ] **Expected**: New budgets appear

### Test 2.4: Budget Export
- [ ] Click "Export to Excel" button
- [ ] **Expected**: Excel file downloads
- [ ] Open file and verify data matches screen

### Test 2.5: Monthly Budget Editor
- [ ] Click "Monthly Editor" button
- [ ] **Expected**: Excel-like grid appears
- [ ] Edit a monthly amount
- [ ] Click "Save Changes"
- [ ] **Expected**: Success message
- [ ] Refresh and verify change persisted

### Test 2.6: Budget Detail View
- [ ] Click on a UID in the budget list
- [ ] **Expected**: Detail page opens
- [ ] Verify summary cards show correct totals
- [ ] Check monthly variance chart displays
- [ ] Switch between tabs (Monthly, POs, Actuals, Audit)

### Test 2.7: Reconciliation Notes
- [ ] In Budget Detail, go to Actuals tab
- [ ] Click "Add Note" icon on an actual
- [ ] Enter note text
- [ ] Click "Save"
- [ ] **Expected**: Note appears in list

---

## Test Suite 3: PO Management

### Test 3.1: View PO List
- [ ] Navigate to PO Tracker
- [ ] **Expected**: Table displays with PO details
- [ ] Apply filters
- [ ] **Expected**: List filters correctly

### Test 3.2: Create New PO
- [ ] Click "+ New PO" button
- [ ] Fill in required fields:
  - PO Number: TEST-PO-001
  - PO Date: Today's date
  - Vendor: Select from dropdown
  - Currency: INR
  - PO Value: 100000
- [ ] Click "Create PO"
- [ ] **Expected**: Success message, redirected to PO list

### Test 3.3: Link Line Items to PO
- [ ] Create/Edit a PO
- [ ] In "Link Line Items" section, search for a UID
- [ ] Select a line item from dropdown
- [ ] Enter allocated amount
- [ ] Save PO
- [ ] **Expected**: Line item linked successfully

### Test 3.4: Edit Existing PO
- [ ] Click edit icon on a PO
- [ ] Modify PO value
- [ ] Click "Update PO"
- [ ] **Expected**: Changes saved
- [ ] Verify in PO list

### Test 3.5: Currency Conversion
- [ ] Create PO with currency = USD
- [ ] Enter PO Value: 1000
- [ ] Enter Exchange Rate: 83
- [ ] **Expected**: Common Currency Value shows ₹83,000

---

## Test Suite 4: Actuals Management

### Test 4.1: View Actuals List
- [ ] Navigate to Actuals Management
- [ ] **Expected**: Table displays actuals
- [ ] Filter by fiscal year and month
- [ ] **Expected**: List filters correctly

### Test 4.2: Actuals Import (Dry Run)
- [ ] Click "Import Actuals" button
- [ ] Upload sample Excel file with columns:
  - Invoice No
  - Invoice Date
  - Amount
  - UID (optional)
  - Vendor (optional)
- [ ] Click "Preview"
- [ ] **Expected**: Preview shows accepted/rejected rows

### Test 4.3: Actuals Import (Commit)
- [ ] After successful preview, click "Commit Import"
- [ ] **Expected**: Success message
- [ ] Refresh actuals list
- [ ] **Expected**: New actuals appear

### Test 4.4: Month Auto-Assignment
- [ ] Import an actual with Invoice Date: 2024-04-15
- [ ] **Expected**: Month automatically set to "Apr"
- [ ] Verify in actuals list

---

## Test Suite 5: Reports & Analytics

### Test 5.1: Dashboard Metrics
- [ ] Navigate to Dashboard
- [ ] **Expected**: Four metric cards display:
  - Total Budget
  - Total Actuals
  - Variance
  - Budget Utilization %
- [ ] Verify numbers are correct

### Test 5.2: Tower-wise Chart
- [ ] Check "Tower-wise Budget vs Actual" bar chart
- [ ] **Expected**: Bars display for each tower
- [ ] Hover over bars
- [ ] **Expected**: Tooltip shows exact values

### Test 5.3: Vendor-wise Chart
- [ ] Check "Top 10 Vendors by Spend" chart
- [ ] **Expected**: Horizontal bars show top vendors
- [ ] Verify vendors are sorted by spend (descending)

### Test 5.4: Monthly Trend
- [ ] Check "Monthly Spend Trend" line chart
- [ ] **Expected**: Line shows monthly actuals
- [ ] Verify months are in correct order (Apr-Mar)

### Test 5.5: Pie Chart
- [ ] Check "Tower Budget Distribution" pie chart
- [ ] **Expected**: Slices show percentage distribution
- [ ] Verify percentages add up to 100%

---

## Test Suite 6: Import History & Audit

### Test 6.1: View Import History
- [ ] Navigate to Import History
- [ ] **Expected**: Table shows all imports
- [ ] Verify columns:
  - Date
  - Type (Budget/Actuals)
  - Filename
  - User
  - Rows (Total/Accepted/Rejected)
  - Status

### Test 6.2: Import Status Indicators
- [ ] Check status chips
- [ ] **Expected**: 
  - Completed = Green
  - Failed = Red
  - Pending = Gray

### Test 6.3: User Attribution
- [ ] Login as different users and perform imports
- [ ] Check Import History
- [ ] **Expected**: Each import shows correct user

### Test 6.4: Audit Log in Budget Detail
- [ ] Open any Budget Detail page
- [ ] Go to "Audit Log" tab
- [ ] **Expected**: Shows history of changes
- [ ] Verify user and timestamp

---

## Test Suite 7: Master Data Management

### Test 7.1: Add Tower
- [ ] Navigate to Settings → Master Data
- [ ] Go to "Towers" tab
- [ ] Click "+ Add Tower"
- [ ] Enter name: "Test Tower"
- [ ] Click "Save"
- [ ] **Expected**: Tower added to list

### Test 7.2: Add Budget Head
- [ ] Go to "Budget Heads" tab
- [ ] Click "+ Add Budget Head"
- [ ] Select Tower
- [ ] Enter name
- [ ] Save
- [ ] **Expected**: Budget Head added

### Test 7.3: Add Vendor
- [ ] Go to "Vendors" tab
- [ ] Click "+ Add Vendor"
- [ ] Fill in details
- [ ] Save
- [ ] **Expected**: Vendor added

### Test 7.4: Currency Rates
- [ ] Go to "Currency Rates" tab
- [ ] Add/Edit a rate (e.g., USD to INR = 83)
- [ ] Save
- [ ] **Expected**: Rate saved
- [ ] Create PO with USD
- [ ] **Expected**: Conversion uses saved rate

---

## Test Suite 8: User Management (Admin Only)

### Test 8.1: View Users
- [ ] Login as Admin
- [ ] Navigate to User Management
- [ ] **Expected**: Table shows all users

### Test 8.2: Create User
- [ ] Click "+ Add User"
- [ ] Fill in details
- [ ] Assign roles
- [ ] Save
- [ ] **Expected**: User created

### Test 8.3: Edit User Roles
- [ ] Click edit on a user
- [ ] Change roles
- [ ] Save
- [ ] **Expected**: Roles updated
- [ ] Login as that user
- [ ] **Expected**: Permissions reflect new roles

---

## Test Suite 9: Navigation & UI

### Test 9.1: Page Navigation
- [ ] Click through all menu items
- [ ] **Expected**: All pages load without errors

### Test 9.2: Responsive Design
- [ ] Resize browser window
- [ ] **Expected**: Layout adjusts appropriately
- [ ] Test on mobile viewport
- [ ] **Expected**: Mobile-friendly display

### Test 9.3: Loading States
- [ ] Navigate to Dashboard
- [ ] **Expected**: Loading spinner shows while data fetches
- [ ] After load, spinner disappears

### Test 9.4: Error Handling
- [ ] Stop backend server
- [ ] Try to load Dashboard
- [ ] **Expected**: Error message displays
- [ ] Restart backend
- [ ] Refresh page
- [ ] **Expected**: Data loads successfully

---

## Test Suite 10: Data Integrity

### Test 10.1: Budget-Actual Linking
- [ ] Import budget with UID: BUD-001
- [ ] Import actual with UID: BUD-001
- [ ] View Budget Detail for BUD-001
- [ ] **Expected**: Actual appears in Actuals tab

### Test 10.2: PO-Budget Linking
- [ ] Create PO and link to budget line item
- [ ] View Budget Detail
- [ ] Go to "Linked POs" tab
- [ ] **Expected**: PO appears in list

### Test 10.3: Monthly Totals
- [ ] Edit monthly budgets
- [ ] **Expected**: Total budget updates automatically
- [ ] Verify sum of months = total budget

### Test 10.4: Variance Calculation
- [ ] Budget: ₹100,000
- [ ] Actuals: ₹80,000
- [ ] **Expected**: Variance = ₹20,000 (positive)
- [ ] **Expected**: Utilization = 80%

---

## Performance Tests

### Test P1: Large Dataset Import
- [ ] Import Excel with 1000+ rows
- [ ] **Expected**: Completes within reasonable time (< 30 seconds)
- [ ] No browser freeze

### Test P2: Dashboard Load Time
- [ ] Clear cache
- [ ] Navigate to Dashboard
- [ ] **Expected**: Loads within 2-3 seconds

### Test P3: Filter Performance
- [ ] Budget list with 500+ items
- [ ] Apply multiple filters
- [ ] **Expected**: Filters apply instantly (< 1 second)

---

## Security Tests

### Test S1: Unauthorized Access
- [ ] Logout
- [ ] Try to access `/budgets` directly
- [ ] **Expected**: Redirected to login

### Test S2: Token Expiration
- [ ] Login and wait for token to expire (if configured)
- [ ] Try to perform an action
- [ ] **Expected**: Redirected to login

### Test S3: SQL Injection
- [ ] Try entering SQL in search fields
- [ ] **Expected**: No database errors, input sanitized

---

## Regression Tests

After any code changes, run these critical paths:

1. **Login → Dashboard → View Charts**
2. **Budget Import → Preview → Commit → Verify in List**
3. **Create PO → Link Line Item → Save → Verify in List**
4. **Import Actuals → Verify in Budget Detail**
5. **View Import History → Check Status**

---

## Bug Reporting Template

If you find a bug, report it with:

```
**Bug Title**: [Brief description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**: 

**Actual Result**: 

**Screenshots**: [If applicable]

**Browser/Environment**: 

**Error Messages**: [Console logs]
```

---

## Test Data Samples

### Sample Budget Import Excel

Create an Excel file with these columns and data:

| UID | Description | Tower | Budget Head | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Jan | Feb | Mar | Total |
|-----|-------------|-------|-------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-------|
| BUD-001 | Software Licenses | IT | Software | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 120000 |
| BUD-002 | Hardware Maintenance | IT | Hardware | 5000 | 5000 | 5000 | 5000 | 5000 | 5000 | 5000 | 5000 | 5000 | 5000 | 5000 | 5000 | 60000 |

### Sample Actuals Import Excel

| Invoice No | Invoice Date | Amount | Currency | UID | Vendor |
|------------|--------------|--------|----------|-----|--------|
| INV-001 | 2024-04-15 | 5000 | INR | BUD-001 | Microsoft |
| INV-002 | 2024-05-20 | 3000 | INR | BUD-002 | Dell |

---

## ✅ Sign-Off Checklist

Before declaring the system production-ready:

- [ ] All Test Suites passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security tests passed
- [ ] Documentation complete
- [ ] User training completed
- [ ] Backup procedures in place

---

**Happy Testing! 🎯**
