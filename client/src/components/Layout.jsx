import React, { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Tabs,
    Tab,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Button,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    AccountBalance,
    ShoppingCart,
    BarChart,
    Settings as SettingsIcon,
    Logout,
    Person,
    ArrowDropDown,
    Security as SecurityIcon,
    Storage
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { logout, user } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    const handleSettingsClick = (event) => {
        setSettingsAnchorEl(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setSettingsAnchorEl(null);
    };

    const handleSettingsNavigate = (path) => {
        navigate(path);
        handleSettingsClose();
    };

    // Main navigation tabs
    const mainTabs = [
        { label: 'Dashboard', path: '/', icon: <DashboardIcon sx={{ mr: 1 }} /> },
        { label: 'Budgets', path: '/budgets', icon: <AccountBalance sx={{ mr: 1 }} /> },
        { label: 'Purchase Orders', path: '/pos', icon: <ShoppingCart sx={{ mr: 1 }} /> },
        { label: 'Actuals', path: '/actuals', icon: <BarChart sx={{ mr: 1 }} /> },
        { label: 'Actual BOA', path: '/actual-boa', icon: <BarChart sx={{ mr: 1 }} /> },
        { label: 'Budget BOA', path: '/budget-boa', icon: <AccountBalance sx={{ mr: 1 }} /> },
        { label: 'Import History', path: '/imports', icon: <Storage sx={{ mr: 1 }} /> },
    ];

    // Get current tab value
    const getCurrentTab = () => {
        const currentPath = location.pathname;
        const tabIndex = mainTabs.findIndex(tab => tab.path === currentPath);
        return tabIndex !== -1 ? tabIndex : false;
    };

    const handleTabChange = (event, newValue) => {
        if (newValue !== false) {
            navigate(mainTabs[newValue].path);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Top AppBar */}
            <AppBar position="static" elevation={2} sx={{ maxHeight: '48px', minHeight: '48px' }}>
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '48px !important', maxHeight: '48px', py: 0 }}>
                    {/* Logo/Brand */}
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: 1,
                            mr: 4,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                        onClick={() => navigate('/')}
                    >
                        OPEX MANAGER
                    </Typography>

                    {/* Navigation Tabs - Hidden on mobile */}
                    {!isMobile && (
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                            <Tabs
                                value={getCurrentTab()}
                                onChange={handleTabChange}
                                textColor="inherit"
                                TabIndicatorProps={{
                                    style: { backgroundColor: '#4caf50', height: 3 }
                                }}
                                sx={{
                                    minHeight: '48px',
                                    '& .MuiTab-root': {
                                        color: 'white',
                                        fontWeight: 500,
                                        minHeight: '48px',
                                        maxHeight: '48px',
                                        py: 0,
                                        fontSize: '0.875rem',
                                        '&.Mui-selected': {
                                            color: '#4caf50',
                                            fontWeight: 600,
                                            backgroundColor: '#0d47a1',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }
                                }}
                            >
                                {mainTabs.map((tab, index) => (
                                    <Tab
                                        key={index}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {React.cloneElement(tab.icon, {
                                                    sx: { mr: 0.5, fontSize: '1.1rem' }
                                                })}
                                                {tab.label}
                                            </Box>
                                        }
                                    />
                                ))}
                            </Tabs>

                            {/* Settings Dropdown */}
                            <Button
                                color="inherit"
                                onClick={handleSettingsClick}
                                endIcon={<ArrowDropDown sx={{ fontSize: '1.1rem' }} />}
                                startIcon={<SettingsIcon sx={{ fontSize: '1.1rem' }} />}
                                sx={{
                                    ml: 2,
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    minHeight: '48px',
                                    maxHeight: '48px',
                                    py: 0,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                    ...(location.pathname === '/master-data' || location.pathname === '/users' ? {
                                        color: '#4caf50',
                                        fontWeight: 600,
                                        backgroundColor: '#0d47a1',
                                        borderBottom: '3px solid #4caf50',
                                    } : {}),
                                    borderRadius: 0,
                                }}
                            >
                                Settings
                            </Button>
                            <Menu
                                anchorEl={settingsAnchorEl}
                                open={Boolean(settingsAnchorEl)}
                                onClose={handleSettingsClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem
                                    onClick={() => handleSettingsNavigate('/master-data')}
                                    selected={location.pathname === '/master-data'}
                                >
                                    <Storage sx={{ mr: 2 }} />
                                    Master Data
                                </MenuItem>
                                {user && user.roles && user.roles.includes('Admin') && (
                                    <MenuItem
                                        onClick={() => handleSettingsNavigate('/users')}
                                        selected={location.pathname === '/users'}
                                    >
                                        <SecurityIcon sx={{ mr: 2 }} />
                                        User Management
                                    </MenuItem>
                                )}
                            </Menu>
                        </Box>
                    )}

                    {/* User Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.875rem' }}>
                            {user?.username || 'User'}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleMenu}
                            color="inherit"
                            sx={{ p: 0.5 }}
                        >
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main' }}>
                                <Person sx={{ fontSize: '1rem' }} />
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem disabled>
                                <Person sx={{ mr: 2 }} />
                                {user?.username}
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <Logout sx={{ mr: 2 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    bgcolor: 'background.default',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
