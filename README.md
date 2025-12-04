# OPEX Management System

**Version 2.0 - Production Ready**

A comprehensive OPEX (Operating Expenditure) Management System built with React, Node.js, Express, and Prisma. This system provides complete budget lifecycle management, purchase order tracking, actuals management, and real-time analytics.

---

## 🌟 Key Features

### Budget Management
- ✅ **Excel Import/Export** - Import budgets from Excel with validation and preview
- ✅ **Monthly Editor** - Excel-like grid for editing monthly allocations
- ✅ **Budget Detail View** - Comprehensive breakdown with variance analysis
- ✅ **Reconciliation Notes** - Add notes for budget-actual variances

### Purchase Order Management
- ✅ **PO Creation** - Create and edit POs with multi-currency support
- ✅ **Line Item Linking** - Link POs to budget line items
- ✅ **Auto Currency Conversion** - Automatic conversion to common currency
- ✅ **Status Tracking** - Track PO approval workflow

### Actuals Management
- ✅ **Excel Import** - Import actuals with automatic month assignment
- ✅ **UID Linking** - Auto-link actuals to budgets via UID
- ✅ **Vendor Tracking** - Track spend by vendor
- ✅ **Monthly Categorization** - Automatic month derivation from invoice date

### Reports & Analytics
- ✅ **Real-time Dashboard** - Live metrics and charts
- ✅ **Tower-wise Analysis** - Budget vs actuals by tower
- ✅ **Vendor Analysis** - Top 10 vendors by spend
- ✅ **Monthly Trends** - Spend trends over time
- ✅ **Utilization Metrics** - Budget utilization percentage

### Audit & Compliance
- ✅ **Import History** - Complete audit trail of all imports
- ✅ **Audit Logs** - Track all changes with user attribution
- ✅ **User Activity Logging** - Monitor user actions
- ✅ **Role-Based Access Control** - Granular permissions

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm or yarn

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd "c:\jpm\New folder\New folder"
   ```

2. **Backend Setup**
   ```powershell
   cd server
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```
   Backend runs on: `http://localhost:5000`

3. **Frontend Setup** (in a new terminal)
   ```powershell
   cd client
   npm install
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

4. **Login**
   - Navigate to `http://localhost:5173`
   - Login with: `admin@example.com` / `admin123`

---

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in minutes
- **[FINAL_IMPLEMENTATION_SUMMARY.md](./FINAL_IMPLEMENTATION_SUMMARY.md)** - Complete feature overview
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing procedures
- **[COMPREHENSIVE_IMPLEMENTATION_PLAN.md](./COMPREHENSIVE_IMPLEMENTATION_PLAN.md)** - Original implementation plan

---

## 🏗️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for database management
- **SQLite** - Database (easily switchable to PostgreSQL/MySQL)
- **ExcelJS** - Excel file processing
- **JWT** - Authentication
- **Multer** - File uploads

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Routing

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Dashboard  │  │  Budgets   │  │    POs     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Actuals   │  │  Reports   │  │   Admin    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │Controllers │  │  Services  │  │Middleware  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (SQLite)                       │
│  LineItems │ BudgetMonths │ POs │ Actuals │ ImportJobs     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Granular permissions (Admin, Editor, Approver, Viewer)
- **Input Validation** - Both frontend and backend validation
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **Password Hashing** - bcrypt for secure password storage
- **Activity Logging** - All user actions logged
- **Audit Trail** - Complete change history

---

## 📁 Project Structure

```
c:\jpm\New folder\New folder\
├── server/                     # Backend
│   ├── src/
│   │   ├── controllers/       # API request handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, logging, permissions
│   │   ├── utils/             # Helper functions
│   │   └── app.js             # Express app setup
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── package.json
│
├── client/                     # Frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── styles/            # Common styles
│   │   ├── context/           # React context
│   │   └── App.jsx            # Main app component
│   └── package.json
│
├── QUICK_START.md             # Quick start guide
├── FINAL_IMPLEMENTATION_SUMMARY.md
├── TESTING_GUIDE.md
└── README.md                  # This file
```

