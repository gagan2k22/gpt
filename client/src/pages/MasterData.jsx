import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tabs, Tab, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Grid, Snackbar, Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles
} from '../styles/commonStyles';

const MasterData = () => {
    const [tab, setTab] = useState(0);
    const [towers, setTowers] = useState([]);
    const [budgetHeads, setBudgetHeads] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [costCentres, setCostCentres] = useState([]);
    const [poEntities, setPOEntities] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [allocationBases, setAllocationBases] = useState([]);
    const [currencyRates, setCurrencyRates] = useState([]);

    // Currency Rate Dialog State
    const [openRateDialog, setOpenRateDialog] = useState(false);
    const [rateFormData, setRateFormData] = useState({
        from_currency: 'USD',
        to_currency: 'INR',
        rate: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [
                towersRes,
                budgetHeadsRes,
                vendorsRes,
                costCentresRes,
                poEntitiesRes,
                serviceTypesRes,
                allocationBasesRes,
                currencyRatesRes
            ] = await Promise.all([
                axios.get('/api/master/towers', config),
                axios.get('/api/master/budget-heads', config),
                axios.get('/api/master/vendors', config),
                axios.get('/api/master/cost-centres', config),
                axios.get('/api/master/po-entities', config),
                axios.get('/api/master/service-types', config),
                axios.get('/api/master/allocation-bases', config),
                axios.get('/api/currency-rates', config)
            ]);

            setTowers(towersRes.data);
            setBudgetHeads(budgetHeadsRes.data);
            setVendors(vendorsRes.data);
            setCostCentres(costCentresRes.data);
            setPOEntities(poEntitiesRes.data);
            setServiceTypes(serviceTypesRes.data);
            setAllocationBases(allocationBasesRes.data);
            setCurrencyRates(currencyRatesRes.data);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const handleRateSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/currency-rates', rateFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSnackbar({ open: true, message: 'Currency rate saved successfully', severity: 'success' });
            setOpenRateDialog(false);
            fetchMasterData(); // Refresh data
        } catch (error) {
            console.error('Error saving rate:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Error saving rate',
                severity: 'error'
            });
        }
    };

    const handleDeleteRate = async (id) => {
        if (!window.confirm('Are you sure you want to delete this rate?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/currency-rates/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSnackbar({ open: true, message: 'Rate deleted successfully', severity: 'success' });
            fetchMasterData();
        } catch (error) {
            console.error('Error deleting rate:', error);
            setSnackbar({ open: true, message: 'Error deleting rate', severity: 'error' });
        }
    };

    const openAddRateDialog = () => {
        setRateFormData({ from_currency: 'USD', to_currency: 'INR', rate: '' });
        setOpenRateDialog(true);
    };

    const openEditRateDialog = (rate) => {
        setRateFormData({
            from_currency: rate.from_currency,
            to_currency: rate.to_currency,
            rate: rate.rate
        });
        setOpenRateDialog(true);
    };

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>
                    Master Data Management
                </Typography>
            </Box>

            <Paper elevation={2}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }} variant="scrollable" scrollButtons="auto">
                    <Tab label="Towers" />
                    <Tab label="Budget Heads" />
                    <Tab label="Vendors" />
                    <Tab label="Cost Centres" />
                    <Tab label="PO Entities" />
                    <Tab label="Service Types" />
                    <Tab label="Allocation Bases" />
                    <Tab label="Currency Rates" />
                </Tabs>

                {tab === 0 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {towers.map((tower, index) => (
                                    <TableRow key={tower.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{tower.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tab === 1 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Tower</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {budgetHeads.map((head, index) => (
                                    <TableRow key={head.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{head.name}</TableCell>
                                        <TableCell>{head.tower?.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tab === 2 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>GST Number</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Contact Person</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vendors.map((vendor, index) => (
                                    <TableRow key={vendor.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{vendor.name}</TableCell>
                                        <TableCell>{vendor.gst_number || '-'}</TableCell>
                                        <TableCell>{vendor.contact_person || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tab === 3 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Code</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {costCentres.map((cc, index) => (
                                    <TableRow key={cc.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{cc.code}</TableCell>
                                        <TableCell>{cc.description || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tab === 4 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {poEntities.map((entity, index) => (
                                    <TableRow key={entity.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{entity.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tab === 5 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {serviceTypes.map((type, index) => (
                                    <TableRow key={type.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{type.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tab === 6 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Sr. No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allocationBases.map((basis, index) => (
                                    <TableRow key={basis.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{basis.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tab === 7 && (
                    <Box>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={openAddRateDialog}
                            >
                                Add Rate
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                        <TableCell sx={{ fontWeight: 600, color: 'white' }}>From</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'white' }}>To</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'white' }}>Rate</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'white' }}>Last Updated</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'white' }}>Updated By</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currencyRates.map((rate) => (
                                        <TableRow key={rate.id} hover>
                                            <TableCell>{rate.from_currency}</TableCell>
                                            <TableCell>{rate.to_currency}</TableCell>
                                            <TableCell>{rate.rate.toFixed(4)}</TableCell>
                                            <TableCell>{new Date(rate.updated_at).toLocaleDateString()}</TableCell>
                                            <TableCell>{rate.updated_by?.name || '-'}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openEditRateDialog(rate)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteRate(rate.id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {currencyRates.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">No currency rates found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Paper>

            {/* Currency Rate Dialog */}
            <Dialog open={openRateDialog} onClose={() => setOpenRateDialog(false)}>
                <DialogTitle>{rateFormData.id ? 'Edit Currency Rate' : 'Add Currency Rate'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="From Currency"
                                fullWidth
                                value={rateFormData.from_currency}
                                onChange={(e) => setRateFormData({ ...rateFormData, from_currency: e.target.value })}
                            >
                                <MenuItem value="USD">USD</MenuItem>
                                <MenuItem value="EUR">EUR</MenuItem>
                                <MenuItem value="GBP">GBP</MenuItem>
                                <MenuItem value="JPY">JPY</MenuItem>
                                <MenuItem value="AUD">AUD</MenuItem>
                                <MenuItem value="CAD">CAD</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="To Currency"
                                fullWidth
                                value={rateFormData.to_currency}
                                onChange={(e) => setRateFormData({ ...rateFormData, to_currency: e.target.value })}
                                disabled // Always INR for now
                            >
                                <MenuItem value="INR">INR</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Conversion Rate"
                                type="number"
                                fullWidth
                                value={rateFormData.rate}
                                onChange={(e) => setRateFormData({ ...rateFormData, rate: e.target.value })}
                                helperText={`1 ${rateFormData.from_currency} = ? ${rateFormData.to_currency}`}
                                InputProps={{ inputProps: { min: 0, step: 0.0001 } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRateDialog(false)}>Cancel</Button>
                    <Button onClick={handleRateSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MasterData;
