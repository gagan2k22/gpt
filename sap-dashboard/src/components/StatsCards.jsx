import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

const items = [
    { title: 'Total Project', value: 1500, wide: true },
    { title: 'On Going', value: 250 },
    { title: 'On Hold', value: 100 },
    { title: 'Done', value: 500 },
];

export default function StatsCards() {
    return (
        <Grid container spacing={2}>
            {items.map((it, idx) => (
                <Grid item xs={12} md={it.wide ? 6 : 2} key={idx}>
                    <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: it.wide ? 'space-between' : 'center' }}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">{it.title}</Typography>
                            <Typography variant="h4" sx={{ mt: 1 }}>{it.value}</Typography>
                        </Box>
                        {it.wide && <Box sx={{ width: 160, height: 80, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }} />}
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}
