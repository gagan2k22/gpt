import React from 'react';
import { Box, Typography, Button, List, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export default function Sidebar() {
    return (
        <Box
            sx={{
                width: 220,
                bgcolor: 'white',
                borderRadius: '16px 0 0 16px',
                boxShadow: 1,
                p: 2,
                m: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                alignItems: 'stretch'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main' }} />
                <Typography variant="h6">Cornic</Typography>
            </Box>

            <Button variant="contained" startIcon={<AddCircleIcon />} fullWidth>
                Create New
            </Button>

            <Divider />

            <List component="nav" dense>
                <ListItemButton>
                    <ListItemIcon><DashboardIcon /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon><ListAltIcon /></ListItemIcon>
                    <ListItemText primary="Project Management" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon><ListAltIcon /></ListItemIcon>
                    <ListItemText primary="Task List" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon><HistoryIcon /></ListItemIcon>
                    <ListItemText primary="History" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                    <ListItemText primary="Settings" />
                </ListItemButton>

                <ListItemButton>
                    <ListItemIcon><HelpOutlineIcon /></ListItemIcon>
                    <ListItemText primary="Help Center" />
                </ListItemButton>
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Button variant="contained" color="secondary" fullWidth>
                Upgrade Now
            </Button>
        </Box>
    );
}
