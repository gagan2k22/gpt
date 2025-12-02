import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Paper, Typography, Button, TextField, Grid, MenuItem,
    CircularProgress, Snackbar, Alert, Divider, Card, CardContent
} from '@mui/material';
import { Save, ArrowBack, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const POCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // UID Selection
    const [uids, setUids] = useState([]);
    const [selectedUid, setSelectedUid] = useState('');

    // Budget Details (fetched based on UID)
    const [budgetDetails, setBudgetDetails] = useState(null);

    // PO Form Data
    const [poData, setPoData] = useState({
        po_number: '',
        vendor_id: '',
        po_date: new Date().toISOString().split('T')[0],
        total_po_value: '',
        currency: 'INR',
        remarks: ''
    });

    // Master Data for Dropdowns
    const [vendors, setVendors] = useState([]);

    // AbortController for cleanup
    const abortControllerRef = React.useRef(null);

    useEffect(() => {
        fetchInitialData();

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const fetchInitialData = async () => {
        try {
            abortControllerRef.current = new AbortController();
            const token = localStorage.getItem('token');

            const [lineItemsRes, vendorsRes] = await Promise.all([
                axios.get('/api/line-items?limit=1000', {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: abortControllerRef.current.signal
                }),
                axios.get('/api/master/vendors', {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: abortControllerRef.current.signal
                })
            ]);

            // Extract unique UIDs - optimized with Set
            const lineItemsData = lineItemsRes.data.data || lineItemsRes.data;
            const uniqueUids = [...new Set(lineItemsData.map(item => item.uid))];
            setUids(uniqueUids);
            setVendors(vendorsRes.data);
        } catch (error) {
            if (error.name !== 'CanceledError') {
                console.error('Error fetching initial data:', error);
                showSnackbar('Error loading data', 'error');
            }
        }
    };

    const handleUidChange = useCallback(async (event) => {
        const uid = event.target.value;
        setSelectedUid(uid);
        if (uid) {
            fetchBudgetDetails(uid);
        } else {
            setBudgetDetails(null);
        }
    }, []);

    const fetchBudgetDetails = useCallback(async (uid) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/pos/budget-details/${uid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBudgetDetails(response.data);

            // Auto-fill some PO fields if possible
            setPoData(prev => ({
                ...prev,
                vendor_id: response.data.vendor_id || '',
            }));
        } catch (error) {
            console.error('Error fetching budget details:', error);
            showSnackbar('Error fetching budget details', 'error');
            setBudgetDetails(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setPoData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!selectedUid || !budgetDetails) {
            showSnackbar('Please select a UID', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Prepare payload
            const payload = {
                ...poData,
                tower_id: budgetDetails.tower_id,
                budget_head_id: budgetDetails.budget_head_id,
                line_items: [{
                    uid: selectedUid,
                    service_description: budgetDetails.service_description,
                    unit_cost: poData.total_po_value,
                    quantity: 1,
                    total_cost: poData.total_po_value
                }],
                uid_details: budgetDetails
            };

            await axios.post('/api/pos', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSnackbar('PO created successfully', 'success');
            setTimeout(() => navigate('/pos'), 1500);
        } catch (error) {
            console.error('Error creating PO:', error);
            showSnackbar(error.response?.data?.message || 'Error creating PO', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedUid, budgetDetails, poData, navigate]);

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    const isBudgetExceeded = budgetDetails && budgetDetails.totalActual > budgetDetails.totalBudget;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/pos')} sx={{ mr: 2 }}>
                    Back
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Create New PO
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left Side: PO Form */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Select UID (from Budget Tracker)"
                                        value={selectedUid}
                                        onChange={handleUidChange}
                                        fullWidth
                                        required
                                        helperText="Select a UID to fetch budget details"
                                    >
                                        {uids.map((uid) => (
                                            <MenuItem key={uid} value={uid}>
                                                {uid}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                {budgetDetails && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="PO Number"
                                                name="po_number"
                                                value={poData.po_number}
                                                onChange={handleInputChange}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="PO Date"
                                                type="date"
                                                name="po_date"
                                                value={poData.po_date}
                                                onChange={handleInputChange}
                                                fullWidth
                                                required
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                select
                                                label="Vendor"
                                                name="vendor_id"
                                                value={poData.vendor_id}
                                                onChange={handleInputChange}
                                                fullWidth
                                                required
                                            >
                                                {vendors.map((vendor) => (
                                                    <MenuItem key={vendor.id} value={vendor.id}>
                                                        {vendor.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Total PO Value"
                                                type="number"
                                                name="total_po_value"
                                                value={poData.total_po_value}
                                                onChange={handleInputChange}
                                                fullWidth
                                                required
                                                InputProps={{ inputProps: { min: 0 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Remarks"
                                                name="remarks"
                                                value={poData.remarks}
                                                onChange={handleInputChange}
                                                fullWidth
                                                multiline
                                                rows={3}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                startIcon={<Save />}
                                                disabled={loading}
                                                fullWidth
                                            >
                                                {loading ? 'Creating...' : 'Create PO'}
                                            </Button>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                {/* Right Side: Budget Details & Warnings */}
                <Grid item xs={12} md={5}>
                    {budgetDetails ? (
                        <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Budget Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Service Description</Typography>
                                    <Typography variant="body1">{budgetDetails.service_description}</Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Budget Head</Typography>
                                    <Typography variant="body1">{budgetDetails.budget_head}</Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Entities</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {budgetDetails.entities.map((entity, index) => (
                                            <Typography key={index} variant="body2" sx={{ bgcolor: 'grey.100', px: 1, borderRadius: 1 }}>
                                                {entity}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Total Budget</Typography>
                                        <Typography variant="h6" color="primary.main">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(budgetDetails.totalBudget)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Total Actual</Typography>
                                        <Typography variant="h6" color={isBudgetExceeded ? 'error.main' : 'success.main'}>
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(budgetDetails.totalActual)}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {isBudgetExceeded && (
                                    <Alert severity="warning" icon={<Warning />} sx={{ mt: 3 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            Warning: Budget Exceeded
                                        </Typography>
                                        Please check Amount is excide more then Budget value.
                                        <br />
                                        An email notification will be sent to Gagan.sharma@hubl.com upon PO creation.
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Paper elevation={1} sx={{ p: 3, textAlign: 'center', color: 'text.secondary', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography>Select a UID to view budget details</Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default POCreate;
