import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    LinearProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip
} from '@mui/material';
import { CloudUpload, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ActualsImportModal = ({ open, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewData, setPreviewData] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewData(null);
            setError(null);
        }
    };

    const handleUpload = async (dryRun = true) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/actuals/import?dryRun=${dryRun}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (dryRun) {
                setPreviewData(response.data);
            } else {
                onSuccess(response.data);
                handleClose();
            }
        } catch (err) {
            console.error('Import error:', err);
            setError(err.response?.data?.message || 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData(null);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Import Actuals</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3, mt: 1 }}>
                    <input
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        id="actuals-file-upload"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="actuals-file-upload">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUpload />}
                            fullWidth
                            sx={{ height: 100, borderStyle: 'dashed' }}
                        >
                            {file ? file.name : 'Click to upload Excel file'}
                        </Button>
                    </label>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {previewData && (
                    <Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Chip
                                icon={<CheckCircle />}
                                label={`${previewData.report.accepted.length} Accepted`}
                                color="success"
                                variant="outlined"
                            />
                            <Chip
                                icon={<ErrorIcon />}
                                label={`${previewData.report.rejected.length} Rejected`}
                                color="error"
                                variant="outlined"
                            />
                        </Box>

                        {previewData.report.rejected.length > 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                Some rows have errors and will be skipped.
                            </Alert>
                        )}

                        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Row</TableCell>
                                        <TableCell>Invoice No</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewData.report.rejected.map((row, index) => (
                                        <TableRow key={`rej-${index}`}>
                                            <TableCell>{row.rowIndex}</TableCell>
                                            <TableCell>{row.invoiceNo}</TableCell>
                                            <TableCell>{row.invoiceDate}</TableCell>
                                            <TableCell>{row.amount}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="error">
                                                    {row.errors.join(', ')}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {previewData.report.accepted.slice(0, 5).map((row, index) => (
                                        <TableRow key={`acc-${index}`}>
                                            <TableCell>{row.rowIndex}</TableCell>
                                            <TableCell>{row.invoiceNo}</TableCell>
                                            <TableCell>{new Date(row.invoiceDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{row.amount}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="success">OK</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                {!previewData ? (
                    <Button
                        onClick={() => handleUpload(true)}
                        variant="contained"
                        disabled={!file || loading}
                    >
                        Preview
                    </Button>
                ) : (
                    <Button
                        onClick={() => handleUpload(false)}
                        variant="contained"
                        color="success"
                        disabled={loading || previewData.report.accepted.length === 0}
                    >
                        Commit Import
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ActualsImportModal;
