# Auto-Actuals Feature Documentation

## Overview
When a Purchase Order (PO) is created or updated, the system automatically creates/updates corresponding actuals entries. This ensures that PO values are immediately reflected in the actuals tracking system.

## How It Works

### 1. **PO Creation Triggers Actuals**
When a user creates a PO through the "Create PO" form:
- The PO value is automatically mapped to the Actuals sheet
- Actuals are created based on:
  - **Entity Budget**: PO Entity specified in the PO
  - **Fiscal Year**: Fiscal year of the PO
  - **Tower**: Tower associated with the PO
  - **Budget Head**: Budget head associated with the PO
  - **Month**: Derived from the PO date

### 2. **Automatic Calculations**

#### ActualsBOA (Budget vs Actual)
- **Created/Updated** for the combination of:
  - Fiscal Year
  - Month (from PO date)
  - Tower
  - Budget Head
  - Cost Centre

- **Actual Amount**:
  - If new: Set to PO value
  - If exists: Adds PO value to existing amount

#### ActualsBasis (Line Item Breakdown)
- Created for **each line item** in the PO
- Links line items to actuals
- Stores:
  - **Allocated Amount**: Line item total cost
  - **Allocation Percentage**: (Line item cost / Total PO value) × 100

#### ActualsCalculation (Variance)
- Automatically calculates variance between budget and actual
- **Variance Amount** = Budget - Actual
- **Variance Percentage** = (Variance / Budget) × 100
- Updates existing calculation if already exists

### 3. **Data Flow**

```
PO Created
    ↓
Extract: Tower, Budget Head, Entity, Fiscal Year, PO Date
    ↓
Determine Month from PO Date
    ↓
Find/Create ActualsBOA
    ↓
Add PO Value to Actual Amount
    ↓
Create ActualsBasis for each Line Item
    ↓
Calculate Variance (if Budget exists)
    ↓
Update ActualsCalculation
```

## Database Transaction

All operations are wrapped in a **database transaction** to ensure:
- **Atomicity**: All changes succeed or all fail
- **Consistency**: Data remains consistent
- **Integrity**: No partial updates

## Example Scenario

### Input: Create PO
```json
{
  "po_number": "PO-2026-001",
  "vendor_id": 1,
  "tower_id": 2,
  "budget_head_id": 3,
  "po_entity_id": 1,
  "po_date": "2026-04-15",
  "total_po_value": 1000000,
  "fiscal_year": 2026,
  "line_items": [
    {
      "uid": "DIT-OPEX-FY26-001",
      "service_description": "Cloud Services",
      "unit_cost": 500000,
      "quantity": 2,
      "total_cost": 1000000
    }
  ]
}
```

### Automatic Actions:

1. **PO Created**
   - PO Number: PO-2026-001
   - Total Value: ₹10,00,000

2. **ActualsBOA Created/Updated**
   - Fiscal Year: 2026
   - Month: 4 (April)
   - Tower: DIT
   - Budget Head: OPEX
   - Actual Amount: ₹10,00,000 (added to existing if any)
   - Remarks: "Auto-created from PO PO-2026-001"

3. **ActualsBasis Created**
   - Line Item: DIT-OPEX-FY26-001
   - Allocated Amount: ₹10,00,000
   - Allocation Percentage: 100%

4. **ActualsCalculation Updated**
   - Assumes Budget for April 2026 = ₹15,00,000
   - Variance Amount: ₹5,00,000
   - Variance Percentage: 33.33%

## Benefits

### 1. **Automation**
- No manual entry of actuals required
- Reduces human error
- Saves time

### 2. **Real-Time Tracking**
- Actuals updated immediately when PO is created
- Dashboard reflects current spending
- Budget vs Actual always in sync

### 3. **Accurate Variance**
- Automatic variance calculation
- Alerts when budget is exceeded
- Better financial control

### 4. **Audit Trail**
- Remarks field shows which PO created/updated actuals
- Full traceability
- Easy to track spending

## Budget Tracker Integration

The Budget Tracker now shows:
- **Entity-level Budget**: Budget allocated to specific PO entity
- **Entity-level Actual**: Actual spending for that entity (from POs)
- **UID-level Total Budget**: Sum across all entities with same UID
- **UID-level Total Actual**: Sum of all actuals across entities

## API Changes

### Create PO Endpoint
**POST** `/api/pos`

**New Request Fields**:
```json
{
  "po_entity_id": 1,           // PO Entity ID
  "po_start_date": "2026-04-01", // PO start date
  "po_end_date": "2027-03-31",   // PO end date
  "fiscal_year": 2026,           // Fiscal year
  // ... other existing fields
}
```

**Response**: Includes created PO with all related actuals

## Cost Centre Handling

The system uses the **first available cost centre** for actuals creation. 

**Recommendation**: 
- Ensure at least one cost centre exists in the system
- Or modify the logic to accept cost_centre_id in the PO request

## Error Handling

- If transaction fails, entire operation rolls back
- No partial PO or actuals created
- Error logged to console
- User receives error message

## Future Enhancements

1. **Cost Centre Selection**: Allow user to specify cost centre in PO form
2. **Multi-Month Allocation**: Distribute PO value across multiple months
3. **Approval Workflow**: Create actuals only when PO is approved
4. **Reversal**: Delete actuals when PO is cancelled
5. **Edit Support**: Update actuals when PO is edited

## Testing

### Test Case 1: New PO
1. Create a PO with value ₹10,00,000
2. Check ActualsBOA table - should have new entry
3. Check ActualsBasis table - should have line item entries
4. Check Budget Tracker - actual should reflect

### Test Case 2: Multiple POs Same Month
1. Create PO1 with ₹5,00,000 in April
2. Create PO2 with ₹3,00,000 in April
3. Check ActualsBOA - should show ₹8,00,000 for April
4. Both POs should be in remarks

### Test Case 3: Variance Calculation
1. Ensure budget exists for the month
2. Create PO
3. Check ActualsCalculation table
4. Verify variance is correct

## Troubleshooting

### Issue: Actuals not created
**Possible Causes**:
- No cost centre in database
- Transaction failed
- Missing fiscal_year in request

**Solution**:
- Check server logs
- Ensure cost centre exists
- Verify all required fields in request

### Issue: Duplicate actuals
**Possible Causes**:
- Transaction not used
- Race condition

**Solution**:
- Code uses transaction - should not happen
- Check for concurrent requests

## Code Location

**File**: `server/src/controllers/po.controller.js`
**Function**: `createPO`
**Lines**: ~130-350

## Dependencies

- Prisma ORM
- Database transaction support
- Cost Centre table must have at least one entry
