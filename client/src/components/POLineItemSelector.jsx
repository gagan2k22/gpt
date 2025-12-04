import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Paper,
    InputAdornment
} from '@mui/material';
import { Delete, Search } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const POLineItemSelector = ({ selectedItems, onChange }) => {
    const { token } = useAuth();
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const fetchLineItems = async () => {
            if (inputValue.length < 2) return;
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/line-items?uid=${inputValue}&limit=20`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOptions(response.data.data);
            } catch (error) {
                console.error('Error searching line items:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchLineItems, 500);
        return () => clearTimeout(debounce);
    }, [inputValue, token]);

    const handleAddItem = (event, newValue) => {
        if (newValue && !selectedItems.find(item => item.id === newValue.id)) {
            onChange([...selectedItems, { ...newValue, allocatedAmount: 0 }]);
        }
        setInputValue('');
    };

    const handleRemoveItem = (id) => {
        onChange(selectedItems.filter(item => item.id !== id));
    };

    const handleAmountChange = (id, amount) => {
        onChange(selectedItems.map(item =>
            item.id === id ? { ...item, allocatedAmount: amount } : item
        ));
    };

    return (
        <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Link Line Items</Typography>

            <Autocomplete
                options={options}
                getOptionLabel={(option) => `${option.uid} - ${option.service_description}`}
                loading={loading}
                onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                onChange={handleAddItem}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search by UID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <Typography variant="caption">Loading...</Typography> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                sx={{ mb: 2 }}
            />

            {selectedItems.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell>UID</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="right">Allocated Amount</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.uid}</TableCell>
                                    <TableCell>{item.service_description}</TableCell>
                                    <TableCell align="right" sx={{ width: 200 }}>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={item.allocatedAmount}
                                            onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default POLineItemSelector;
