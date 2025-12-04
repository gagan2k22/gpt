import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Download as DownloadIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ImportModal = ({ open, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dryRunResult, setDryRunResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setDryRunResult(null);
            setError(null);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setDryRunResult(null);
            setError(null);
        }
    };

    const handleDryRun = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/budgets/import?dryRun=true`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setDryRunResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error processing file');
        } finally {
            setLoading(false);
        }
    };

    const handleCommit = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/budgets/import?dryRun=false`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            onSuccess(response.data);
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error importing data');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadRejected = () => {
        if (!dryRunResult?.report?.rejected) return;

        const csvContent = [
            ['Row', 'UID', 'Errors'].join(','),
            ...dryRunResult.report.rejected.map(row =>
                [row.rowIndex, row.uid || 'N/A', row.errors.join('; ')].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rejected_rows.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleClose = () => {
        setFile(null);
        setDryRunResult(null);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Import Budget Data</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* File Upload Area */}
                {!dryRunResult && (
                    <Box
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        sx={{
                            border: '2px dashed',
                            borderColor: file ? 'primary.main' : 'grey.300',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: file ? 'primary.50' : 'grey.50',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                {file ? file.name : 'Drop Excel file here or click to browse'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Supported formats: .xlsx, .xls
                            </Typography>
                        </label>
                    </Box>
                )}

                {/* Dry Run Results */}
                {dryRunResult && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Preview Results
                            </Typography>
                            <Typography variant="body2">
                                Total Rows: {dryRunResult.report.totalRows} |
                                Accepted: <Chip label={dryRunResult.report.accepted.length} color="success" size="small" sx={{ mx: 0.5 }} /> |
                                Rejected: <Chip label={dryRunResult.report.rejected.length} color="error" size="small" sx={{ mx: 0.5 }} />
                            </Typography>
                        </Alert>

                        {/* Header Mapping */}
                        {dryRunResult.headerMapping && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Header Mapping
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {dryRunResult.headerMapping.rawHeaders.map((header, idx) => (
                                        <Chip
                                            key={idx}
                                            label={`${header} → ${dryRunResult.headerMapping.normalizedHeaders[idx] || header}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Rejected Rows */}
                        {dryRunResult.report.rejected.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="subtitle2" color="error">
                                        Rejected Rows ({dryRunResult.report.rejected.length})
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        onClick={handleDownloadRejected}
                                    >
                                        Download Rejected
                                    </Button>
                                </Box>
                                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Row</TableCell>
                                                <TableCell>UID</TableCell>
                                                <TableCell>Errors</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dryRunResult.report.rejected.slice(0, 10).map((row, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{row.rowIndex}</TableCell>
                                                    <TableCell>{row.uid || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        {row.errors.map((err, i) => (
                                                            <Chip key={i} label={err} size="small" color="error" sx={{ mr: 0.5, mb: 0.5 }} />
                                                        ))}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {dryRunResult.report.rejected.length > 10 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Showing first 10 of {dryRunResult.report.rejected.length} rejected rows
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Accepted Rows Preview */}
                        {dryRunResult.report.accepted.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" color="success.main" gutterBottom>
                                    Accepted Rows ({dryRunResult.report.accepted.length})
                                </Typography>
                                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>UID</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Total Budget</TableCell>
                                                <TableCell>Sum Months</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dryRunResult.report.accepted.slice(0, 10).map((row, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{row.uid}</TableCell>
                                                    <TableCell>{row.description}</TableCell>
                                                    <TableCell>{row.totalBudget?.toLocaleString()}</TableCell>
                                                    <TableCell>{row.sumMonths?.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {dryRunResult.report.accepted.length > 10 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Showing first 10 of {dryRunResult.report.accepted.length} accepted rows
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                {!dryRunResult ? (
                    <Button
                        variant="contained"
                        onClick={handleDryRun}
                        disabled={!file || loading}
                        startIcon={<CheckIcon />}
                    >
                        Preview Import
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={() => setDryRunResult(null)}
                            disabled={loading}
                        >
                            Change File
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCommit}
                            disabled={loading || dryRunResult.report.accepted.length === 0}
                            startIcon={<UploadIcon />}
                            color="success"
                        >
                            Commit Import ({dryRunResult.report.accepted.length} rows)
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ImportModal;
