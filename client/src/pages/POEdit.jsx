import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Paper, Typography, Button, TextField, Grid, MenuItem,
    CircularProgress, Snackbar, Alert, Divider, Card, CardContent
} from '@mui/material';
import { Save, ArrowBack, Warning } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const POEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // PO Data
    const [poData, setPoData] = useState(null);
    const [formData, setFormData] = useState({
        po_number: '',
        vendor_id: '',
        po_date: '',
        total_po_value: '',
        currency: 'INR',
        remarks: '',
        pr_number: '',
        pr_date: '',
        pr_amount: '',
        po_start_date: '',
        po_end_date: ''
    });

    // Master Data
    const [vendors, setVendors] = useState([]);

    // Validation errors
    const [validationErrors, setValidationErrors] = useState({
        pr_date: '',
        service_dates: ''
    });

    useEffect(() => {
        fetchPOData();
        fetchVendors();
    }, [id]);

    const fetchPOData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/pos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const po = response.data;
            setPoData(po);

            // Populate form
            setFormData({
                po_number: po.po_number || '',
                vendor_id: po.vendor_id || '',
                po_date: po.po_date ? po.po_date.split('T')[0] : '',
                total_po_value: po.total_po_value || '',
                currency: po.currency || 'INR',
                remarks: po.remarks || '',
                pr_number: po.pr_number || '',
                pr_date: po.pr_date ? po.pr_date.split('T')[0] : '',
                pr_amount: po.pr_amount || '',
                po_start_date: po.po_start_date ? po.po_start_date.split('T')[0] : '',
                po_end_date: po.po_end_date ? po.po_end_date.split('T')[0] : ''
            });
        } catch (error) {
            console.error('Error fetching PO:', error);
            showSnackbar('Error loading PO data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/master/vendors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Validate dates in real-time
            const errors = { pr_date: '', service_dates: '' };

            // Check PR Date > PO Date
            if ((name === 'pr_date' || name === 'po_date') && newData.pr_date && newData.po_date) {
                if (new Date(newData.pr_date) <= new Date(newData.po_date)) {
                    errors.pr_date = 'PR Date must be after PO Date';
                }
            }

            // Check Service Start < Service End
            if ((name === 'po_start_date' || name === 'po_end_date') && newData.po_start_date && newData.po_end_date) {
                if (new Date(newData.po_start_date) >= new Date(newData.po_end_date)) {
                    errors.service_dates = 'Service Start Date must be before Service End Date';
                }
            }

            setValidationErrors(errors);
            return newData;
        });
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        // Check for validation errors
        if (validationErrors.pr_date || validationErrors.service_dates) {
            showSnackbar('Please fix validation errors before submitting', 'error');
            return;
        }

        setSaving(true);

        try {
            const token = localStorage.getItem('token');

            await axios.put(`/api/pos/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSnackbar('PO updated successfully', 'success');
            setTimeout(() => navigate('/pos'), 1500);
        } catch (error) {
            console.error('Error updating PO:', error);
            showSnackbar(error.response?.data?.message || 'Error updating PO', 'error');
        } finally {
            setSaving(false);
        }
    }, [id, formData, navigate]);

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!poData) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">PO not found</Alert>
                <Button onClick={() => navigate('/pos')} sx={{ mt: 2 }}>Back to PO List</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/pos')} sx={{ mr: 2 }}>
                    Back
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Edit PO: {poData.po_number}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left Side: PO Form */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="PO Number"
                                        name="po_number"
                                        value={formData.po_number}
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
                                        value={formData.po_date}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Service Start Date"
                                        type="date"
                                        name="po_start_date"
                                        value={formData.po_start_date}
                                        onChange={handleInputChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Service End Date"
                                        type="date"
                                        name="po_end_date"
                                        value={formData.po_end_date}
                                        onChange={handleInputChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!validationErrors.service_dates}
                                        helperText={validationErrors.service_dates}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        label="Vendor"
                                        name="vendor_id"
                                        value={formData.vendor_id}
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
                                        value={formData.total_po_value}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        label="Currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                    >
                                        <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                                        <MenuItem value="USD">USD - US Dollar</MenuItem>
                                        <MenuItem value="EUR">EUR - Euro</MenuItem>
                                        <MenuItem value="GBP">GBP - British Pound</MenuItem>
                                        <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                                        <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
                                        <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="PR Number"
                                        name="pr_number"
                                        value={formData.pr_number}
                                        onChange={handleInputChange}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="PR Date"
                                        type="date"
                                        name="pr_date"
                                        value={formData.pr_date}
                                        onChange={handleInputChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!validationErrors.pr_date}
                                        helperText={validationErrors.pr_date}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="PR Amount"
                                        type="number"
                                        name="pr_amount"
                                        value={formData.pr_amount}
                                        onChange={handleInputChange}
                                        fullWidth
                                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Remarks"
                                        name="remarks"
                                        value={formData.remarks}
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
                                        disabled={saving}
                                        fullWidth
                                    >
                                        {saving ? 'Updating...' : 'Update PO'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                {/* Right Side: PO Details */}
                <Grid item xs={12} md={5}>
                    <Card elevation={3} sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                PO Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">UID</Typography>
                                <Typography variant="body1">
                                    {poData.line_items && poData.line_items.length > 0
                                        ? poData.line_items[0].uid
                                        : '-'}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Service Description</Typography>
                                <Typography variant="body1">
                                    {poData.line_items && poData.line_items.length > 0
                                        ? poData.line_items[0].service_description
                                        : '-'}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Budget Head</Typography>
                                <Typography variant="body1">{poData.budget_head?.name || '-'}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Tower</Typography>
                                <Typography variant="body1">{poData.tower?.name || '-'}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">PO Entity</Typography>
                                <Typography variant="body1">{poData.po_entity?.name || '-'}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                <Typography variant="body1" sx={{
                                    color: poData.status === 'Approved' ? 'success.main' :
                                        poData.status === 'Rejected' ? 'error.main' : 'info.main',
                                    fontWeight: 600
                                }}>
                                    {poData.status}
                                </Typography>
                            </Box>

                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="caption">
                                    Created: {new Date(poData.created_at).toLocaleString()}
                                </Typography>
                            </Alert>
                        </CardContent>
                    </Card>
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

export default POEdit;
