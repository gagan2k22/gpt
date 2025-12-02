---
description: Managing Currency Rates
---

# Managing Currency Rates

This workflow describes how to manage currency conversion rates in the system.

## Prerequisites
- Admin access is required to add, edit, or delete rates.
- Viewer access allows viewing rates.

## Steps

1.  **Navigate to Master Data**:
    - Log in to the application.
    - Click on "Master Data" in the sidebar.

2.  **Access Currency Rates**:
    - Click on the "Currency Rates" tab (last tab).

3.  **Add a New Rate**:
    - Click the "Add Rate" button.
    - Select "From Currency" (e.g., USD, EUR).
    - "To Currency" is fixed to INR.
    - Enter the "Conversion Rate".
    - Click "Save".

4.  **Edit a Rate**:
    - Click the "Edit" (pencil) icon next to a rate.
    - Update the rate value.
    - Click "Save".

5.  **Delete a Rate**:
    - Click the "Delete" (trash) icon next to a rate.
    - Confirm the deletion.

## Automatic Conversion
- When creating or editing a PO, if a non-INR currency is selected, the system will automatically look up the latest rate for that currency to INR.
- The `common_currency_value` (INR) will be calculated and stored.
- Actuals will be updated based on this INR value.
