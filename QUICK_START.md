# OPEX Management System - Quick Start Guide

## 🚀 Getting Started

This guide will help you get the OPEX Management System up and running in minutes.

---

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git** (optional)

---

## Installation Steps

### 1. Backend Setup

```powershell
# Navigate to server directory
cd "c:\jpm\New folder\New folder\server"

# Install dependencies (if not already installed)
npm install

# Generate Prisma client
npx prisma generate

# Apply database schema
npx prisma db push

# Start the backend server
npm run dev
```

**Backend will run on**: `http://localhost:5000`

### 2. Frontend Setup

Open a **new terminal** window:

```powershell
# Navigate to client directory
cd "c:\jpm\New folder\New folder\client"

# Install dependencies (if not already installed)
npm install

# Start the frontend development server
npm run dev
```

**Frontend will run on**: `http://localhost:5173`

---

## 🔑 Default Login Credentials

### Admin User
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Editor User
- **Email**: `editor@example.com`
- **Password**: `editor123`

### Viewer User
- **Email**: `viewer@example.com`
- **Password**: `viewer123`

---

## 📋 First Steps After Login

### 1. **Set Up Master Data**
Navigate to **Settings → Master Data** and add:
- Towers (e.g., IT, HR, Finance)
- Budget Heads (e.g., Software, Hardware, Services)
- Vendors
- Cost Centres

### 2. **Import Budget Data**
1. Go to **Budget Tracker**
2. Click **Import Budget**
3. Upload your Excel file (see sample format below)
4. Preview the import
5. Commit the import

### 3. **Create Purchase Orders**
1. Go to **PO Tracker**
2. Click **+ New PO**
3. Fill in PO details
4. Link to budget line items
5. Save

### 4. **Import Actuals**
1. Go to **Actuals Management**
2. Click **Import Actuals**
3. Upload actuals Excel file
4. Preview and commit

### 5. **View Analytics**
- Go to **Dashboard** to see real-time metrics and charts
- View **Import History** to track all imports

---

## 📊 Excel Import Formats

### Budget Import Format

| UID | Description | Tower | Budget Head | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Jan | Feb | Mar | Total |
|-----|-------------|-------|-------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-------|
| BUD-001 | Software Licenses | IT | Software | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 10000 | 120000 |

**Required Columns**:
- `UID` - Unique identifier
- `Description` - Service description
- Month columns (Apr-Mar for FY)
- `Total` - Sum of all months

**Optional Columns**:
- `Tower`
- `Budget Head`

### Actuals Import Format

| Invoice No | Invoice Date | Amount | Currency | UID | Vendor |
|------------|--------------|--------|----------|-----|--------|
| INV-001 | 2024-04-15 | 5000 | INR | BUD-001 | Vendor A |

**Required Columns**:
- `Invoice No`
- `Invoice Date`
- `Amount`

**Optional Columns**:
- `Currency` (defaults to INR)
- `UID` (for linking to budget)
- `Vendor`

---

## 🎯 Key Features to Explore

### Budget Management
- ✅ Import budgets from Excel
- ✅ Edit monthly allocations in Excel-like grid
- ✅ View detailed budget breakdown
- ✅ Export budgets to Excel
- ✅ Add reconciliation notes

### PO Management
- ✅ Create and edit POs
- ✅ Link POs to budget line items
- ✅ Track PO status
- ✅ Multi-currency support
- ✅ Automatic currency conversion

### Actuals Management
- ✅ Import actuals from Excel
- ✅ Auto-link to budgets via UID
- ✅ Monthly categorization
- ✅ Vendor tracking

### Reports & Analytics
- ✅ Real-time dashboard
- ✅ Tower-wise analysis
- ✅ Vendor spend analysis
- ✅ Monthly trends
- ✅ Budget utilization metrics

### Audit & History
- ✅ Import history tracking
- ✅ Audit logs for all changes
- ✅ User attribution
- ✅ Status tracking

---

## 🔧 Troubleshooting

### Backend won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process or change port in server/.env
```

### Frontend won't start
```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### Database errors
```powershell
# Reset database (WARNING: This will delete all data)
cd server
npx prisma db push --force-reset

# Regenerate Prisma client
npx prisma generate
```

### Import fails
- Check Excel file format matches the template
- Ensure column headers are exactly as specified
- Verify data types (numbers for amounts, dates for dates)
- Check for special characters in UID

---

## 📁 Project Structure

```
c:\jpm\New folder\New folder\
├── server/                 # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, logging, etc.
│   │   └── utils/         # Helper functions
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
├── client/                # Frontend (React + Vite + MUI)
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── styles/       # Common styles
│   │   └── context/      # React context (Auth)
│   └── package.json
│
└── Documentation/
    ├── FINAL_IMPLEMENTATION_SUMMARY.md
    ├── COMPREHENSIVE_IMPLEMENTATION_PLAN.md
    └── READY_TO_TEST.md
```

---

## 🌐 API Base URL

Make sure your frontend `.env` file has:

```env
VITE_API_URL=http://localhost:5000
```

---

## 📞 Need Help?

### Common Commands

**Backend**:
```powershell
npm run dev          # Start development server
npx prisma studio    # Open database GUI
npx prisma db push   # Apply schema changes
```

**Frontend**:
```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login with default credentials
- [ ] Dashboard loads with charts
- [ ] Can navigate to all pages
- [ ] Master data can be added
- [ ] Budget import works
- [ ] PO creation works
- [ ] Actuals import works
- [ ] Reports display correctly

---

## 🎉 You're All Set!

Your OPEX Management System is now ready to use. Start by:
1. Setting up master data
2. Importing your first budget
3. Creating a PO
4. Importing actuals
5. Viewing the dashboard

**Happy Managing! 🚀**