---

## 🎯 Key Workflows

### 1. Budget Import Workflow
```
Upload Excel → Preview (Dry Run) → Validate → Commit → View in List
```

### 2. PO Creation Workflow
```
New PO → Fill Details → Link Line Items → Set Amounts → Save
```

### 3. Actuals Import Workflow
```
Upload Excel → Preview → Auto-link to Budgets → Commit → View in List
```

### 4. Variance Analysis Workflow
```
Budget Detail → View Monthly Breakdown → Compare Actuals → Add Notes
```

---

## 🔧 Configuration

### Environment Variables

**Backend** (`server/.env`):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
```

---

## 📈 Performance Optimizations

- ✅ **Server-side aggregation** for reports
- ✅ **Debounced search** (500ms) for autocomplete
- ✅ **Pagination** for large datasets
- ✅ **Database transactions** for data integrity
- ✅ **Optimized Prisma queries** with selective includes
- ✅ **Code splitting** with React lazy loading
- ✅ **Memoization** for expensive calculations

---

## 🧪 Testing

Run the comprehensive test suite:

```powershell
# See TESTING_GUIDE.md for detailed test cases
```

Key test areas:
- Authentication & Authorization
- Budget Import/Export
- PO Creation & Editing
- Actuals Import
- Reports & Analytics
- Data Integrity
- Performance
- Security

---

## 🚢 Deployment

### Production Build

**Backend**:
```powershell
cd server
npm run build  # If you have a build script
npm start      # Production server
```

**Frontend**:
```powershell
cd client
npm run build
npm run preview  # Preview production build
```

### Database Migration

```powershell
cd server
npx prisma migrate deploy  # For production
```

---

## 📞 Support & Maintenance

### Common Issues

1. **Port already in use**
   ```powershell
   netstat -ano | findstr :5000
   # Kill the process or change port
   ```

2. **Database errors**
   ```powershell
   npx prisma db push --force-reset
   npx prisma generate
   ```

3. **Import fails**
   - Check Excel format
   - Verify column headers
   - Ensure data types are correct

### Logs Location
- Backend logs: Console output
- Activity logs: Database (`UserActivityLog` table)
- Audit logs: Database (`AuditLog` table)

---

## 🎓 User Roles & Permissions

| Role | View | Create | Edit | Delete | Approve | Admin |
|------|------|--------|------|--------|---------|-------|
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Editor** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Approver** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🗺️ Roadmap

### Completed ✅
- Budget Management (Import/Export, Monthly Editor, Detail View)
- PO Management (Create, Edit, Link to Budgets)
- Actuals Management (Import, Reconciliation)
- Reports & Analytics (Dashboard, Charts)
- Import History & Audit Trail

### Future Enhancements 🔮
- Saved filter views
- Bulk operations
- Email notifications
- PDF report generation
- Mobile app
- Advanced forecasting
- Real-time collaboration
- API documentation (Swagger)

---

## 📄 License

[Specify your license here]

---

## 👥 Contributors

[List contributors here]

---

## 🙏 Acknowledgments

Built with:
- React
- Material-UI
- Prisma
- Express.js
- Recharts

---

## 📧 Contact

For support or questions:
- Email: [your-email@example.com]
- Issues: [GitHub Issues URL]

---

**Made with ❤️ for efficient OPEX management**

---

## Quick Links

- 📖 [Quick Start Guide](./QUICK_START.md)
- 📋 [Testing Guide](./TESTING_GUIDE.md)
- 📊 [Implementation Summary](./FINAL_IMPLEMENTATION_SUMMARY.md)
- 🎯 [Implementation Plan](./COMPREHENSIVE_IMPLEMENTATION_PLAN.md)

---

**Version**: 2.0  
**Last Updated**: December 4, 2025  
**Status**: ✅ Production Ready
