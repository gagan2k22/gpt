import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Button,
    Chip,
    Divider,
    Tabs,
    Tab,
    Alert,
    IconButton
} from '@mui/material';
import {
    ArrowBack,
    Edit,
    Add,
    AttachMoney,
    TrendingUp,
    History
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles, pageTransitionStyles } from '../styles/commonStyles';
import BudgetDetailTabs from '../components/BudgetDetailTabs';
import MonthlyVarianceChart from '../components/MonthlyVarianceChart';

const BudgetDetail = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/budget-detail/${uid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching budget detail:', err);
            setError(err.response?.data?.message || 'Failed to fetch budget detail');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (uid && token) {
            fetchDetail();
        }
    }, [uid, token]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={pageContainerStyles}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/budgets')}>
                    Back to Budgets
                </Button>
            </Box>
        );
    }

    if (!data) return null;

    const { lineItem, variance } = data;

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/budgets')}
                    sx={{ mb: 2 }}
                >
                    Back to Budgets
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
                            {lineItem.uid}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            {lineItem.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={lineItem.tower?.name || 'No Tower'} color="primary" variant="outlined" size="small" />
                            <Chip label={lineItem.budgetHead?.name || 'No Budget Head'} color="secondary" variant="outlined" size="small" />
                            <Chip label={lineItem.fiscalYear?.name || 'FY25'} color="default" variant="outlined" size="small" />
                        </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" color="text.secondary">Total Budget</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: lineItem.currency }).format(lineItem.totalBudget)}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            <Chip
                                label={`${variance.cumulative.variancePercentage.toFixed(1)}% Variance`}
                                color={variance.cumulative.variance >= 0 ? 'success' : 'error'}
                                size="small"
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%', borderLeft: '4px solid #1976d2' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AttachMoney color="primary" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" color="text.secondary">YTD Budget</Typography>
                        </Box>
                        <Typography variant="h4">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: lineItem.currency, maximumFractionDigits: 0 }).format(variance.cumulative.budget)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%', borderLeft: '4px solid #ed6c02' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TrendingUp color="warning" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" color="text.secondary">YTD Actuals</Typography>
                        </Box>
                        <Typography variant="h4">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: lineItem.currency, maximumFractionDigits: 0 }).format(variance.cumulative.actual)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%', borderLeft: `4px solid ${variance.cumulative.variance >= 0 ? '#2e7d32' : '#d32f2f'}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <History color={variance.cumulative.variance >= 0 ? 'success' : 'error'} sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" color="text.secondary">Remaining</Typography>
                        </Box>
                        <Typography variant="h4" color={variance.cumulative.variance >= 0 ? 'success.main' : 'error.main'}>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: lineItem.currency, maximumFractionDigits: 0 }).format(variance.cumulative.variance)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Chart */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Monthly Variance Analysis</Typography>
                <Box sx={{ height: 300 }}>
                    <MonthlyVarianceChart data={variance.monthly} />
                </Box>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="Monthly Breakdown" />
                    <Tab label="Linked POs" />
                    <Tab label="Actuals History" />
                    <Tab label="Audit Log" />
                </Tabs>
                <Box sx={{ p: 3 }}>
                    <BudgetDetailTabs
                        value={tabValue}
                        data={data}
                        onRefresh={fetchDetail}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default BudgetDetail;
