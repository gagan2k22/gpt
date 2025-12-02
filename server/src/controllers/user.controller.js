const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { getPermissionsForRoles } = require('../middleware/permission.middleware');

/**
 * Get all users with their roles
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Format response
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            is_active: user.is_active,
            roles: user.roles.map(ur => ur.role.name),
            permissions: getPermissionsForRoles(user.roles.map(ur => ur.role.name))
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const roleNames = user.roles.map(ur => ur.role.name);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            is_active: user.is_active,
            roles: roleNames,
            permissions: getPermissionsForRoles(roleNames)
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Create new user
 */
const createUser = async (req, res) => {
    try {
        const { name, email, password, roles, is_active } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with roles
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                is_active: is_active !== undefined ? is_active : true,
                roles: {
                    create: (roles || ['Viewer']).map(roleName => ({
                        role: {
                            connectOrCreate: {
                                where: { name: roleName },
                                create: { name: roleName }
                            }
                        }
                    }))
                }
            },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        const roleNames = user.roles.map(ur => ur.role.name);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_active: user.is_active,
                roles: roleNames,
                permissions: getPermissionsForRoles(roleNames)
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, roles, is_active } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prepare update data
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (is_active !== undefined) updateData.is_active = is_active;

        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }

        // Update user
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        // Update roles if provided
        if (roles && Array.isArray(roles)) {
            // Delete existing roles
            await prisma.userRole.deleteMany({
                where: { user_id: parseInt(id) }
            });

            // Create new roles
            await prisma.userRole.createMany({
                data: roles.map(roleName => ({
                    user_id: parseInt(id),
                    role_id: undefined // Will be handled by connectOrCreate
                }))
            });

            // Alternative: Use nested create
            for (const roleName of roles) {
                const role = await prisma.role.upsert({
                    where: { name: roleName },
                    update: {},
                    create: { name: roleName }
                });

                await prisma.userRole.upsert({
                    where: {
                        user_id_role_id: {
                            user_id: parseInt(id),
                            role_id: role.id
                        }
                    },
                    update: {},
                    create: {
                        user_id: parseInt(id),
                        role_id: role.id
                    }
                });
            }
        }

        // Fetch updated user with roles
        const updatedUser = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        const roleNames = updatedUser.roles.map(ur => ur.role.name);

        res.json({
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                is_active: updatedUser.is_active,
                roles: roleNames,
                permissions: getPermissionsForRoles(roleNames)
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting yourself
        if (req.user && req.user.id === parseInt(id)) {
            return res.status(400).json({
                message: 'Cannot delete your own account'
            });
        }

        // Delete user roles first
        await prisma.userRole.deleteMany({
            where: { user_id: parseInt(id) }
        });

        // Delete user
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get all available roles
 */
const getAllRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get permission matrix
 */
const getPermissionMatrix = async (req, res) => {
    try {
        const { PERMISSIONS } = require('../middleware/permission.middleware');

        // Transform permissions into a more readable format
        const matrix = {};

        for (const [permission, roles] of Object.entries(PERMISSIONS)) {
            matrix[permission] = {
                Viewer: roles.includes('Viewer'),
                Editor: roles.includes('Editor'),
                Approver: roles.includes('Approver'),
                Admin: roles.includes('Admin')
            };
        }

        res.json({
            permissions: PERMISSIONS,
            matrix: matrix
        });
    } catch (error) {
        console.error('Error fetching permission matrix:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllRoles,
    getPermissionMatrix
};
