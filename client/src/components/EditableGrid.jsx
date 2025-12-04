import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    Save as SaveIcon,
    Edit as EditIcon,
    Cancel as CancelIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const EditableGrid = ({ lineItems, onUpdate }) => {
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [loading, setLoading] = useState(false);

    const handleEdit = (lineItem) => {
        setEditingRowId(lineItem.id);

        // Initialize edited data with current values
        const monthData = {};
        MONTHS.forEach(month => {
            const monthRecord = lineItem.months?.find(m => m.month === month);
            monthData[month] = monthRecord ? parseFloat(monthRecord.amount) : 0;
        });

        setEditedData({
            ...lineItem,
            monthData
        });
    };

    const handleCancel = () => {
        setEditingRowId(null);
        setEditedData({});
    };

    const handleMonthChange = (month, value) => {
        const numValue = parseFloat(value) || 0;
        setEditedData(prev => ({
            ...prev,
            monthData: {
                ...prev.monthData,
                [month]: numValue
            }
        }));
    };

    const calculateTotal = (monthData) => {
        return Object.values(monthData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Update monthly budgets
            await axios.put(
                `/api/line-items/${editingRowId}/months`,
                { monthlyData: editedData.monthData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onUpdate();
            setEditingRowId(null);
            setEditedData({});
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error saving changes');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyRow = (lineItem) => {
        const monthData = {};
        MONTHS.forEach(month => {
            const monthRecord = lineItem.months?.find(m => m.month === month);
            monthData[month] = monthRecord ? parseFloat(monthRecord.amount) : 0;
        });

        const csvData = [
            lineItem.uid,
            lineItem.description,
            ...MONTHS.map(m => monthData[m]),
            calculateTotal(monthData)
        ].join('\t');

        navigator.clipboard.writeText(csvData);
    };

    const getMonthValue = (lineItem, month) => {
        if (editingRowId === lineItem.id) {
            return editedData.monthData?.[month] || 0;
        }
        const monthRecord = lineItem.months?.find(m => m.month === month);
        return monthRecord ? parseFloat(monthRecord.amount) : 0;
    };

    const getRowTotal = (lineItem) => {
        if (editingRowId === lineItem.id) {
            return calculateTotal(editedData.monthData || {});
        }
        return parseFloat(lineItem.totalBudget) || 0;
    };

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.main', color: 'white', position: 'sticky', left: 0, zIndex: 3 }}>
                            Actions
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.main', color: 'white', position: 'sticky', left: 80, zIndex: 3, minWidth: 150 }}>
                            UID
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.main', color: 'white', position: 'sticky', left: 230, zIndex: 3, minWidth: 200 }}>
                            Description
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.main', color: 'white', minWidth: 120 }}>
                            Tower
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.main', color: 'white', minWidth: 120 }}>
                            Budget Head
                        </TableCell>
                        {MONTHS.map(month => (
                            <TableCell
                                key={month}
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    minWidth: 100,
                                    textAlign: 'right'
                                }}
                            >
                                {month}
                            </TableCell>
                        ))}
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'success.main', color: 'white', minWidth: 120, textAlign: 'right' }}>
                            Total
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {lineItems.map((lineItem) => {
                        const isEditing = editingRowId === lineItem.id;
                        const total = getRowTotal(lineItem);

                        return (
                            <TableRow
                                key={lineItem.id}
                                sx={{
                                    backgroundColor: isEditing ? 'action.selected' : 'inherit',
                                    '&:hover': { backgroundColor: 'action.hover' }
                                }}
                            >
                                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'inherit', zIndex: 2 }}>
                                    {isEditing ? (
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Save">
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                >
                                                    {loading ? <CircularProgress size={20} /> : <SaveIcon fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Cancel">
                                                <IconButton size="small" color="error" onClick={handleCancel}>
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleEdit(lineItem)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Copy Row">
                                                <IconButton size="small" onClick={() => handleCopyRow(lineItem)}>
                                                    <CopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </TableCell>
                                <TableCell sx={{ position: 'sticky', left: 80, backgroundColor: 'inherit', zIndex: 2, fontWeight: 500 }}>
                                    {lineItem.uid}
                                </TableCell>
                                <TableCell sx={{ position: 'sticky', left: 230, backgroundColor: 'inherit', zIndex: 2 }}>
                                    {lineItem.description}
                                </TableCell>
                                <TableCell>{lineItem.tower?.name || '-'}</TableCell>
                                <TableCell>{lineItem.budgetHead?.name || '-'}</TableCell>
                                {MONTHS.map(month => {
                                    const value = getMonthValue(lineItem, month);
                                    return (
                                        <TableCell key={month} sx={{ textAlign: 'right' }}>
                                            {isEditing ? (
                                                <TextField
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => handleMonthChange(month, e.target.value)}
                                                    size="small"
                                                    sx={{
                                                        width: 90,
                                                        '& input': { textAlign: 'right' }
                                                    }}
                                                    inputProps={{ step: 0.01 }}
                                                />
                                            ) : (
                                                <Typography variant="body2">
                                                    {value > 0 ? value.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    );
                                })}
                                <TableCell sx={{ textAlign: 'right', fontWeight: 600, backgroundColor: 'success.50' }}>
                                    <Chip
                                        label={total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        color="success"
                                        size="small"
                                        variant={isEditing ? 'filled' : 'outlined'}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default EditableGrid;
