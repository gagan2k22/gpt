import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';

export default function Header() {
    return (
        <Paper elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
                <Typography variant="h6">Dashboard</Typography>
                <Typography variant="subtitle2" color="text.secondary">Friday, 10 February 2021</Typography>
            </Box>

            <Button startIcon={<EventNoteIcon />} variant="outlined">
                12-Oct-2020 - 20-Oct-2020
            </Button>
        </Paper>
    );
}
