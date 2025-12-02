import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    Tooltip,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Security as SecurityIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ROLE_COLORS = {
    Admin: 'error',
    Approver: 'warning',
    Editor: 'info',
    Viewer: 'default'
};

const PERMISSION_MATRIX = {
    'View dashboards': { Viewer: true, Editor: true, Approver: true, Admin: true },
    'Create / edit line items': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Create / edit POs': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Submit PO for approval': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Approve / reject PO': { Viewer: false, Editor: false, Approver: true, Admin: true },
    'Edit budget BOA': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Approve budget changes': { Viewer: false, Editor: false, Approver: true, Admin: true },
    'Upload actuals': { Viewer: false, Editor: true, Approver: true, Admin: true },
    'Manage users & roles': { Viewer: false, Editor: false, Approver: false, Admin: true }
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState(['Viewer', 'Editor', 'Approver', 'Admin']);
    const [openDialog, setOpenDialog] = useState(false);
    const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: ['Viewer'],
        is_active: true
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showSnackbar('Error fetching users', 'error');
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                roles: user.roles || ['Viewer'],
                is_active: user.is_active
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                roles: ['Viewer'],
                is_active: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (editingUser) {
                // Update user
                await axios.put(
                    `${API_URL}/users/${editingUser.id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showSnackbar('User updated successfully', 'success');
            } else {
                // Create user
                await axios.post(
                    `${API_URL}/users`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showSnackbar('User created successfully', 'success');
            }

            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            showSnackbar(error.response?.data?.message || 'Error saving user', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar('User deleted successfully', 'success');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            showSnackbar(error.response?.data?.message || 'Error deleting user', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            User Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage users and their role-based permissions
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => setOpenPermissionDialog(true)}
                    >
                        View Permissions Matrix
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add User
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total Users
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {users.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Active Users
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {users.filter(u => u.is_active).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Admins
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {users.filter(u => u.roles?.includes('Admin')).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Approvers
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {users.filter(u => u.roles?.includes('Approver')).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Users Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Roles</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon color="action" />
                                        <Typography fontWeight="medium">{user.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {user.roles?.map((role) => (
                                            <Chip
                                                key={role}
                                                label={role}
                                                size="small"
                                                color={ROLE_COLORS[role] || 'default'}
                                            />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.is_active ? 'Active' : 'Inactive'}
                                        size="small"
                                        color={user.is_active ? 'success' : 'default'}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleOpenDialog(user)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* User Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <TextField
                            label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
                            type="password"
                            fullWidth
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!editingUser}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Roles</InputLabel>
                            <Select
                                multiple
                                value={formData.roles}
                                onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                                input={<OutlinedInput label="Roles" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" color={ROLE_COLORS[value]} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        <Checkbox checked={formData.roles.indexOf(role) > -1} />
                                        <ListItemText primary={role} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Permission Matrix Dialog */}
            <Dialog open={openPermissionDialog} onClose={() => setOpenPermissionDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon />
                        <Typography variant="h6">Role & Permission Matrix</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Module / Action
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Viewer
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Editor
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Approver
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                        Admin
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(PERMISSION_MATRIX).map(([permission, roleAccess]) => (
                                    <TableRow key={permission} hover>
                                        <TableCell>{permission}</TableCell>
                                        <TableCell align="center">
                                            {roleAccess.Viewer ? '✅' : '❌'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {roleAccess.Editor ? '✅' : '❌'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {roleAccess.Approver ? '✅' : '❌'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {roleAccess.Admin ? '✅' : '❌'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPermissionDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement;
