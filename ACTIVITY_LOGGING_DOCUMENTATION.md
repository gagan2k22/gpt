# User Activity Logging & Data Retention Policy

## Overview
This document describes the user activity logging system and data retention policies implemented in the OPEX Management System.

## Features Implemented

### 1. User Activity Logging
- **What is Logged**: All API requests made by users
- **Information Captured**:
  - User ID and username (if authenticated)
  - Action performed (HTTP method + URL)
  - Request details (body/query params, passwords masked)
  - IP address
  - Timestamp

### 2. Data Retention Policy
- **Retention Period**: 30 days
- **Automatic Cleanup**: Runs daily at midnight
- **What Gets Deleted**: Activity logs older than 30 days
- **What is Protected**: All other data (budgets, POs, actuals, master data) is NEVER automatically deleted

### 3. Data Protection
- **User Data**: Never deleted automatically - only by explicit user action
- **Master Data**: Never deleted automatically
- **Budgets**: Never deleted automatically
- **Purchase Orders**: Never deleted automatically
- **Actuals**: Never deleted automatically
- **Only Activity Logs**: Are automatically cleaned up after 30 days

## Technical Implementation

### Database Schema
```prisma
model UserActivityLog {
  id          Int      @id @default(autoincrement())
  user_id     Int?
  username    String?
  action      String   // HTTP Method + URL
  details     String?  // Request body or query params
  ip_address  String?
  timestamp   DateTime @default(now())
  
  user        User?    @relation(fields: [user_id], references: [id])
}
```

### Middleware
- **File**: `server/src/middleware/activityLog.middleware.js`
- **Purpose**: Captures all API requests and logs them to the database
- **Features**:
  - Logs after response is sent (non-blocking)
  - Masks sensitive data (passwords)
  - Truncates long request bodies
  - Only logs API requests (skips static files)

### Cron Job
- **File**: `server/src/utils/cronJobs.js`
- **Schedule**: Daily at midnight (00:00)
- **Action**: Deletes activity logs older than 30 days
- **Query**: 
  ```javascript
  await prisma.userActivityLog.deleteMany({
    where: {
      timestamp: {
        lt: thirtyDaysAgo
      }
    }
  });
  ```

## Usage

### Viewing Activity Logs
Activity logs are stored in the `UserActivityLog` table. You can query them using Prisma:

```javascript
// Get recent activity for a user
const logs = await prisma.userActivityLog.findMany({
  where: { user_id: userId },
  orderBy: { timestamp: 'desc' },
  take: 100
});

// Get all activity in the last 7 days
const recentLogs = await prisma.userActivityLog.findMany({
  where: {
    timestamp: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  }
});
```

### Manual Cleanup
If you need to manually clean up logs:

```javascript
// Delete logs older than X days
const xDaysAgo = new Date();
xDaysAgo.setDate(xDaysAgo.getDate() - X);

await prisma.userActivityLog.deleteMany({
  where: {
    timestamp: { lt: xDaysAgo }
  }
});
```

## Security Considerations

1. **Password Masking**: Passwords in request bodies are automatically masked as '***'
2. **Data Truncation**: Request details are truncated to 1000 characters to prevent database bloat
3. **Anonymous Logging**: If a user is not authenticated, logs are still created with username as 'Anonymous'
4. **IP Tracking**: IP addresses are logged for security audit purposes

## Monitoring

### Cron Job Logs
The cron job outputs to the console:
- "Initializing Cron Jobs..." on server start
- "Running daily cleanup job..." when the job runs
- "Cleanup complete. Deleted X old activity logs." after successful cleanup
- Error messages if cleanup fails

### Activity Log Statistics
You can monitor activity log growth:

```javascript
// Count total logs
const totalLogs = await prisma.userActivityLog.count();

// Count logs by user
const logsByUser = await prisma.userActivityLog.groupBy({
  by: ['user_id'],
  _count: true
});
```

## Configuration

### Changing Retention Period
To change the 30-day retention period, edit `server/src/utils/cronJobs.js`:

```javascript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Change 30 to desired days
```

### Changing Cleanup Schedule
To change when cleanup runs, edit the cron schedule in `server/src/utils/cronJobs.js`:

```javascript
// Current: Daily at midnight
cron.schedule('0 0 * * *', async () => { ... });

// Examples:
// Every hour: '0 * * * *'
// Every Sunday at 2am: '0 2 * * 0'
// Every 1st of month: '0 0 1 * *'
```

## Future Enhancements

Potential improvements for the activity logging system:

1. **Admin Dashboard**: Create a UI page to view and filter activity logs
2. **Export Functionality**: Allow exporting logs to CSV/Excel
3. **Alert System**: Send alerts for suspicious activity patterns
4. **Log Aggregation**: Summarize logs before deletion (e.g., daily statistics)
5. **Configurable Retention**: Allow admins to configure retention period via UI
6. **Audit Reports**: Generate compliance audit reports from activity logs
