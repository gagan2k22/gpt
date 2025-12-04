import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
    CircularProgress, Snackbar, Alert, Select, OutlinedInput, InputLabel,
    FormControl, Checkbox, ListItemText, MenuItem
} from '@mui/material';
import { Add, FilterList, Clear, Visibility, Edit, FileDownload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { excelTableStyles } from '../styles/excelTableStyles';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles
} from '../styles/commonStyles';
import { useIsAdmin } from '../hooks/usePermissions';

const POList = () => {
    const [pos, setPOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();
    const isAdmin = useIsAdmin(); // Check if user is admin

    // Fiscal Year Selection (linked to Budget Tracker)
    const [selectedFiscalYears, setSelectedFiscalYears] = useState(['FY25', 'FY26']);
    const [availableFiscalYears, setAvailableFiscalYears] = useState(['FY25', 'FY26']);

    // Filter state
    const [filters, setFilters] = useState({
        uid: '',
        service_description: '',
        budget_head: '',
        entity: '',
        pr_number: '',
        po_number: '',
        vendor: '',
        remarks: ''
    });

    // AbortController for cleanup
    const abortControllerRef = React.useRef(null);

    useEffect(() => {
        fetchPOs();
        fetchFiscalYears();

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const fetchPOs = async () => {
        try {
            abortControllerRef.current = new AbortController();
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/pos?limit=1000', {
                headers: { Authorization: `Bearer ${token}` },
                signal: abortControllerRef.current.signal
            });
            // Handle both paginated and non-paginated responses
            const posData = response.data.data || response.data;
            setPOs(posData);
        } catch (error) {
            if (error.name !== 'CanceledError') {
                console.error('Error fetching POs:', error);
                showSnackbar('Error fetching purchase orders', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchFiscalYears = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/fiscal-years', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.length > 0) {
                const activeYears = response.data
                    .filter(fy => fy.is_active)
                    .map(fy => fy.label);

                if (activeYears.length > 0) {
                    setAvailableFiscalYears(activeYears);
                }
            }
        } catch (error) {
            console.error('Error fetching fiscal years:', error);
        }
    };

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    const formatCurrency = useCallback((amount, currency = 'INR') => {
        if (amount === null || amount === undefined || isNaN(amount)) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/ /g, '-');
    }, []);

    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({
            uid: '',
            service_description: '',
            budget_head: '',
            entity: '',
            pr_number: '',
            po_number: '',
            vendor: '',
            remarks: ''
        });
    }, []);

    const handleFiscalYearChange = useCallback((event) => {
        const {
            target: { value },
        } = event;
        const newYears = typeof value === 'string' ? value.split(',') : value;

        if (newYears.length > 0) {
            setSelectedFiscalYears(newYears);
        }
    }, []);



    const filteredPOs = useMemo(() => {
        return pos.filter(po => {
            if (filters.po_number && !po.po_number?.toLowerCase().includes(filters.po_number.toLowerCase())) return false;
            if (filters.pr_number && !po.pr_number?.toLowerCase().includes(filters.pr_number.toLowerCase())) return false;
            if (filters.vendor && !po.vendor?.name?.toLowerCase().includes(filters.vendor.toLowerCase())) return false;
            if (filters.budget_head && !po.budget_head?.name?.toLowerCase().includes(filters.budget_head.toLowerCase())) return false;
            if (filters.entity && !po.po_entity?.name?.toLowerCase().includes(filters.entity.toLowerCase())) return false;
            if (filters.remarks && !po.remarks?.toLowerCase().includes(filters.remarks.toLowerCase())) return false;
            return true;
        });
    }, [pos, filters]);

    const handleExportToExcel = useCallback(() => {
        try {
            const exportData = filteredPOs.map(po => ({
                'FY': `FY${new Date(po.po_date).getFullYear() % 100}`,
                'UID': po.line_items && po.line_items.length > 0 ? po.line_items[0].uid : '-',
                'Service Description': po.line_items && po.line_items.length > 0 ? po.line_items[0].service_description : '-',
                'Budget Head': po.budget_head?.name || '-',
                'Entity': po.po_entity?.name || '-',
                'PR Number': po.pr_number || '-',
                'PR Date': formatDate(po.pr_date),
                'PR Amount': po.pr_amount || 0,
                'Currency': po.currency,
                'PO Number': po.po_number,
                'PO Date': formatDate(po.po_date),
                'Service Start': formatDate(po.po_start_date),
                'Service End': formatDate(po.po_end_date),
                'Vendor': po.vendor?.name || '-',
                'PO Value': po.total_po_value,
                'Common Currency Value (INR)': po.common_currency_value || po.total_po_value,
                'Common Currency': po.common_currency,
                'Remarks': po.remarks || '-',
                'Value in Lac': po.value_in_lac || 0,
                'Status': po.status
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'PO Tracker');

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `PO_Tracker_${timestamp}.xlsx`;

            XLSX.writeFile(wb, filename);
            showSnackbar('PO data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            showSnackbar('Error exporting data', 'error');
        }
    }, [filteredPOs, formatDate, showSnackbar]);

    const getStatusColor = (status) => {
        const colors = {
            'Draft': 'default',
            'Submitted': 'info',
            'Approved': 'success',
            'Rejected': 'error',
            'Closed': 'secondary'
        };
        return colors[status] || 'default';
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
                    Purchase Order Tracker
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Clear />}
                        onClick={clearAllFilters}
                        color="secondary"
                    >
                        Clear Filters
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FileDownload />}
                        onClick={handleExportToExcel}
                        color="success"
                    >
                        Export to Excel
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/pos/new')}
                    >
                        Create PO
                    </Button>
                </Box>
            </Box>

            {/* Fiscal Year Selector */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl sx={{ m: 1, width: 300 }} size="small">
                    <InputLabel id="fiscal-year-select-label">View Fiscal Years</InputLabel>
                    <Select
                        labelId="fiscal-year-select-label"
                        id="fiscal-year-select"
                        multiple
                        value={selectedFiscalYears}
                        onChange={handleFiscalYearChange}
                        input={<OutlinedInput label="View Fiscal Years" />}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {availableFiscalYears.map((year) => (
                            <MenuItem key={year} value={year}>
                                <Checkbox checked={selectedFiscalYears.indexOf(year) > -1} />
                                <ListItemText primary={year} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    Select one or more fiscal years to display
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <TableContainer sx={excelTableStyles.tableContainer}>
                    <Table stickyHeader sx={excelTableStyles.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '60px' }}>FY</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>UID</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '200px' }}>Service Description</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '150px' }}>Budget Head</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>Entity</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>PR Number</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>PR Date</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>PR Amount</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '80px' }}>Currency</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>PO Number</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>PO Date</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>Service Start</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>Service End</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '150px' }}>Vendor</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>PO Value</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '140px' }}>Common Currency Value (INR)</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>Common Currency</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '150px' }}>Remarks</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>Value in Lac</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>Status</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '80px' }}>Actions</TableCell>
                            </TableRow>
                            {/* Filter Row */}
                            <TableRow>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.uid} onChange={(e) => handleFilterChange('uid', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.service_description} onChange={(e) => handleFilterChange('service_description', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.budget_head} onChange={(e) => handleFilterChange('budget_head', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.entity} onChange={(e) => handleFilterChange('entity', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.pr_number} onChange={(e) => handleFilterChange('pr_number', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.po_number} onChange={(e) => handleFilterChange('po_number', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.vendor} onChange={(e) => handleFilterChange('vendor', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.remarks} onChange={(e) => handleFilterChange('remarks', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                                <TableCell sx={excelTableStyles.filterCell}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPOs.map((po) => (
                                <TableRow key={po.id} sx={excelTableStyles.tableRow}>
                                    <TableCell sx={excelTableStyles.dataCell}>FY{new Date(po.po_date).getFullYear() % 100}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.line_items && po.line_items.length > 0 ? po.line_items[0].uid : '-'}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.line_items && po.line_items.length > 0 ? po.line_items[0].service_description : '-'}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.budget_head?.name || '-'}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.po_entity?.name || '-'}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.pr_number || '-'}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{formatDate(po.pr_date)}</TableCell>
                                    <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>{formatCurrency(po.pr_amount)}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.currency}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.po_number}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{formatDate(po.po_date)}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{formatDate(po.po_start_date)}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{formatDate(po.po_end_date)}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.vendor?.name || '-'}</TableCell>
                                    <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>{formatCurrency(po.total_po_value, po.currency)}</TableCell>
                                    <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>{formatCurrency(po.common_currency_value || po.total_po_value)}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.common_currency}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{po.remarks || '-'}</TableCell>
                                    <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>{po.value_in_lac ? `₹${po.value_in_lac.toFixed(2)}L` : '-'}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>
                                        <Chip
                                            label={po.status}
                                            color={getStatusColor(po.status)}
                                            size="small"
                                            sx={excelTableStyles.statusChip}
                                        />
                                    </TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>
                                        <Box sx={{ display: 'flex' }}>
                                            <IconButton size="small" onClick={() => navigate(`/pos/${po.id}`)} color="primary" sx={{ padding: '2px' }}>
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                            {isAdmin && (
                                                <IconButton size="small" onClick={() => navigate(`/pos/${po.id}/edit`)} color="secondary" sx={{ padding: '2px' }}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

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

export default POList;
