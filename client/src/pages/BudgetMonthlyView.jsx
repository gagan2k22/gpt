import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import EditableGrid from '../components/EditableGrid';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles
} from '../styles/commonStyles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BudgetMonthlyView = () => {
    const [lineItems, setLineItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        tower: '',
        budgetHead: '',
        fiscalYear: ''
    });
    const [towers, setTowers] = useState([]);
    const [budgetHeads, setBudgetHeads] = useState([]);

    useEffect(() => {
        fetchMasterData();
        fetchLineItems();
    }, []);

    const fetchMasterData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [towersRes, budgetHeadsRes] = await Promise.all([
                axios.get(`${API_URL}/master/towers`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/master/budget-heads`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTowers(towersRes.data);
            setBudgetHeads(budgetHeadsRes.data);
        } catch (err) {
            console.error('Error fetching master data:', err);
        }
    };

    const fetchLineItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/line-items`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    include_months: true,
                    ...filters
                }
            });
            setLineItems(response.data);
        } catch (err) {
            console.error('Error fetching line items:', err);
            setError('Failed to load budget data');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/budgets/export?template=upload`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `budget_monthly_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error exporting:', err);
            alert('Failed to export data');
        }
    };

    if (loading) {
        return (
            <Box sx={{ ...pageContainerStyles, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Box>
                    <Typography sx={pageTitleStyles}>
                        Monthly Budget Editor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Edit monthly budget allocations with Excel-like interface
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchLineItems}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        color="success"
                    >
                        Export
                    </Button>
                </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Tower</InputLabel>
                    <Select
                        value={filters.tower}
                        onChange={(e) => setFilters({ ...filters, tower: e.target.value })}
                        label="Tower"
                    >
                        <MenuItem value="">All</MenuItem>
                        {towers.map(t => (
                            <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Budget Head</InputLabel>
                    <Select
                        value={filters.budgetHead}
                        onChange={(e) => setFilters({ ...filters, budgetHead: e.target.value })}
                        label="Budget Head"
                    >
                        <MenuItem value="">All</MenuItem>
                        {budgetHeads.map(bh => (
                            <MenuItem key={bh.id} value={bh.id}>{bh.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    onClick={fetchLineItems}
                    size="small"
                >
                    Apply Filters
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Summary */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Chip
                    label={`Total Line Items: ${lineItems.length}`}
                    color="primary"
                    variant="outlined"
                />
                <Chip
                    label={`Total Budget: ₹${lineItems.reduce((sum, item) => sum + parseFloat(item.totalBudget || 0), 0).toLocaleString('en-IN')}`}
                    color="success"
                    variant="outlined"
                />
            </Box>

            {/* Editable Grid */}
            {lineItems.length > 0 ? (
                <EditableGrid
                    lineItems={lineItems}
                    onUpdate={fetchLineItems}
                />
            ) : (
                <Alert severity="info">
                    No line items found. Try adjusting your filters or import budget data.
                </Alert>
            )}
        </Box>
    );
};

export default BudgetMonthlyView;
