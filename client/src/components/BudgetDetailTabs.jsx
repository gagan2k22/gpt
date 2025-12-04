import React, { useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton
} from '@mui/material';
import { Add, Edit, Save, Cancel, NoteAdd } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BudgetDetailTabs = ({ value, data, onRefresh }) => {
    const { lineItem, monthlyActuals, variance, auditHistory } = data;
    const { token } = useAuth();
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [selectedActualId, setSelectedActualId] = useState(null);

    const handleAddNote = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/budget-detail/${lineItem.uid}/notes`,
                { note: noteText, actualId: selectedActualId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNoteDialogOpen(false);
            setNoteText('');
            setSelectedActualId(null);
            onRefresh();
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Failed to add note');
        }
    };

    const openNoteDialog = (actualId = null) => {
        setSelectedActualId(actualId);
        setNoteDialogOpen(true);
    };

    // Tab 0: Monthly Breakdown
    if (value === 0) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return (
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>Month</TableCell>
                            <TableCell align="right">Budget</TableCell>
                            <TableCell align="right">Actuals</TableCell>
                            <TableCell align="right">Variance</TableCell>
                            <TableCell align="center">%</TableCell>
                            <TableCell align="center">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {months.map(month => {
                            const mData = variance.monthly[month] || { budget: 0, actual: 0, variance: 0, variancePercentage: 0 };
                            return (
                                <TableRow key={month} hover>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>{month}</TableCell>
                                    <TableCell align="right">{new Intl.NumberFormat('en-IN').format(mData.budget)}</TableCell>
                                    <TableCell align="right">{new Intl.NumberFormat('en-IN').format(mData.actual)}</TableCell>
                                    <TableCell align="right" sx={{
                                        color: mData.variance < 0 ? 'error.main' : 'success.main',
                                        fontWeight: 500
                                    }}>
                                        {new Intl.NumberFormat('en-IN').format(mData.variance)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {mData.budget > 0 ? `${mData.variancePercentage.toFixed(1)}%` : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        {mData.actual > mData.budget && mData.budget > 0 ? (
                                            <Chip label="Over Budget" color="error" size="small" variant="outlined" />
                                        ) : mData.actual > 0 ? (
                                            <Chip label="On Track" color="success" size="small" variant="outlined" />
                                        ) : (
                                            <Chip label="Pending" size="small" variant="outlined" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                {new Intl.NumberFormat('en-IN').format(variance.cumulative.budget)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                {new Intl.NumberFormat('en-IN').format(variance.cumulative.actual)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: variance.cumulative.variance < 0 ? 'error.main' : 'success.main' }}>
                                {new Intl.NumberFormat('en-IN').format(variance.cumulative.variance)}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>
                                {variance.cumulative.variancePercentage.toFixed(1)}%
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    // Tab 1: Linked POs
    if (value === 1) {
        return (
            <Box>
                {lineItem.pos && lineItem.pos.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell>PO Number</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Vendor</TableCell>
                                    <TableCell align="right">Value</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lineItem.pos.map(po => (
                                    <TableRow key={po.id} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{po.poNumber}</TableCell>
                                        <TableCell>{new Date(po.poDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{po.vendor?.name || 'N/A'}</TableCell>
                                        <TableCell align="right">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: po.currency }).format(po.poValue)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={po.status || 'Draft'}
                                                color={po.status === 'Approved' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">No Purchase Orders linked to this line item.</Typography>
                        <Button variant="outlined" startIcon={<Add />} sx={{ mt: 2 }}>
                            Create PO
                        </Button>
                    </Box>
                )}
            </Box>
        );
    }

    // Tab 2: Actuals History
    if (value === 2) {
        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button startIcon={<Add />} variant="contained" size="small">
                        Add Actual
                    </Button>
                </Box>

                {lineItem.actuals && lineItem.actuals.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell>Invoice Date</TableCell>
                                    <TableCell>Invoice No</TableCell>
                                    <TableCell>Vendor</TableCell>
                                    <TableCell>Month</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lineItem.actuals.map(actual => (
                                    <TableRow key={actual.id} hover>
                                        <TableCell>{new Date(actual.invoiceDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{actual.invoiceNo || '-'}</TableCell>
                                        <TableCell>{actual.vendor?.name || '-'}</TableCell>
                                        <TableCell>{actual.month || '-'}</TableCell>
                                        <TableCell align="right">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: actual.currency }).format(actual.amount)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => openNoteDialog(actual.id)} title="Add Reconciliation Note">
                                                <NoteAdd fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">No actuals recorded for this line item.</Typography>
                    </Box>
                )}

                {/* Reconciliation Notes Section */}
                {lineItem.reconciliationNotes && lineItem.reconciliationNotes.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Reconciliation Notes</Typography>
                        {lineItem.reconciliationNotes.map(note => (
                            <Paper key={note.id} sx={{ p: 2, mb: 2, bgcolor: '#fffde7' }}>
                                <Typography variant="body2">{note.note}</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        By: {note.user?.name || 'Unknown'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(note.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}

                {/* Note Dialog */}
                <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)}>
                    <DialogTitle>Add Reconciliation Note</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Note"
                            fullWidth
                            multiline
                            rows={4}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddNote} variant="contained">Save</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    // Tab 3: Audit Log
    if (value === 3) {
        return (
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>Date</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {auditHistory && auditHistory.length > 0 ? (
                            auditHistory.map(log => (
                                <TableRow key={log.id} hover>
                                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{log.user?.name || 'System'}</TableCell>
                                    <TableCell>
                                        <Chip label={log.action} size="small" />
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {log.diff ? JSON.stringify(log.diff) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No audit history found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return null;
};

export default BudgetDetailTabs;
