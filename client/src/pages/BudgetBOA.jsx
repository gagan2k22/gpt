import React, { useState, useEffect, useRef } from 'react';
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
    Button,
    CircularProgress,
    Alert,
    TextField,
    ButtonGroup,
    Tabs,
    Tab
} from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles
} from '../styles/commonStyles';

const BudgetBOA = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedData, setEditedData] = useState([]);
    const [activeTab, setActiveTab] = useState(0); // 0 = Values, 1 = Percentages
    const { token } = useAuth();
    const inputRefs = useRef({});

    const columns = [
        { id: 'vendor_service', label: 'Vendor / Service', width: '200px', editable: false, sticky: true },
        { id: 'basis_of_allocation', label: 'Basis of Allocation', width: '150px', editable: true },
        { id: 'total_count', label: 'Total Count', width: '100px', editable: true },
        { id: 'jpm_corporate', label: 'JPM Corporate', width: '120px', editable: true },
        { id: 'jphi_corporate', label: 'JPHI Corporate', width: '120px', editable: true },
        { id: 'biosys_bengaluru', label: 'Biosys - Bengaluru', width: '140px', editable: true },
        { id: 'biosys_noida', label: 'Biosys - Noida', width: '130px', editable: true },
        { id: 'biosys_greater_noida', label: 'Biosys - Greater Noida', width: '160px', editable: true },
        { id: 'pharmova_api', label: 'Pharmova - API', width: '130px', editable: true },
        { id: 'jgl_dosage', label: 'JGL - Dosage', width: '120px', editable: true },
        { id: 'jgl_ibp', label: 'JGL - IBP', width: '100px', editable: true },
        { id: 'cadista_dosage', label: 'Cadista - Dosage', width: '140px', editable: true },
        { id: 'jdi_radio_pharmaceuticals', label: 'JDI – Radio Pharmaceuticals', width: '180px', editable: true },
        { id: 'jdi_radiopharmacies', label: 'JDI - Radiopharmacies', width: '160px', editable: true },
        { id: 'jhs_gp_cmo', label: 'JHS GP CMO', width: '120px', editable: true },
        { id: 'jhs_llc_cmo', label: 'JHS LLC - CMO', width: '130px', editable: true },
        { id: 'jhs_llc_allergy', label: 'JHS LLC - Allergy', width: '140px', editable: true },
        { id: 'ingrevia', label: 'Ingrevia', width: '100px', editable: true },
        { id: 'jil_jacpl', label: 'JIL - JACPL', width: '110px', editable: true },
        { id: 'jfl', label: 'JFL', width: '80px', editable: true },
        { id: 'consumer', label: 'Consumer', width: '100px', editable: true },
        { id: 'jti', label: 'JTI', width: '80px', editable: true },
        { id: 'jogpl', label: 'JOGPL', width: '90px', editable: true },
        { id: 'enpro', label: 'Enpro', width: '90px', editable: true },
    ];

    const excelStyles = {
        headerCell: {
            backgroundColor: '#1565c0',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            borderRight: '1px solid #d0d0d0',
            borderBottom: '2px solid #1565c0',
            padding: '4px 8px',
            height: '30px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            whiteSpace: 'nowrap',
        },
        stickyHeaderCell: {
            backgroundColor: '#1565c0',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            borderRight: '2px solid #1565c0',
            borderBottom: '2px solid #1565c0',
            padding: '4px 8px',
            height: '30px',
            position: 'sticky',
            left: 0,
            top: 0,
            zIndex: 11,
            whiteSpace: 'nowrap',
        },
        cell: {
            borderRight: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            padding: '2px 8px',
            height: '15px',
            fontSize: '11px',
            fontFamily: 'Calibri, Arial, sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        stickyCell: {
            borderRight: '2px solid #1565c0',
            borderBottom: '1px solid #e0e0e0',
            padding: '2px 8px',
            height: '15px',
            fontSize: '11px',
            fontFamily: 'Calibri, Arial, sans-serif',
            position: 'sticky',
            left: 0,
            backgroundColor: '#f8f9fa',
            fontWeight: 500,
            zIndex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        editableCell: {
            backgroundColor: isEditMode ? '#fff' : '#fafafa',
            cursor: isEditMode ? 'text' : 'default',
        },
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const response = await fetch('/api/budget-boa', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch data: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            setData(result);
            setEditedData(result);
        } catch (err) {
            console.error('Error fetching Budget BOA data:', err);
            setError(err.message || 'Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        try {
            const response = await fetch('/api/budget-boa/seed', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to seed data');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditMode = () => {
        setIsEditMode(true);
        setEditedData(JSON.parse(JSON.stringify(data)));
    };

    const handleSaveAll = async () => {
        try {
            const updatePromises = editedData.map(row =>
                fetch(`/api/budget-boa/${row.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(row)
                })
            );

            await Promise.all(updatePromises);
            setSuccess('All changes saved successfully');
            setTimeout(() => setSuccess(null), 3000);
            setIsEditMode(false);
            fetchData();
        } catch (err) {
            setError('Failed to save changes: ' + err.message);
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setEditedData(JSON.parse(JSON.stringify(data)));
    };

    const handleCellChange = (rowIndex, field, value) => {
        const newData = [...editedData];
        newData[rowIndex][field] = value === '' ? null : (field === 'basis_of_allocation' ? value : parseFloat(value) || 0);
        setEditedData(newData);
    };

    const handlePaste = (e, rowIndex, colIndex) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const rows = pastedData.split('\n').map(row => row.split('\t'));

        const newData = [...editedData];
        rows.forEach((row, rIdx) => {
            const targetRowIndex = rowIndex + rIdx;
            if (targetRowIndex < newData.length) {
                row.forEach((cell, cIdx) => {
                    const targetColIndex = colIndex + cIdx;
                    if (targetColIndex < columns.length && columns[targetColIndex].editable) {
                        const field = columns[targetColIndex].id;
                        const value = cell.trim();
                        newData[targetRowIndex][field] = value === '' ? null : (field === 'basis_of_allocation' ? value : parseFloat(value) || 0);
                    }
                });
            }
        });

        setEditedData(newData);
        setSuccess('Data pasted successfully');
        setTimeout(() => setSuccess(null), 2000);
    };

    const calculatePercentage = (value, total) => {
        if (!total || total === 0) return '0.00';
        return ((value / total) * 100).toFixed(2);
    };

    const calculateColumnTotals = (data) => {
        const totals = {};
        columns.forEach(column => {
            if (column.id !== 'vendor_service' && column.id !== 'basis_of_allocation' && column.id !== 'total_count') {
                let sum = 0;
                data.forEach(row => {
                    const value = row[column.id] || 0;
                    const total = row.total_count || 0;
                    if (total > 0) {
                        sum += (value / total) * 100;
                    }
                });
                totals[column.id] = sum.toFixed(2);
            }
        });
        return totals;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const displayData = isEditMode ? editedData : data;
    const percentageTotals = calculateColumnTotals(displayData);

    if (loading) return <Box display="flex" justifyContent="center" m={4}><CircularProgress /></Box>;

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>
                    Budget BOA
                </Typography>
                <Box display="flex" gap={2}>
                    {data.length === 0 && (
                        <Button variant="contained" color="primary" onClick={handleSeed}>
                            Seed Default Data
                        </Button>
                    )}
                    {!isEditMode ? (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<EditIcon />}
                            onClick={handleEditMode}
                            disabled={data.length === 0}
                        >
                            Edit Table
                        </Button>
                    ) : (
                        <ButtonGroup variant="contained">
                            <Button color="success" startIcon={<SaveIcon />} onClick={handleSaveAll}>
                                Save All
                            </Button>
                            <Button color="error" startIcon={<CancelIcon />} onClick={handleCancel}>
                                Cancel
                            </Button>
                        </ButtonGroup>
                    )}
                </Box>
            </Box>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

            {isEditMode && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Edit Mode Active:</strong> You can paste data from Excel by selecting cells and using Ctrl+V. Changes will be saved when you click "Save All".
                </Alert>
            )}

            {/* Tabs for switching between Values and Percentages */}
            <Paper elevation={2} sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Budget BOA Values" />
                    <Tab label="Budget BOA Percentage Allocation" />
                </Tabs>
            </Paper>

            {/* Values Table */}
            {activeTab === 0 && (
                <Paper sx={{ width: '100%', mb: 2, boxShadow: 3 }}>
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)', border: '1px solid #1565c0' }}>
                        <Table
                            stickyHeader
                            size="small"
                            sx={{
                                borderCollapse: 'separate',
                                '& .MuiTableRow-root': { height: '15px' },
                                '& .MuiTableCell-root': { padding: '2px 8px', height: '15px', lineHeight: '15px' },
                                '& .MuiTableCell-head': { height: '30px', lineHeight: '30px' }
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            style={column.sticky ? excelStyles.stickyHeaderCell : excelStyles.headerCell}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayData.map((row, rowIndex) => (
                                    <TableRow hover key={row.id}>
                                        {columns.map((column, colIndex) => {
                                            const value = row[column.id];
                                            const isEditable = isEditMode && column.editable;

                                            return (
                                                <TableCell
                                                    key={column.id}
                                                    style={{
                                                        ...(column.sticky ? excelStyles.stickyCell : excelStyles.cell),
                                                        ...(isEditable ? excelStyles.editableCell : {})
                                                    }}
                                                >
                                                    {isEditable ? (
                                                        <TextField
                                                            size="small"
                                                            type={column.id === 'basis_of_allocation' ? 'text' : 'number'}
                                                            value={value || ''}
                                                            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
                                                            onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                                                            fullWidth
                                                            variant="standard"
                                                            inputProps={{
                                                                step: column.id === 'basis_of_allocation' ? undefined : '0.01',
                                                                style: { fontSize: '11px', padding: '0px 4px', height: '15px', lineHeight: '15px' }
                                                            }}
                                                            InputProps={{ disableUnderline: true }}
                                                            sx={{ '& .MuiInputBase-input': { padding: '0px 4px', height: '15px', lineHeight: '15px' } }}
                                                        />
                                                    ) : (
                                                        value || '-'
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                                {displayData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center">No data available.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Percentage Allocation Table */}
            {activeTab === 1 && (
                <Paper sx={{ width: '100%', mb: 2, boxShadow: 3 }}>
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)', border: '1px solid #0d47a1' }}>
                        <Table
                            stickyHeader
                            size="small"
                            sx={{
                                borderCollapse: 'separate',
                                '& .MuiTableRow-root': { height: '15px' },
                                '& .MuiTableCell-root': { padding: '2px 8px', height: '15px', lineHeight: '15px' },
                                '& .MuiTableCell-head': { height: '30px', lineHeight: '30px' }
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            style={{
                                                ...(column.sticky ? excelStyles.stickyHeaderCell : excelStyles.headerCell),
                                                backgroundColor: '#0d47a1',
                                                borderBottom: '2px solid #0d47a1',
                                                borderRight: column.sticky ? '2px solid #0d47a1' : '1px solid #d0d0d0'
                                            }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayData.map((row) => (
                                    <TableRow hover key={row.id}>
                                        {columns.map((column) => {
                                            let displayValue;
                                            if (column.id === 'vendor_service' || column.id === 'basis_of_allocation') {
                                                displayValue = row[column.id] || '-';
                                            } else if (column.id === 'total_count') {
                                                displayValue = row[column.id] || '0';
                                            } else {
                                                const value = row[column.id] || 0;
                                                const total = row.total_count || 0;
                                                displayValue = calculatePercentage(value, total) + '%';
                                            }
                                            return (
                                                <TableCell
                                                    key={column.id}
                                                    style={column.sticky ? excelStyles.stickyCell : excelStyles.cell}
                                                >
                                                    {displayValue}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                                {/* Totals Row */}
                                <TableRow sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                                    {columns.map((column) => {
                                        let displayValue;
                                        if (column.id === 'vendor_service') {
                                            displayValue = 'Total %';
                                        } else if (column.id === 'basis_of_allocation' || column.id === 'total_count') {
                                            displayValue = '-';
                                        } else {
                                            displayValue = percentageTotals[column.id] + '%';
                                        }
                                        return (
                                            <TableCell
                                                key={column.id}
                                                style={{
                                                    ...(column.sticky ? excelStyles.stickyCell : excelStyles.cell),
                                                    backgroundColor: '#e3f2fd',
                                                    fontWeight: 'bold',
                                                    borderTop: '2px solid #0d47a1',
                                                }}
                                            >
                                                {displayValue}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                                {displayData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center">No data available.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default BudgetBOA;
