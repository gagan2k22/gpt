import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to check if the current user has admin role
 * @returns {boolean} true if user is admin, false otherwise
 */
export const useIsAdmin = () => {
    const { user } = useAuth();

    if (!user || !user.roles) {
        return false;
    }

    // Check if user has Admin role
    return user.roles.some(role => role === 'Admin' || role.name === 'Admin');
};

/**
 * Custom hook to check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} true if user has permission
 */
export const useHasPermission = (permission) => {
    const { user } = useAuth();

    if (!user || !user.roles) {
        return false;
    }

    // Admin has all permissions
    if (user.roles.some(role => role === 'Admin' || role.name === 'Admin')) {
        return true;
    }

    // Check specific permission based on role
    // This can be extended based on your permission matrix
    return false;
};

export default { useIsAdmin, useHasPermission };
