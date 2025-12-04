import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, MenuItem, TextField, Select, InputLabel,
    FormControl, OutlinedInput, Chip, FormHelperText
} from '@mui/material';
import axios from 'axios';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    tableContainerStyles,
    tableHeaderStyles,
    tableRowStyles,
    tableCellStyles,
    pageTransitionStyles
} from '../styles/commonStyles';
import { getAvailableFiscalYears, getFiscalYearMonths } from '../utils/fiscalYearUtils';

import { Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import ActualsImportModal from '../components/ActualsImportModal';

const ActualsList = () => {
    const [actuals, setActuals] = useState([]);
    const [selectedFiscalYears, setSelectedFiscalYears] = useState([2025]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [allFiscalMonths, setAllFiscalMonths] = useState([]);
    const [importModalOpen, setImportModalOpen] = useState(false);

    // ... existing useEffects ...

    return (
        <Box sx={{ ...pageContainerStyles, ...pageTransitionStyles }}>
            <Box sx={pageHeaderStyles}>
                <Typography sx={pageTitleStyles}>
                    Actuals Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        onClick={() => setImportModalOpen(true)}
                    >
                        Import Actuals
                    </Button>

                    {/* Multi-select Fiscal Year */}
                    <FormControl sx={{ minWidth: 250 }} size="small">
                        <InputLabel id="fiscal-year-multi-select-label">Fiscal Years</InputLabel>
                        <Select
                            labelId="fiscal-year-multi-select-label"
                            id="fiscal-year-multi-select"
                            multiple
                            value={selectedFiscalYears}
                            onChange={handleFiscalYearChange}
                            input={<OutlinedInput label="Fiscal Years" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const fy = fiscalYears.find(f => f.value === value);
                                        return <Chip key={value} label={fy?.label || value} size="small" />;
                                    })}
                                </Box>
                            )}
                        >
                            {fiscalYears.map((fy) => (
                                <MenuItem key={fy.value} value={fy.value}>
                                    {fy.label} ({fy.range})
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Select one or more fiscal years</FormHelperText>
                    </FormControl>

                    {/* Multi-select Months */}
                    <FormControl sx={{ minWidth: 300 }} size="small">
                        <InputLabel id="month-multi-select-label">Months</InputLabel>
                        <Select
                            labelId="month-multi-select-label"
                            id="month-multi-select"
                            multiple
                            value={selectedMonths}
                            onChange={handleMonthChange}
                            input={<OutlinedInput label="Months" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.length === 0 ? (
                                        <em>All Months</em>
                                    ) : (
                                        selected.map((value) => (
                                            <Chip key={value} label={monthNames[value - 1]} size="small" />
                                        ))
                                    )}
                                </Box>
                            )}
                            disabled={selectedFiscalYears.length === 0}
                        >
                            {allFiscalMonths.map((month) => (
                                <MenuItem key={month.uniqueId} value={month.value}>
                                    {month.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                            {selectedFiscalYears.length === 0
                                ? 'Select fiscal year(s) first'
                                : 'Select one or more months (leave empty for all)'}
                        </FormHelperText>
                    </FormControl>
                </Box>
            </Box>

            <TableContainer component={Paper} {...tableContainerStyles}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ ...tableHeaderStyles, backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>FY</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Month</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Tower</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Budget Head</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Cost Centre</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Actual Amount (₹)</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Remarks</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {actuals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    No actuals data found for the selected period
                                </TableCell>
                            </TableRow>
                        ) : (
                            actuals.map((actual) => (
                                <TableRow key={actual.id} sx={tableRowStyles}>
                                    <TableCell sx={tableCellStyles}>{actual.fiscal_year}</TableCell>
                                    <TableCell sx={tableCellStyles}>{monthNames[actual.month - 1]}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.tower?.name}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.budget_head?.name}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.cost_centre?.code}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.actual_amount.toLocaleString('en-IN')}</TableCell>
                                    <TableCell sx={tableCellStyles}>{actual.remarks || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <ActualsImportModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={fetchActuals}
            />
        </Box>
    );
};

export default ActualsList;
