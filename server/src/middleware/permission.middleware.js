// Permission matrix based on roles
const PERMISSIONS = {
    // Dashboard permissions
    VIEW_DASHBOARDS: ['Viewer', 'Editor', 'Approver', 'Admin'],

    // Line item permissions
    CREATE_LINE_ITEMS: ['Editor', 'Approver', 'Admin'],
    EDIT_LINE_ITEMS: ['Editor', 'Approver', 'Admin'],
    DELETE_LINE_ITEMS: ['Editor', 'Approver', 'Admin'],

    // PO permissions
    CREATE_PO: ['Editor', 'Approver', 'Admin'],
    EDIT_PO: ['Editor', 'Approver', 'Admin'],
    DELETE_PO: ['Editor', 'Approver', 'Admin'],
    SUBMIT_PO: ['Editor', 'Approver', 'Admin'],
    APPROVE_PO: ['Approver', 'Admin'],
    REJECT_PO: ['Approver', 'Admin'],

    // Budget permissions
    EDIT_BUDGET_BOA: ['Editor', 'Approver', 'Admin'],
    APPROVE_BUDGET_CHANGES: ['Approver', 'Admin'],

    // Actuals permissions
    UPLOAD_ACTUALS: ['Editor', 'Approver', 'Admin'],

    // User management permissions
    MANAGE_USERS: ['Admin'],
    MANAGE_ROLES: ['Admin'],
    VIEW_USERS: ['Admin'],
    CREATE_USERS: ['Admin'],
    EDIT_USERS: ['Admin'],
    DELETE_USERS: ['Admin'],

    // Master Data permissions
    MANAGE_MASTER_DATA: ['Admin']
};

/**
 * Middleware to check if user has required permission
 * @param {string} permission - Permission name from PERMISSIONS object
 */
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({
                message: 'Authentication required',
                permission: permission
            });
        }

        const allowedRoles = PERMISSIONS[permission];

        if (!allowedRoles) {
            console.error(`Unknown permission: ${permission}`);
            return res.status(500).json({
                message: 'Invalid permission configuration'
            });
        }

        // Check if user has any of the allowed roles
        const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));

        if (!hasPermission) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                required: permission,
                allowedRoles: allowedRoles,
                userRoles: req.user.roles
            });
        }

        next();
    };
};

/**
 * Middleware to check if user has any of the specified roles
 * @param  {...string} roles - Role names
 */
const hasAnyRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const hasRole = req.user.roles.some(role => roles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                requiredRoles: roles,
                userRoles: req.user.roles
            });
        }

        next();
    };
};

/**
 * Middleware to check if user has all of the specified roles
 * @param  {...string} roles - Role names
 */
const hasAllRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const hasAll = roles.every(role => req.user.roles.includes(role));

        if (!hasAll) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                requiredRoles: roles,
                userRoles: req.user.roles
            });
        }

        next();
    };
};

/**
 * Get all permissions for a given set of roles
 * @param {Array<string>} roles - Array of role names
 * @returns {Array<string>} - Array of permission names
 */
const getPermissionsForRoles = (roles) => {
    const permissions = [];

    for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
        if (roles.some(role => allowedRoles.includes(role))) {
            permissions.push(permission);
        }
    }

    return permissions;
};

module.exports = {
    PERMISSIONS,
    checkPermission,
    hasAnyRole,
    hasAllRoles,
    getPermissionsForRoles
};
