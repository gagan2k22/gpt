const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all users (Admin only)
router.get('/', checkPermission('VIEW_USERS'), userController.getAllUsers);

// Get user by ID (Admin only)
router.get('/:id', checkPermission('VIEW_USERS'), userController.getUserById);

// Create new user (Admin only)
router.post('/', checkPermission('CREATE_USERS'), userController.createUser);

// Update user (Admin only)
router.put('/:id', checkPermission('EDIT_USERS'), userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', checkPermission('DELETE_USERS'), userController.deleteUser);

// Get all roles
router.get('/roles/all', checkPermission('VIEW_USERS'), userController.getAllRoles);

// Get permission matrix
router.get('/permissions/matrix', checkPermission('VIEW_USERS'), userController.getPermissionMatrix);

module.exports = router;
