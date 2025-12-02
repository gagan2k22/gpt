# OPEX Management System - Testing & Troubleshooting Guide

## Overview
This document provides comprehensive testing procedures and troubleshooting steps for the OPEX Management System.

## Recent Improvements

### 1. Enhanced Error Handling
- ✅ Added comprehensive try-catch blocks in all controllers
- ✅ Implemented graceful shutdown handlers
- ✅ Added request timeout middleware (30 seconds)
- ✅ Enhanced CORS configuration
- ✅ Added request body size limits (10MB)
- ✅ Improved error logging with detailed context
- ✅ Added specific error handlers for Prisma errors

### 2. Input Validation
- ✅ Created validation middleware for all inputs
- ✅ Added required field validation
- ✅ Added type validation for numeric fields
- ✅ Added foreign key existence checks
- ✅ Added duplicate UID prevention
- ✅ Added sanitization to prevent injection attacks

### 3. Database Stability
- ✅ Implemented Prisma client singleton pattern
- ✅ Added connection pooling
- ✅ Added automatic reconnection on failure
- ✅ Added database cleanup scripts
- ✅ Added orphaned record detection and fixing

### 4. Testing Infrastructure
- ✅ Comprehensive database test suite
- ✅ API endpoint test suite
- ✅ Automated test runner
- ✅ Database repair script

## Testing Procedures

### Quick Test (Recommended)
```bash
# Run all tests automatically
run_tests.bat
```

### Manual Testing

#### 1. Database Tests
```bash
cd server
node test_comprehensive.js
```

This will test:
- Database connection
- All Prisma models
- Data integrity
- Relationships
- Unique constraints
- Data validation
- Orphaned records

#### 2. Database Repair
If database tests fail, run:
```bash
cd server
node fix_database.js
```

This will:
- Fix duplicate UIDs
- Fix orphaned records
- Validate and fix calculations
- Ensure master data exists
- Clean up invalid data
- Optimize database

#### 3. API Endpoint Tests
**Note:** Server must be running first!

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Run API tests
cd server
node test_api_endpoints.js
```

This will test all API endpoints:
- Authentication
- Master Data (Towers, Budget Heads, Vendors, etc.)
- Budgets
- Line Items
- Purchase Orders
- Actuals
- Fiscal Years

## Common Issues and Solutions

### Issue 1: Server Crashes Frequently

**Symptoms:**
- Server stops unexpectedly
- "Unhandled rejection" errors
- Connection timeouts

**Solutions:**
1. ✅ **FIXED**: Added graceful shutdown handlers
2. ✅ **FIXED**: Added uncaught exception handlers
3. ✅ **FIXED**: Added request timeouts
4. ✅ **FIXED**: Enhanced error handling in all routes

**Verification:**
```bash
# Check server logs for detailed error information
# Errors now include timestamp, path, method, and stack trace
```

### Issue 2: Database Errors

**Symptoms:**
- "Unique constraint failed"
- "Foreign key constraint failed"
- "Record not found"

**Solutions:**
1. ✅ **FIXED**: Added duplicate checking before inserts
2. ✅ **FIXED**: Added foreign key validation
3. ✅ **FIXED**: Added specific Prisma error handlers

**Verification:**
```bash
cd server
node test_comprehensive.js
```

### Issue 3: Invalid Data Causing Crashes

**Symptoms:**
- Server crashes on certain API calls
- "Cannot read property of undefined"
- Type conversion errors

**Solutions:**
1. ✅ **FIXED**: Added input validation middleware
2. ✅ **FIXED**: Added type checking for all numeric fields
3. ✅ **FIXED**: Added required field validation
4. ✅ **FIXED**: Added sanitization middleware

**Verification:**
```bash
# Try sending invalid data to API endpoints
# Should now return 400 Bad Request with detailed error messages
```

### Issue 4: Slow or Hanging Requests

**Symptoms:**
- Requests take too long
- Server becomes unresponsive
- Memory leaks

**Solutions:**
1. ✅ **FIXED**: Added 30-second request timeout
2. ✅ **FIXED**: Implemented Prisma client singleton
3. ✅ **FIXED**: Added connection cleanup on shutdown
4. ✅ **FIXED**: Added database optimization script

**Verification:**
```bash
# Monitor server memory usage
# Check response times in API tests
```

## File Structure

### New Files Created

```
server/
├── test_comprehensive.js      # Database test suite
├── test_api_endpoints.js      # API endpoint tests
├── fix_database.js            # Database repair script
└── src/
    ├── middleware/
    │   └── validation.js      # Input validation middleware
    └── prisma.js              # Enhanced Prisma client (updated)

run_tests.bat                  # Automated test runner
TESTING_GUIDE.md              # This file
```

### Modified Files

```
server/src/
├── app.js                     # Enhanced with error handling
├── controllers/
│   └── lineItem.controller.js # Added validation and error handling
```

## Best Practices

### 1. Before Deploying Changes
```bash
# Always run tests before deploying
run_tests.bat

# Fix any issues
cd server
node fix_database.js

# Re-run tests to verify
node test_comprehensive.js
```

### 2. Regular Maintenance
```bash
# Weekly: Run database optimization
cd server
node fix_database.js

# Monthly: Review error logs
# Check for patterns in errors
```

### 3. Monitoring
- Monitor server logs for errors
- Check database size regularly
- Review API response times
- Monitor memory usage

## Environment Variables

Add these to your `.env` file for better control:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=*

# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET=your_jwt_secret_here
```

## Performance Optimizations

### Implemented:
1. ✅ Request body size limits (10MB)
2. ✅ Request timeouts (30 seconds)
3. ✅ Database connection pooling
4. ✅ Singleton Prisma client
5. ✅ Rate limiting middleware (optional)

### Recommended:
1. Enable database query logging in development
2. Use production-grade database (PostgreSQL) for production
3. Implement caching for frequently accessed data
4. Add database indexes for common queries

## Troubleshooting Commands

```bash
# Check if server is running
curl http://localhost:5000/health

# Check database connection
cd server
node -e "const prisma = require('./src/prisma'); prisma.$connect().then(() => console.log('Connected')).catch(e => console.error(e))"

# View database statistics
cd server
node -e "const prisma = require('./src/prisma'); prisma.user.count().then(c => console.log('Users:', c))"

# Reset database (CAUTION: Deletes all data!)
cd server
npx prisma migrate reset

# Regenerate Prisma client
cd server
npx prisma generate
```

## Support

If issues persist after following this guide:

1. Check server logs for detailed error messages
2. Run `node test_comprehensive.js` for database diagnostics
3. Run `node fix_database.js` to repair common issues
4. Review the error details in the test output

## Changelog

### Version 1.1.0 (Current)
- Added comprehensive error handling
- Added input validation middleware
- Added automated testing suite
- Added database repair scripts
- Enhanced Prisma client with singleton pattern
- Added graceful shutdown handlers
- Improved error logging
- Added request timeouts
- Enhanced CORS configuration

### Version 1.0.0 (Initial)
- Basic CRUD operations
- Authentication
- Master data management
- Budget tracking
- PO management
