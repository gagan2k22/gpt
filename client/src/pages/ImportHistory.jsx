import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Schedule } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles, pageTransitionStyles } from '../styles/commonStyles';

const ImportHistory = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/imports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching import history:', err);
            setError('Failed to load import history');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>
                    Import History
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Filename</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell align="center">Rows</TableCell>
                            <TableCell align="center">Accepted</TableCell>
                            <TableCell align="center">Rejected</TableCell>
                            <TableCell align="center">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.length > 0 ? (
                            history.map((job) => (
                                <TableRow key={job.id} hover>
                                    <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={job.importType === 'budgets' ? 'Budget' : 'Actuals'}
                                            color={job.importType === 'budgets' ? 'primary' : 'secondary'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{job.filename}</TableCell>
                                    <TableCell>{job.user?.name || 'Unknown'}</TableCell>
                                    <TableCell align="center">{job.rowsTotal}</TableCell>
                                    <TableCell align="center" sx={{ color: 'success.main', fontWeight: 500 }}>
                                        {job.rowsAccepted}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: job.rowsRejected > 0 ? 'error.main' : 'text.secondary', fontWeight: job.rowsRejected > 0 ? 700 : 400 }}>
                                        {job.rowsRejected}
                                    </TableCell>
                                    <TableCell align="center">
                                        {job.status === 'Completed' ? (
                                            <Chip icon={<CheckCircle />} label="Completed" color="success" size="small" />
                                        ) : job.status === 'Failed' ? (
                                            <Chip icon={<ErrorIcon />} label="Failed" color="error" size="small" />
                                        ) : (
                                            <Chip icon={<Schedule />} label={job.status} color="default" size="small" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No import history found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ImportHistory;
