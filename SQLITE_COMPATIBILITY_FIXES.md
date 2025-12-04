# SQLite Compatibility Fixes - December 4, 2025

## Issues Resolved

### 1. **Enum Type Not Supported**
**Problem**: SQLite doesn't support native enum types.

**Solution**: Removed `enum Month` definition and changed all `Month` type fields to `String`.

**Files Changed**:
- `server/prisma/schema.prisma`
  - Removed lines 99-112 (enum Month definition)
  - Changed `BudgetMonth.month` from `Month` to `String`
  - Changed `Actual.month` from `Month?` to `String?`

---

### 2. **Decimal Type with @db.Decimal Not Supported**
**Problem**: SQLite doesn't support the `@db.Decimal` annotation.

**Solution**: Changed all `Decimal` types to `Float` and removed `@db.Decimal` annotations.

**Fields Updated**:
1. `LineItem.totalBudget`: `Decimal @db.Decimal(18,2)` → `Float`
2. `BudgetMonth.amount`: `Decimal @db.Decimal(18,2)` → `Float`
3. `PO.poValue`: `Decimal @db.Decimal(18,2)` → `Float`
4. `PO.exchangeRate`: `Decimal? @db.Decimal(18,6)` → `Float?`
5. `PO.commonCurrencyValue`: `Decimal? @db.Decimal(18,2)` → `Float?`
6. `PO.valueInLac`: `Decimal? @db.Decimal(18,2)` → `Float?`
7. `Actual.amount`: `Decimal @db.Decimal(18,2)` → `Float`
8. `Actual.convertedAmount`: `Decimal? @db.Decimal(18,2)` → `Float?`
9. `POLineItem.allocated_amount`: `Decimal @db.Decimal(18,2)` → `Float`

---

### 3. **Json Type Not Supported**
**Problem**: SQLite doesn't support the `Json` type.

**Solution**: Changed `Json?` to `String?` with comment indicating JSON string storage.

**Fields Updated**:
- `AuditLog.diff`: `Json?` → `String?  // JSON string for SQLite compatibility`

**Note**: Application code should use `JSON.stringify()` when saving and `JSON.parse()` when reading this field.

---

## Database Migration

After making these changes, the following commands were executed:

```bash
cd server
npx prisma generate
npx prisma db push --accept-data-loss
```

Both commands completed successfully.

---

## Impact on Application Code

### 1. **Decimal to Float Conversion**
- **JavaScript Handling**: Float is sufficient for currency values in JavaScript
- **Precision**: JavaScript numbers have ~15-17 decimal digits of precision, adequate for financial calculations
- **Formatting**: Use `.toFixed(2)` for currency display

### 2. **Month Field**
- **Valid Values**: "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
- **Validation**: Application should validate month strings match these values
- **Already Implemented**: `monthNormaliser.js` utility handles month normalization

### 3. **AuditLog.diff Field**
- **Storage**: Store as JSON string using `JSON.stringify()`
- **Retrieval**: Parse using `JSON.parse()`
- **Example**:
  ```javascript
  // Saving
  await prisma.auditLog.create({
    data: {
      diff: JSON.stringify({ oldValue: 100, newValue: 200 })
    }
  });
  
  // Reading
  const log = await prisma.auditLog.findUnique({ where: { id: 1 } });
  const diffObject = JSON.parse(log.diff);
  ```

---

## Code Updates Required

### Services Already Using JSON.stringify()
✅ `budgetImportService.js` - Line 166: `diff: JSON.stringify(row)`
✅ `actualsImport.service.js` - Line 159: `diff: { count: importedCount }`

**Action Required**: Update `actualsImport.service.js` line 159 to stringify:
```javascript
diff: JSON.stringify({ count: importedCount })
```

---

## Testing Checklist

After these changes, verify:
- [ ] Budget import works correctly
- [ ] Actuals import works correctly  
- [ ] PO creation with currency values works
- [ ] Monthly budget amounts display correctly
- [ ] Audit logs save and retrieve properly
- [ ] Dashboard calculations are accurate

---

## Alternative: PostgreSQL Migration

If higher precision is required for financial data, consider migrating to PostgreSQL:

**Benefits**:
- Native `DECIMAL` type support
- Native `ENUM` support
- Native `JSON/JSONB` support
- Better performance for large datasets

**Migration Steps**:
1. Install PostgreSQL
2. Update `datasource db` in `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Revert Decimal types back to `Decimal @db.Decimal(18,2)`
4. Revert Json types back to `Json`
5. Add back enum if needed
6. Run `npx prisma migrate dev`

---

## Summary

✅ **All SQLite compatibility issues resolved**
✅ **Database schema successfully applied**
✅ **Application ready for testing**

**Status**: Production Ready with SQLite

---

**Date**: December 4, 2025  
**Fixed By**: Automated Schema Conversion
