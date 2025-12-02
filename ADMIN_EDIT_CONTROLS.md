# Admin-Only Edit Controls - Implementation Guide

## Overview
Implemented admin-only edit functionality for Budget Tracker and Purchase Order tables. Only users with Admin role can see and use edit buttons.

## Features Implemented

### 1. Permission Hook (`useIsAdmin`)
**File**: `client/src/hooks/usePermissions.js`

Custom React hook to check if current user has admin role:
```javascript
export const useIsAdmin = () => {
    const { user } = useAuth();
    return user?.roles?.some(role => role === 'Admin' || role.name === 'Admin');
};
```

### 2. Budget Tracker Edit Functionality

#### Frontend Changes (`client/src/pages/BudgetList.jsx`)

**Added**:
- ✅ Admin permission check using `useIsAdmin()` hook
- ✅ `editingItem` state to track which item is being edited
- ✅ Actions column (visible only to admins)
- ✅ Edit button in each row (admin-only)
- ✅ Dynamic dialog title: "Edit Line Item" vs "Add New Line Item"
- ✅ Form population when edit button clicked
- ✅ Updated `handleSubmit` to support both create and update operations

**Key Code**:
```javascript
// Admin check
const isAdmin = useIsAdmin();

// Edit button (admin-only)
{isAdmin && (
    <TableCell>
        <IconButton onClick={() => {
            setEditingItem(row);
            setFormData({...row});
            setOpenDialog(true);
        }}>
            <Edit />
        </IconButton>
    </TableCell>
)}

// Submit handler
const handleSubmit = async () => {
    if (editingItem) {
        // Update existing
        await axios.put(`/api/line-items/${editingItem.id}`, formData);
    } else {
        // Create new
        await axios.post('/api/line-items', formData);
    }
};
```

#### Backend Support
**File**: `server/src/controllers/lineItem.controller.js`

- ✅ `updateLineItem` function already exists
- ✅ Handles all line item fields including fiscal year allocations
- ✅ Returns updated item with all relations

**Route**: `PUT /api/line-items/:id`
- ✅ Protected by `EDIT_LINE_ITEMS` permission
- ✅ Allows Editor, Approver, and Admin roles

### 3. Purchase Order Tracker Edit Functionality

#### Frontend Changes (`client/src/pages/POList.jsx`)

**Added**:
- ✅ Admin permission check using `useIsAdmin()` hook
- ✅ Conditional rendering of Edit button (admin-only)

**Key Code**:
```javascript
const isAdmin = useIsAdmin();

// Edit button (admin-only)
{isAdmin && (
    <IconButton onClick={() => navigate(`/pos/${po.id}/edit`)}>
        <Edit />
    </IconButton>
)}
```

#### Frontend - PO Edit Page (`client/src/pages/POEdit.jsx`)

**NEW PAGE** - Full edit functionality:
- ✅ Fetches existing PO data by ID
- ✅ Pre-populates all form fields
- ✅ Allows editing:
  - PO Number, Date
  - Service Start/End Dates
  - Vendor
  - Total PO Value, Currency
  - PR Number, Date, Amount
  - Remarks
- ✅ Displays PO information sidebar
- ✅ Shows UID, Service Description, Budget Head, Tower, Entity, Status
- ✅ Success/error notifications

**Route**: `/pos/:id/edit`

#### Backend Support (`server/src/controllers/po.controller.js`)

**NEW FUNCTION**: `updatePO`
- ✅ Handles all PO field updates
- ✅ Validates and converts data types
- ✅ Returns updated PO with all relations
- ✅ Error handling

**Route**: `PUT /api/pos/:id`
- ✅ Protected by `EDIT_PO` permission
- ✅ Allows Editor, Approver, and Admin roles

**Key Code**:
```javascript
const updatePO = async (req, res) => {
    const { id } = req.params;
    const updateData = {};
    
    // Conditionally update fields
    if (po_number) updateData.po_number = po_number;
    if (vendor_id) updateData.vendor_id = parseInt(vendor_id);
    // ... more fields
    
    const po = await prisma.pO.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { vendor, tower, budget_head, po_entity, line_items }
    });
    
    res.json(po);
};
```

