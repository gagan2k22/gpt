import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, Typography, LinearProgress } from '@mui/material';

const rows = [
    { no: 1, client: 'Microsoft', project: 'Dashboard Management', lastUpdate: '12/06/2021', progress: 80 },
    { no: 2, client: 'Google', project: 'Payment Transaction', lastUpdate: '20/10/2021', progress: 45, highlight: true },
    { no: 3, client: 'Airbnb', project: 'Airbnb', lastUpdate: '19/11/2021', progress: 62 },
    { no: 4, client: 'Apple', project: 'Apple', lastUpdate: '25/12/2021', progress: 92 },
    { no: 5, client: 'Facebook', project: 'Facebook', lastUpdate: '29/12/2021', progress: 30 },
];

export default function ProjectTable() {
    return (
        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Project Management</Typography>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>Clients</TableCell>
                        <TableCell>Project Name</TableCell>
                        <TableCell>Last Update</TableCell>
                        <TableCell>Progress</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.map((r) => (
                        <TableRow key={r.no} sx={r.highlight ? { background: 'linear-gradient(90deg, rgba(245,224,255,0.6), rgba(255,245,250,0.6))' } : {}}>
                            <TableCell>{r.no}</TableCell>
                            <TableCell>{r.client}</TableCell>
                            <TableCell>{r.project}</TableCell>
                            <TableCell>{r.lastUpdate}</TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinearProgress variant="determinate" value={r.progress} sx={{ width: 120, height: 8, borderRadius: 2 }} />
                                    <Typography variant="caption">{r.progress}%</Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}
