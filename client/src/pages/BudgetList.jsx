import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer,
    DialogActions, TextField, Grid, MenuItem, Alert, IconButton, Snackbar, InputAdornment,
    Switch, FormControlLabel, CircularProgress, Chip, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
    Select, OutlinedInput, InputLabel, FormControl, Checkbox, ListItemText
} from '@mui/material';
import { Add, Download, Close, Upload, FilterList, Clear, FileDownload, Edit } from '@mui/icons-material';
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
import ImportModal from '../components/ImportModal';

const BudgetList = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // For editing
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openManageFYDialog, setOpenManageFYDialog] = useState(false);
    const [allFiscalYears, setAllFiscalYears] = useState([]); // For admin management
    const [openImportModal, setOpenImportModal] = useState(false);
    const isAdmin = useIsAdmin(); // Check if user is admin

    // Fiscal Year Selection
    const [selectedFiscalYears, setSelectedFiscalYears] = useState(['FY25', 'FY26']);

    // Filter state
    const [filters, setFilters] = useState({
        uid: '',
        parent_uid: '',
        vendor_name: '',
        service_description: '',
        start_date: '',
        end_date: '',
        is_renewal: '',
        budget_head_name: '',
        tower_name: '',
        contract_id: '',
        po_entity_name: '',
        allocation_basis_name: '',
        service_type_name: '',
        fy25_budget_min: '',
        fy25_budget_max: '',
        fy25_actuals_min: '',
        fy25_actuals_max: '',
        fy26_budget_min: '',
        fy26_budget_max: '',
        fy26_actuals_min: '',
        fy26_actuals_max: '',
        remarks: ''
    });

    // Master data
    const [vendors, setVendors] = useState([]);
    const [towers, setTowers] = useState([]);
    const [budgetHeads, setBudgetHeads] = useState([]);
    const [poEntities, setPOEntities] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [allocationBases, setAllocationBases] = useState([]);
    const [pos, setPOs] = useState([]);
    const [availableFiscalYears, setAvailableFiscalYears] = useState(['FY25', 'FY26']); // Default fallback

    // Form state
    const [formData, setFormData] = useState({
        uid: '',
        parent_uid: '',
        vendor_id: '',
        service_description: '',
        service_start_date: '',
        service_end_date: '',
        tower_id: '',
        budget_head_id: '',
        po_entity_id: '',
        service_type_id: '',
        allocation_basis_id: '',
        unit_cost: '',
        quantity: '',
        total_cost: '',
        fiscal_year: '',
        remarks: ''
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState({
        dateError: ''
    });

    // AbortController for cleanup
    const abortControllerRef = React.useRef(null);

    useEffect(() => {
        fetchBudgets();
        fetchMasterData();

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const fetchBudgets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/budgets/tracker', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            showSnackbar('Error fetching budgets', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [
                vendorsRes, towersRes, budgetHeadsRes, poEntitiesRes,
                serviceTypesRes, allocationBasesRes, posRes, fiscalYearsRes
            ] = await Promise.all([
                axios.get('/api/master/vendors', config),
                axios.get('/api/master/towers', config),
                axios.get('/api/master/budget-heads', config),
                axios.get('/api/master/po-entities', config),
                axios.get('/api/master/service-types', config),
                axios.get('/api/master/allocation-bases', config),
                axios.get('/api/pos', config),
                axios.get('/api/fiscal-years', config).catch(() => ({ data: [] })) // Handle failure gracefully if table doesn't exist yet
            ]);

            setVendors(vendorsRes.data);
            setTowers(towersRes.data);
            setBudgetHeads(budgetHeadsRes.data);
            setPOEntities(poEntitiesRes.data);
            setServiceTypes(serviceTypesRes.data);
            setAllocationBases(allocationBasesRes.data);
            setPOs(posRes.data);

            if (fiscalYearsRes.data && fiscalYearsRes.data.length > 0) {
                setAllFiscalYears(fiscalYearsRes.data);

                // Filter only active years and map to labels
                const activeYears = fiscalYearsRes.data
                    .filter(fy => fy.is_active)
                    .map(fy => fy.label);

                if (activeYears.length > 0) {
                    setAvailableFiscalYears(activeYears);
                }
            }
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-calculate total cost
            if (name === 'unit_cost' || name === 'quantity') {
                const unitCost = parseFloat(name === 'unit_cost' ? value : prev.unit_cost) || 0;
                const quantity = parseInt(name === 'quantity' ? value : prev.quantity) || 0;
                newData.total_cost = (unitCost * quantity).toFixed(2);
            }

            // Validate dates
            if (name === 'service_start_date' || name === 'service_end_date') {
                const startDate = name === 'service_start_date' ? value : prev.service_start_date;
                const endDate = name === 'service_end_date' ? value : prev.service_end_date;

                if (startDate && endDate) {
                    if (new Date(startDate) >= new Date(endDate)) {
                        setFormErrors(prevErrors => ({
                            ...prevErrors,
                            dateError: 'Service start date must be before end date'
                        }));
                    } else {
                        setFormErrors(prevErrors => ({
                            ...prevErrors,
                            dateError: ''
                        }));
                    }
                }
            }

            return newData;
        });
    }, []);

    const handleSubmit = async () => {
        // Validate dates before submission
        if (formErrors.dateError) {
            showSnackbar('Please fix the date error before submitting', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            if (editingItem) {
                // Update existing line item
                await axios.put(`/api/line-items/${editingItem.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Line item updated successfully!', 'success');
            } else {
                // Create new line item
                await axios.post('/api/line-items', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Line item added successfully!', 'success');
            }

            setOpenDialog(false);
            setEditingItem(null);
            resetForm();
            fetchBudgets();
        } catch (error) {
            console.error('Error saving line item:', error);
            showSnackbar(error.response?.data?.message || 'Error saving line item', 'error');
        }
    };

    const resetForm = useCallback(() => {
        setFormData({
            uid: '',
            parent_uid: '',
            vendor_id: '',
            service_description: '',
            service_start_date: '',
            service_end_date: '',
            tower_id: '',
            budget_head_id: '',
            po_entity_id: '',
            service_type_id: '',
            allocation_basis_id: '',
            unit_cost: '',
            quantity: '',
            total_cost: '',
            fiscal_year: '',
            remarks: ''
        });
        setFormErrors({
            dateError: ''
        });
    }, []);

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    const formatCurrency = useCallback((amount) => {
        if (amount === null || amount === undefined || isNaN(amount)) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
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

    // Filter handlers
    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({
            uid: '',
            parent_uid: '',
            vendor_name: '',
            service_description: '',
            start_date: '',
            end_date: '',
            is_renewal: '',
            budget_head_name: '',
            tower_name: '',
            contract_id: '',
            po_entity_name: '',
            allocation_basis_name: '',
            service_type_name: '',
            fy25_budget_min: '',
            fy25_budget_max: '',
            fy25_actuals_min: '',
            fy25_actuals_max: '',
            fy26_budget_min: '',
            fy26_budget_max: '',
            fy26_actuals_min: '',
            fy26_actuals_max: '',
            remarks: ''
        });
    }, []);

    // Fiscal Year Selection Handler
    const handleFiscalYearChange = useCallback((event) => {
        const {
            target: { value },
        } = event;
        // On autofill we get a stringified value.
        const newYears = typeof value === 'string' ? value.split(',') : value;

        if (newYears.length > 0) {
            setSelectedFiscalYears(newYears);
        }
    }, []);

    const handleToggleFYStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/fiscal-years/${id}/status`,
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh master data to update lists
            fetchMasterData();
            showSnackbar('Fiscal year status updated', 'success');
        } catch (error) {
            console.error('Error updating fiscal year status:', error);
            showSnackbar('Error updating status', 'error');
        }
    };

    const filteredBudgets = useMemo(() => {
        return budgets.filter(budget => {
            // Text filters (case-insensitive)
            if (filters.uid && !budget.uid?.toLowerCase().includes(filters.uid.toLowerCase())) return false;
            if (filters.parent_uid && !budget.parent_uid?.toLowerCase().includes(filters.parent_uid.toLowerCase())) return false;
            if (filters.vendor_name && !budget.vendor_name?.toLowerCase().includes(filters.vendor_name.toLowerCase())) return false;
            if (filters.service_description && !budget.service_description?.toLowerCase().includes(filters.service_description.toLowerCase())) return false;
            if (filters.budget_head_name && !budget.budget_head_name?.toLowerCase().includes(filters.budget_head_name.toLowerCase())) return false;
            if (filters.tower_name && !budget.tower_name?.toLowerCase().includes(filters.tower_name.toLowerCase())) return false;
            if (filters.contract_id && !budget.contract_id?.toLowerCase().includes(filters.contract_id.toLowerCase())) return false;
            if (filters.po_entity_name && !budget.po_entity_name?.toLowerCase().includes(filters.po_entity_name.toLowerCase())) return false;
            if (filters.allocation_basis_name && !budget.allocation_basis_name?.toLowerCase().includes(filters.allocation_basis_name.toLowerCase())) return false;
            if (filters.service_type_name && !budget.service_type_name?.toLowerCase().includes(filters.service_type_name.toLowerCase())) return false;
            if (filters.remarks && !budget.remarks?.toLowerCase().includes(filters.remarks.toLowerCase())) return false;

            // Date filters
            if (filters.start_date && new Date(budget.service_start_date) < new Date(filters.start_date)) return false;
            if (filters.end_date && new Date(budget.service_end_date) > new Date(filters.end_date)) return false;

            // Boolean/Select filters
            if (filters.is_renewal !== '' && String(budget.is_renewal) !== filters.is_renewal) return false;

            // Numeric Range filters (FY25)
            if (filters.fy25_budget_min && budget.fy25_budget < parseFloat(filters.fy25_budget_min)) return false;
            if (filters.fy25_budget_max && budget.fy25_budget > parseFloat(filters.fy25_budget_max)) return false;
            if (filters.fy25_actuals_min && budget.fy25_actuals < parseFloat(filters.fy25_actuals_min)) return false;
            if (filters.fy25_actuals_max && budget.fy25_actuals > parseFloat(filters.fy25_actuals_max)) return false;

            // Numeric Range filters (FY26)
            if (filters.fy26_budget_min && budget.fy26_budget < parseFloat(filters.fy26_budget_min)) return false;
            if (filters.fy26_budget_max && budget.fy26_budget > parseFloat(filters.fy26_budget_max)) return false;
            if (filters.fy26_actuals_min && budget.fy26_actuals < parseFloat(filters.fy26_actuals_min)) return false;
            if (filters.fy26_actuals_max && budget.fy26_actuals > parseFloat(filters.fy26_actuals_max)) return false;

            return true;
        });
    }, [budgets, filters]);

    const handleExportToExcel = useCallback(() => {
        try {
            // Prepare data for export
            const exportData = filteredBudgets.map(budget => {
                const row = {
                    'UID': budget.uid,
                    'Parent UID': budget.parent_uid || '-',
                    'Vendor': budget.vendor_name,
                    'Service Description': budget.service_description,
                    'Start Date': formatDate(budget.service_start_date),
                    'End Date': formatDate(budget.service_end_date),
                    'Renewal/PO': budget.is_renewal ? 'Renewal' : 'New PO',
                    'Budget Head': budget.budget_head_name,
                    'Tower': budget.tower_name,
                    'Contract/PO': budget.contract_id,
                    'PO Entity': budget.po_entity_name,
                    'Allocation Basis': budget.allocation_basis_name,
                    'Service Type': budget.service_type_name,
                };

                // Add fiscal year columns dynamically based on selected years
                selectedFiscalYears.forEach(fy => {
                    const yearNum = fy.replace('FY', '');
                    row[`${fy} Budget`] = budget[`fy${yearNum.toLowerCase()}_budget`] || 0;
                    row[`${fy} Actuals`] = budget[`fy${yearNum.toLowerCase()}_actuals`] || 0;
                    row[`${fy} Total Budget (UID)`] = budget[`uid_total_fy${yearNum.toLowerCase()}_budget`] || 0;
                    row[`${fy} Total Actuals (UID)`] = budget[`uid_total_fy${yearNum.toLowerCase()}_actuals`] || 0;
                });

                row['Remarks'] = budget.remarks || '-';
                return row;
            });

            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Budget Tracker');

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `Budget_Tracker_${timestamp}.xlsx`;

            // Save file
            XLSX.writeFile(wb, filename);
            showSnackbar('Budget data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            showSnackbar('Error exporting data', 'error');
        }
    }, [filteredBudgets, selectedFiscalYears, formatDate, showSnackbar]);


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
                    Budget Tracker
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => window.location.href = '/budgets/monthly'}
                        color="info"
                    >
                        Monthly Editor
                    </Button>
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
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={() => setOpenImportModal(true)}
                        color="primary"
                    >
                        Import Budget
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Add Line Item
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

                <Button
                    size="small"
                    variant="text"
                    onClick={() => setOpenManageFYDialog(true)}
                >
                    Manage
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    Select one or more fiscal years to display their Budget and Actuals columns
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', border: '1px solid #d0d7de', borderRadius: '6px' }}>
                <TableContainer sx={excelTableStyles.tableContainer}>
                    <Table stickyHeader sx={excelTableStyles.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>UID</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>Parent UID</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '150px' }}>Vendor</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '200px' }}>Service Description</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '90px' }}>Start Date</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '90px' }}>End Date</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>Renewal/PO</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '150px' }}>Budget Head</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>Tower</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>Contract/PO</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>PO Entity</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>Allocation Basis</TableCell>
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '120px' }}>Service Type</TableCell>
                                {selectedFiscalYears.includes('FY25') && (
                                    <>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>FY25 Budget</TableCell>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>FY25 Actuals</TableCell>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px', bgcolor: '#e3f2fd' }}>FY25 Total (UID)</TableCell>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px', bgcolor: '#e3f2fd' }}>FY25 Actuals (UID)</TableCell>
                                    </>
                                )}
                                {selectedFiscalYears.includes('FY26') && (
                                    <>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>FY26 Budget</TableCell>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>FY26 Actuals</TableCell>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px', bgcolor: '#e3f2fd' }}>FY26 Total (UID)</TableCell>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px', bgcolor: '#e3f2fd' }}>FY26 Actuals (UID)</TableCell>
                                    </>
                                )}
                                {selectedFiscalYears.includes('FY27') && (
                                    <>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>FY27 Budget</TableCell>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px' }}>FY27 Actuals</TableCell>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px', bgcolor: '#e3f2fd' }}>FY27 Total (UID)</TableCell>
                                        <TableCell align="right" sx={{ ...excelTableStyles.headerCell, minWidth: '100px', bgcolor: '#e3f2fd' }}>FY27 Actuals (UID)</TableCell>
                                    </>
                                )}
                                <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '150px' }}>Remarks</TableCell>
                                {isAdmin && <TableCell sx={{ ...excelTableStyles.headerCell, minWidth: '80px' }}>Actions</TableCell>}
                            </TableRow>
                            {/* Filter Row */}
                            <TableRow>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.uid} onChange={(e) => handleFilterChange('uid', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.parent_uid} onChange={(e) => handleFilterChange('parent_uid', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.vendor_name} onChange={(e) => handleFilterChange('vendor_name', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.service_description} onChange={(e) => handleFilterChange('service_description', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" type="date" value={filters.start_date} onChange={(e) => handleFilterChange('start_date', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" type="date" value={filters.end_date} onChange={(e) => handleFilterChange('end_date', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" select value={filters.is_renewal} onChange={(e) => handleFilterChange('is_renewal', e.target.value)} fullWidth sx={excelTableStyles.filterInput}>
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="true">Renewal</MenuItem>
                                        <MenuItem value="false">New PO</MenuItem>
                                    </TextField>
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.budget_head_name} onChange={(e) => handleFilterChange('budget_head_name', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.tower_name} onChange={(e) => handleFilterChange('tower_name', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.contract_id} onChange={(e) => handleFilterChange('contract_id', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.po_entity_name} onChange={(e) => handleFilterChange('po_entity_name', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.allocation_basis_name} onChange={(e) => handleFilterChange('allocation_basis_name', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.service_type_name} onChange={(e) => handleFilterChange('service_type_name', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                {selectedFiscalYears.includes('FY25') && (
                                    <>
                                        <TableCell sx={excelTableStyles.filterCell} />
                                        <TableCell sx={excelTableStyles.filterCell} />
                                        <TableCell sx={excelTableStyles.filterCell} />
                                        <TableCell sx={excelTableStyles.filterCell} />
                                    </>
                                )}
                                {selectedFiscalYears.includes('FY26') && (
                                    <>
                                        <TableCell sx={excelTableStyles.filterCell} />
                                        <TableCell sx={excelTableStyles.filterCell} />
                                        <TableCell sx={excelTableStyles.filterCell} />
                                        <TableCell sx={excelTableStyles.filterCell} />
                                    </>
                                )}
                                {selectedFiscalYears.includes('FY27') && (
                                    <>
                                        <TableCell sx={excelTableStyles.filterCell} />
                                        <TableCell sx={excelTableStyles.filterCell} />
                                        <TableCell sx={excelTableStyles.filterCell} />
                                        <TableCell sx={excelTableStyles.filterCell} />
                                    </>
                                )}
                                <TableCell sx={excelTableStyles.filterCell}>
                                    <TextField size="small" placeholder="Filter..." value={filters.remarks} onChange={(e) => handleFilterChange('remarks', e.target.value)} fullWidth sx={excelTableStyles.filterInput} />
                                </TableCell>
                                {isAdmin && <TableCell sx={excelTableStyles.filterCell} />}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBudgets.map((row) => (
                                <TableRow key={row.id} sx={excelTableStyles.tableRow}>
                                    <TableCell
                                        sx={{
                                            ...excelTableStyles.dataCell,
                                            cursor: 'pointer',
                                            color: 'primary.main',
                                            textDecoration: 'underline',
                                            '&:hover': { color: 'primary.dark' }
                                        }}
                                        onClick={() => window.location.href = `/budgets/${row.uid}`}
                                    >
                                        {row.uid}
                                    </TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{row.parent_uid || '-'}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{row.vendor_name}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{row.service_description}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{formatDate(row.service_start_date)}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{formatDate(row.service_end_date)}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>
                                        <Chip
                                            label={row.is_renewal ? "Renewal" : "New PO"}
                                            size="small"
                                            color={row.is_renewal ? "info" : "success"}
                                            variant="outlined"
                                            sx={excelTableStyles.statusChip}
                                        />
                                    </TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{row.budget_head_name}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{row.tower_name}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{row.contract_id}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{row.po_entity_name}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{row.allocation_basis_name}</TableCell>
                                    <TableCell sx={excelTableStyles.dataCell}>{row.service_type_name}</TableCell>
                                    {selectedFiscalYears.includes('FY25') && (
                                        <>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>
                                                {formatCurrency(row.fy25_budget)}
                                            </TableCell>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>
                                                {formatCurrency(row.fy25_actuals)}
                                            </TableCell>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell, bgcolor: '#e3f2fd' }}>
                                                {formatCurrency(row.uid_total_fy25_budget)}
                                            </TableCell>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell, bgcolor: '#e3f2fd' }}>
                                                {formatCurrency(row.uid_total_fy25_actuals)}
                                            </TableCell>
                                        </>
                                    )}
                                    {selectedFiscalYears.includes('FY26') && (
                                        <>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>
                                                {formatCurrency(row.fy26_budget)}
                                            </TableCell>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>
                                                {formatCurrency(row.fy26_actuals)}
                                            </TableCell>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell, bgcolor: '#e3f2fd' }}>
                                                {formatCurrency(row.uid_total_fy26_budget)}
                                            </TableCell>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell, bgcolor: '#e3f2fd' }}>
                                                {formatCurrency(row.uid_total_fy26_actuals)}
                                            </TableCell>
                                        </>
                                    )}
                                    {selectedFiscalYears.includes('FY27') && (
                                        <>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>-</TableCell>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell }}>-</TableCell>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell, bgcolor: '#e3f2fd' }}>
                                                {formatCurrency(row.uid_total_fy27_budget)}
                                            </TableCell>
                                            <TableCell sx={{ ...excelTableStyles.dataCell, ...excelTableStyles.numericCell, bgcolor: '#e3f2fd' }}>
                                                {formatCurrency(row.uid_total_fy27_actuals)}
                                            </TableCell>
                                        </>
                                    )}
                                    <TableCell sx={excelTableStyles.dataCell}>{row.remarks || '-'}</TableCell>
                                    {isAdmin && (
                                        <TableCell sx={excelTableStyles.dataCell}>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setEditingItem(row);
                                                    setFormData({
                                                        uid: row.uid,
                                                        parent_uid: row.parent_uid || '',
                                                        vendor_id: row.vendor_id || '',
                                                        service_description: row.service_description,
                                                        service_start_date: row.service_start_date ? row.service_start_date.split('T')[0] : '',
                                                        service_end_date: row.service_end_date ? row.service_end_date.split('T')[0] : '',
                                                        tower_id: row.tower_id || '',
                                                        budget_head_id: row.budget_head_id || '',
                                                        po_entity_id: row.po_entity_id || '',
                                                        service_type_id: row.service_type_id || '',
                                                        allocation_basis_id: row.allocation_basis_id || '',
                                                        unit_cost: row.unit_cost || '',
                                                        quantity: row.quantity || '',
                                                        total_cost: row.total_cost || '',
                                                        fiscal_year: row.fiscal_year || '',
                                                        remarks: row.remarks || ''
                                                    });
                                                    setOpenDialog(true);
                                                }}
                                                color="secondary"
                                                sx={{ padding: '2px' }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {filteredBudgets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={18} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {budgets.length === 0
                                                ? 'No budget line items found. Click "Add Line Item" to create one.'
                                                : 'No items match the current filters. Try adjusting your filters or click "Clear Filters".'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table >
                </TableContainer >
            </Paper >

            {/* Add Line Item Dialog */}
            < Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditingItem(null); resetForm(); }} maxWidth="md" fullWidth >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {editingItem ? 'Edit Line Item' : 'Add New Line Item'}
                    </Typography>
                    <IconButton onClick={() => { setOpenDialog(false); setEditingItem(null); resetForm(); }} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                label="UID (Unique ID)"
                                name="uid"
                                value={formData.uid}
                                onChange={handleInputChange}
                                placeholder="e.g., DIT-OPEX-FY26-001"
                                helperText="Can be shared across multiple PO entities"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Parent UID"
                                name="parent_uid"
                                value={formData.parent_uid}
                                onChange={handleInputChange}
                                placeholder="Optional - for renewal items"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                select
                                label="Vendor"
                                name="vendor_id"
                                value={formData.vendor_id}
                                onChange={handleInputChange}
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
                                fullWidth
                                size="small"
                                required
                                label="Service Description"
                                name="service_description"
                                value={formData.service_description}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Service Start Date"
                                name="service_start_date"
                                value={formData.service_start_date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!formErrors.dateError}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Service End Date"
                                name="service_end_date"
                                value={formData.service_end_date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!formErrors.dateError}
                                helperText={formErrors.dateError}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                select
                                label="Tower"
                                name="tower_id"
                                value={formData.tower_id}
                                onChange={handleInputChange}
                            >
                                {towers.map((tower) => (
                                    <MenuItem key={tower.id} value={tower.id}>
                                        {tower.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                select
                                label="Budget Head"
                                name="budget_head_id"
                                value={formData.budget_head_id}
                                onChange={handleInputChange}
                            >
                                {budgetHeads.map((head) => (
                                    <MenuItem key={head.id} value={head.id}>
                                        {head.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                select
                                label="PO Entity"
                                name="po_entity_id"
                                value={formData.po_entity_id}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {poEntities.map((entity) => (
                                    <MenuItem key={entity.id} value={entity.id}>
                                        {entity.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                select
                                label="Service Type"
                                name="service_type_id"
                                value={formData.service_type_id}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {serviceTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                select
                                label="Allocation Basis"
                                name="allocation_basis_id"
                                value={formData.allocation_basis_id}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {allocationBases.map((basis) => (
                                    <MenuItem key={basis.id} value={basis.id}>
                                        {basis.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                type="number"
                                label="Unit Cost"
                                name="unit_cost"
                                value={formData.unit_cost}
                                onChange={handleInputChange}
                                inputProps={{ step: "0.01", min: "0" }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                type="number"
                                label="Quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                inputProps={{ min: "1", step: "1" }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                type="number"
                                label="Total Cost"
                                name="total_cost"
                                value={formData.total_cost}
                                InputProps={{
                                    readOnly: true,
                                }}
                                helperText="Auto-calculated"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                select
                                label="Fiscal Year"
                                name="fiscal_year"
                                value={formData.fiscal_year}
                                onChange={handleInputChange}
                                helperText="Select the fiscal year for this budget allocation"
                            >
                                <MenuItem value="">Select Fiscal Year</MenuItem>
                                {availableFiscalYears.map((fy) => {
                                    // Map FY label to year number (e.g., "FY25" -> 2025)
                                    const yearMatch = fy.match(/FY(\d{2})/);
                                    const yearNum = yearMatch ? 2000 + parseInt(yearMatch[1]) : null;
                                    return (
                                        <MenuItem key={fy} value={yearNum}>
                                            {fy}
                                        </MenuItem>
                                    );
                                })}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.uid || !formData.vendor_id || !formData.service_description || !formData.tower_id || !formData.budget_head_id || !formData.fiscal_year}
                    >
                        Add Line Item
                    </Button>
                </DialogActions>
            </Dialog >

            {/* Snackbar for notifications */}
            < Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar >

            {/* Manage Fiscal Years Dialog */}
            < Dialog
                open={openManageFYDialog}
                onClose={() => setOpenManageFYDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Manage Fiscal Years</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Enable or disable fiscal years to control their visibility in the application.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {allFiscalYears.map((fy) => (
                            <Paper
                                key={fy.id}
                                variant="outlined"
                                sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {fy.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {fy.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(fy.start_date).getFullYear()} - {new Date(fy.end_date).getFullYear()}
                                    </Typography>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={fy.is_active}
                                            onChange={() => handleToggleFYStatus(fy.id, fy.is_active)}
                                            color="primary"
                                        />
                                    }
                                    label={fy.is_active ? "Active" : "Inactive"}
                                    labelPlacement="start"
                                />
                            </Paper>
                        ))}
                        {allFiscalYears.length === 0 && (
                            <Typography variant="body2" align="center" sx={{ py: 2 }}>
                                No fiscal years found.
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenManageFYDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog >

            {/* Import Modal */}
            <ImportModal
                open={openImportModal}
                onClose={() => setOpenImportModal(false)}
                onSuccess={(result) => {
                    showSnackbar(`Successfully imported ${result.imported} line items`, 'success');
                    fetchBudgets();
                }}
            />
        </Box >
    );
};

export default BudgetList;
