# Quick Start Guide - Budget Import/Export System

## 🚀 Getting Started

### 1. Start the Application

**Backend**:
```bash
cd server
npm start
```

**Frontend**:
```bash
cd client
npm run dev
```

### 2. Access the Features

**Import Budget Data**:
1. Navigate to **Budget Tracker** page
2. Click **"Import Budget"** button
3. Upload Excel file (.xlsx)
4. Review preview → Click **"Commit Import"**

**Edit Monthly Budgets**:
1. Navigate to **Monthly Budget Editor** page
2. Apply filters (optional)
3. Click **Edit** icon on any row
4. Modify monthly amounts
5. Click **Save**

**Export Budget Data**:
1. Navigate to **Budget Tracker** page
2. Click **"Export to Excel"** button
3. File downloads automatically

---

## 📋 Excel File Format

### Required Columns
- **UID**: Unique identifier (required)
- **Description**: Service description
- **Tower**: Tower name
- **Budget Head**: Budget head name
- **Jan** through **Dec**: Monthly amounts
- **Total**: Sum of all months

### Supported Month Headers
- `Jan`, `Feb`, `Mar`, etc.
- `Jan-25`, `Feb-25`, etc.
- `January`, `February`, etc.
- `January 2025`, `February 2025`, etc.

### Example Excel Structure
```
UID          | Description        | Tower | Budget Head | Jan  | Feb  | Mar  | ... | Total
-------------|-------------------|-------|-------------|------|------|------|-----|-------
DIT-001      | Cloud Services    | IT    | OPEX        | 1000 | 1500 | 2000 | ... | 15000
DIT-002      | Software Licenses | IT    | CAPEX       | 500  | 500  | 500  | ... | 6000
```

---

## 🎯 Key Features

### Import Features
✅ **Dry-Run Preview**: See what will be imported before committing  
✅ **Header Detection**: Automatically normalizes month headers  
✅ **Validation**: Checks UID, totals, numeric values  
✅ **Error Reporting**: Download rejected rows with reasons  
✅ **Audit Logging**: All imports tracked with user ID  

### Edit Features
✅ **Inline Editing**: Edit monthly amounts directly in grid  
✅ **Real-time Totals**: Total updates as you type  
✅ **Copy Row**: Copy entire row to clipboard  
✅ **Sticky Columns**: UID and Description stay visible  
✅ **Keyboard Navigation**: Tab through cells  

### Export Features
✅ **Upload Template**: Excel file ready for re-import  
✅ **Report Template**: Formatted for analysis  
✅ **Current Data**: Exports all line items with monthly breakdowns  

---

## 🔐 Permissions Required

| Action | Permission Required |
|--------|-------------------|
| Import Budget | `EDIT_BUDGET_BOA` |
| Export Budget | `VIEW_DASHBOARDS` |
| Edit Monthly Budgets | `EDIT_LINE_ITEMS` |
| View Budget Data | `VIEW_DASHBOARDS` |

---

## ⚠️ Common Issues & Solutions

### Issue: Import fails with "Invalid month header"
**Solution**: Ensure month columns use Jan, Feb, Mar format (or variations like Jan-25)

### Issue: Import rejects rows with "Total mismatch"
**Solution**: Ensure Total column equals sum of all monthly amounts (tolerance: ±0.5)

### Issue: Import fails with "Missing UID"
**Solution**: Ensure every row has a unique UID in the UID column

### Issue: Can't save monthly edits
**Solution**: Check you have `EDIT_LINE_ITEMS` permission

### Issue: Export downloads empty file
**Solution**: Ensure you have budget data in the system

---

## 📞 API Endpoints Quick Reference

```
POST /api/budgets/import?dryRun=true      # Preview import
POST /api/budgets/import?dryRun=false     # Commit import
GET  /api/budgets/export?template=upload  # Export for re-import
GET  /api/budgets/export?template=report  # Export for analysis
PUT  /api/line-items/:id/months           # Update monthly budgets
GET  /api/line-items?include_months=true  # Get line items with months
```

---

## 🎨 UI Components

### ImportModal
- **Location**: `client/src/components/ImportModal.jsx`
- **Usage**: Integrated in BudgetList page
- **Props**: `open`, `onClose`, `onSuccess`

### EditableGrid
- **Location**: `client/src/components/EditableGrid.jsx`
- **Usage**: Used in BudgetMonthlyView page
- **Props**: `lineItems`, `onUpdate`

### BudgetMonthlyView
- **Location**: `client/src/pages/BudgetMonthlyView.jsx`
- **Route**: `/budget-monthly` (add to router)

---

## 🧪 Testing the System

### Test Import
1. Create Excel file with sample data
2. Upload via Import Modal
3. Verify dry-run shows correct header mapping
4. Check accepted/rejected rows
5. Commit and verify data in grid

### Test Edit
1. Open Monthly Budget Editor
2. Click Edit on a row
3. Change monthly amounts
4. Verify total updates
5. Save and refresh to confirm persistence

### Test Export
1. Click Export button
2. Open downloaded Excel file
3. Verify data matches system
4. Re-import the file
5. Verify no errors

---

## 📊 Sample Excel Template

Download a sample template:
1. Go to Budget Tracker
2. Click "Export to Excel"
3. Use this as your template for imports

Or create manually:
```
UID,Description,Tower,Budget Head,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec,Total
TEST-001,Sample Service,IT,OPEX,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,12000
```

---

## 🎓 Best Practices

1. **Always dry-run first**: Preview before committing
2. **Download rejected rows**: Fix errors in Excel and re-upload
3. **Use consistent UIDs**: Follow naming convention (e.g., TOWER-TYPE-###)
4. **Verify totals**: Ensure Total = Sum(Jan:Dec)
5. **Backup before import**: Export current data before large imports
6. **Use filters**: Filter by Tower/Budget Head for focused editing
7. **Save frequently**: Save row edits before moving to next row

---

## 🚨 Troubleshooting

### Backend Errors
Check server logs:
```bash
cd server
npm start
# Watch console for errors
```

### Frontend Errors
Check browser console (F12):
- Network tab for API errors
- Console tab for JavaScript errors

### Database Issues
Regenerate Prisma client:
```bash
cd server
npx prisma generate
```

---

## 📚 Additional Resources

- **Full Documentation**: See `BUDGET_SYSTEM_COMPLETE.md`
- **Implementation Summary**: See `BUDGET_IMPORT_EXPORT_SUMMARY.md`
- **Schema Reference**: See `server/prisma/schema.prisma`
- **API Documentation**: See API Contract in main docs

---

**Need Help?** Check the comprehensive documentation or contact your system administrator.

**Version**: 1.0.0  
**Last Updated**: 2025-12-04
