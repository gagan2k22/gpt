import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, TextField } from '@mui/material';
import axios from 'axios';

const ActualsList = () => {
    const [actuals, setActuals] = useState([]);
    const [fiscalYear, setFiscalYear] = useState(2025);

    useEffect(() => {
        fetchActuals();
    }, [fiscalYear]);

    const fetchActuals = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/actuals?fiscal_year=${fiscalYear}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActuals(response.data);
        } catch (error) {
            console.error('Error fetching actuals:', error);
        }
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Actuals Management
                </Typography>
                <TextField
                    select
                    label="Fiscal Year"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    sx={{ width: 150 }}
                >
                    <MenuItem value={2024}>FY 2024</MenuItem>
                    <MenuItem value={2025}>FY 2025</MenuItem>
                    <MenuItem value={2026}>FY 2026</MenuItem>
                </TextField>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>FY</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Month</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tower</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Budget Head</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cost Centre</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actual Amount (₹)</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Remarks</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {actuals.map((actual) => (
                            <TableRow key={actual.id} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{actual.fiscal_year}</TableCell>
                                <TableCell>{monthNames[actual.month - 1]}</TableCell>
                                <TableCell>{actual.tower?.name}</TableCell>
                                <TableCell>{actual.budget_head?.name}</TableCell>
                                <TableCell>{actual.cost_centre?.code}</TableCell>
                                <TableCell>{actual.actual_amount.toLocaleString('en-IN')}</TableCell>
                                <TableCell>{actual.remarks || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ActualsList;
