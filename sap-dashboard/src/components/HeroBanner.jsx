import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

export default function HeroBanner() {
    return (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                    <Typography variant="h5">Optimize your project and performance</Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        do it with certainty in small steps
                    </Typography>
                </Box>

                <Box sx={{ width: 140, height: 80, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2 }} />
            </Box>
        </Paper>
    );
}
