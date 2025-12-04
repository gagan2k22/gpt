import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import { Save, ArrowBack, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { pageContainerStyles, pageHeaderStyles, pageTitleStyles, pageTransitionStyles } from '../styles/commonStyles';
import POLineItemSelector from '../components/POLineItemSelector';

const POForm = () => {
    const { id } = useParams(); // If id exists, it's edit mode
    const navigate = useNavigate();
    const { token } = useAuth();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        poNumber: '',
        poDate: new Date().toISOString().split('T')[0],
        vendorId: '',
        currency: 'INR',
        poValue: '',
        exchangeRate: '1.0',
        prNumber: '',
        prDate: '',
        towerId: '',
        budgetHeadId: '',
        status: 'Draft'
    });

    const [linkedItems, setLinkedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [masters, setMasters] = useState({
        vendors: [],
        towers: [],
        budgetHeads: []
    });

    // Fetch masters and PO data if edit
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vendorsRes, towersRes, budgetHeadsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/master/vendors`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/master/towers`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/master/budget-heads`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setMasters({
                    vendors: vendorsRes.data,
                    towers: towersRes.data,
                    budgetHeads: budgetHeadsRes.data
                });

                if (isEdit) {
                    const poRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/pos/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const po = poRes.data;
                    setFormData({
                        poNumber: po.poNumber,
                        poDate: po.poDate.split('T')[0],
                        vendorId: po.vendorId || '',
                        currency: po.currency,
                        poValue: po.poValue,
                        exchangeRate: po.exchangeRate || '1.0',
                        prNumber: po.prNumber || '',
                        prDate: po.prDate ? po.prDate.split('T')[0] : '',
                        towerId: po.towerId || '',
                        budgetHeadId: po.budgetHeadId || '',
                        status: po.status
                    });

                    // Map linked items
                    if (po.poLineItems) {
                        setLinkedItems(po.poLineItems.map(link => ({
                            ...link.lineItem,
                            allocatedAmount: link.allocated_amount
                        })));
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data');
            } finally {
                setInitialLoading(false);
            }
        };

        if (token) fetchData();
    }, [token, id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                linkedLineItems: linkedItems.map(item => ({
                    id: item.id,
                    allocatedAmount: item.allocatedAmount
                }))
            };

            if (isEdit) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/pos/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/pos`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            navigate('/pos');
        } catch (err) {
            console.error('Error saving PO:', err);
            setError(err.response?.data?.message || 'Failed to save PO');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>
                    {isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/pos')}>
                    Back
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Basic Details */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>PO Details</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="PO Number"
                                        name="poNumber"
                                        value={formData.poNumber}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        disabled={isEdit}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="PO Date"
                                        name="poDate"
                                        type="date"
                                        value={formData.poDate}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        label="Vendor"
                                        name="vendorId"
                                        value={formData.vendorId}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    >
                                        {masters.vendors.map(v => (
                                            <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        label="Status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        fullWidth
                                    >
                                        <MenuItem value="Draft">Draft</MenuItem>
                                        <MenuItem value="Pending Approval">Pending Approval</MenuItem>
                                        <MenuItem value="Approved">Approved</MenuItem>
                                        <MenuItem value="Rejected">Rejected</MenuItem>
                                        <MenuItem value="Closed">Closed</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Financials */}
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Financials</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select
                                        label="Currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        fullWidth
                                    >
                                        <MenuItem value="INR">INR</MenuItem>
                                        <MenuItem value="USD">USD</MenuItem>
                                        <MenuItem value="EUR">EUR</MenuItem>
                                        <MenuItem value="GBP">GBP</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="PO Value"
                                        name="poValue"
                                        type="number"
                                        value={formData.poValue}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Exchange Rate"
                                        name="exchangeRate"
                                        type="number"
                                        value={formData.exchangeRate}
                                        onChange={handleChange}
                                        fullWidth
                                        disabled={formData.currency === 'INR'}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Common Currency Value: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(formData.poValue * formData.exchangeRate)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Linked Items */}
                        <Paper sx={{ p: 3 }}>
                            <POLineItemSelector
                                selectedItems={linkedItems}
                                onChange={setLinkedItems}
                            />
                        </Paper>
                    </Grid>

                    {/* Sidebar - Additional Info */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Classification</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Tower"
                                        name="towerId"
                                        value={formData.towerId}
                                        onChange={handleChange}
                                        fullWidth
                                    >
                                        {masters.towers.map(t => (
                                            <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Budget Head"
                                        name="budgetHeadId"
                                        value={formData.budgetHeadId}
                                        onChange={handleChange}
                                        fullWidth
                                    >
                                        {masters.budgetHeads.map(b => (
                                            <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>PR Details</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="PR Number"
                                        name="prNumber"
                                        value={formData.prNumber}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="PR Date"
                                        name="prDate"
                                        type="date"
                                        value={formData.prDate}
                                        onChange={handleChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                fullWidth
                                size="large"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                            >
                                {isEdit ? 'Update PO' : 'Create PO'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default POForm;