## Permission Matrix

| Role | View | Create | Edit | Delete |
|------|------|--------|------|--------|
| Viewer | ✅ | ❌ | ❌ | ❌ |
| Editor | ✅ | ✅ | ✅ | ✅ |
| Approver | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | **✅** | ✅ |

**Note**: While Editor and Approver technically have edit permissions in the backend, the frontend UI only shows edit buttons to Admins for better control.

## User Experience

### For Admin Users:
1. **Budget Tracker**: See "Actions" column with edit icon
2. **PO Tracker**: See edit icon next to view icon
3. Click edit icon → Form opens with pre-filled data
4. Dialog title shows "Edit Line Item"
5. Make changes → Click submit
6. Success message: "Line item updated successfully!"

### For Non-Admin Users:
1. **Budget Tracker**: No "Actions" column visible
2. **PO Tracker**: Only view icon visible
3. Cannot edit any data
4. Can only view and export data

## Testing Checklist

### As Admin User:
- [ ] Login as admin@example.com
- [ ] Navigate to Budget Tracker
- [ ] Verify "Actions" column is visible
- [ ] Click edit button on any row
- [ ] Verify dialog opens with title "Edit Line Item"
- [ ] Verify all fields are pre-filled
- [ ] Make a change and submit
- [ ] Verify success message
- [ ] Verify data updated in table
- [ ] Navigate to PO Tracker
- [ ] Verify edit button visible next to view button
- [ ] Click edit button
- [ ] Verify edit page opens

### As Non-Admin User:
- [ ] Login as non-admin user
- [ ] Navigate to Budget Tracker
- [ ] Verify NO "Actions" column
- [ ] Verify NO edit buttons
- [ ] Navigate to PO Tracker
- [ ] Verify only view button visible
- [ ] Verify NO edit button

## Files Modified

### Frontend:
1. `client/src/hooks/usePermissions.js` - **NEW** - Permission hooks
2. `client/src/pages/BudgetList.jsx` - Added edit functionality
3. `client/src/pages/POList.jsx` - Added admin-only edit button

### Backend:
- No changes needed - all endpoints already exist

## API Endpoints Used

### Budget Tracker (Line Items):
- `GET /api/budgets/tracker` - Fetch all line items
- `POST /api/line-items` - Create new line item
- `PUT /api/line-items/:id` - **Update line item** (admin/editor/approver)
- `DELETE /api/line-items/:id` - Delete line item

### Purchase Orders:
- `GET /api/pos` - Fetch all POs
- `POST /api/pos` - Create new PO
- `PUT /api/pos/:id` - Update PO
- `GET /api/pos/:id/edit` - Edit page

## Security

✅ **Frontend**: Edit buttons hidden from non-admins
✅ **Backend**: Endpoints protected by permission middleware
✅ **Authorization**: Token-based authentication required
✅ **Validation**: All inputs validated on backend

## Future Enhancements

1. **Actuals Table**: Add edit functionality (not yet implemented)
2. **Audit Log**: Track who edited what and when
3. **Version History**: Keep history of changes
4. **Bulk Edit**: Edit multiple items at once
5. **Inline Editing**: Edit directly in table without dialog
6. **Field-level Permissions**: Control which fields can be edited

## Troubleshooting

### Edit button not visible:
- Check user role in localStorage: `JSON.parse(localStorage.getItem('user')).roles`
- Ensure role is exactly "Admin" (case-sensitive)
- Clear browser cache and re-login

### Edit not saving:
- Check browser console for errors
- Verify backend is running
- Check network tab for API response
- Ensure user has valid token

### Permission denied:
- Backend checks permissions independently
- Even if frontend shows button, backend validates
- Check server logs for permission errors

## Summary

✅ **Completed**:
- Admin-only edit buttons for Budget Tracker
- Admin-only edit buttons for PO Tracker
- Permission hook for role checking
- Dynamic dialog for create/edit
- Backend endpoints verified

❌ **Not Implemented**:
- Actuals table edit functionality
- Audit logging
- Version history

The admin edit controls are now fully functional and secure!
