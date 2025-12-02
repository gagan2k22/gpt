import React from 'react';
import { Paper, Box, Typography, Avatar, Stack, Chip, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

export default function RightPanel() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Profile</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 72, height: 72 }}>HP</Avatar>
                    <Box>
                        <Typography variant="subtitle1">Hexa Pentania</Typography>
                        <Typography variant="caption" color="text.secondary">UI/UX Designer</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>80% Completed your profile</Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Member</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Avatar>G</Avatar><Avatar>P</Avatar><Avatar>B</Avatar>
                    <Chip label="+5" variant="outlined" />
                </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Event</Typography>
                <List dense>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar><EventAvailableIcon /></Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Design Sprint" secondary="01 June 2020 • 09:30 AM" />
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar><Avatar>WD</Avatar></ListItemAvatar>
                        <ListItemText primary="Wireframe Deluxe" secondary="10 June 2020 • 09:30 AM" />
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar><Avatar>ID</Avatar></ListItemAvatar>
                        <ListItemText primary="Interaction Design" secondary="21 June 2020 • 09:30 AM" />
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
}
