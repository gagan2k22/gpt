import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab } from '@mui/material';
import axios from 'axios';

const MasterData = () => {
    const [tab, setTab] = useState(0);
    const [towers, setTowers] = useState([]);
    const [budgetHeads, setBudgetHeads] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [costCentres, setCostCentres] = useState([]);
    const [poEntities, setPOEntities] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [allocationBases, setAllocationBases] = useState([]);

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
                allocationBasesRes
            ] = await Promise.all([
                axios.get('/api/master/towers', config),
                axios.get('/api/master/budget-heads', config),
                axios.get('/api/master/vendors', config),
                axios.get('/api/master/cost-centres', config),
                axios.get('/api/master/po-entities', config),
                axios.get('/api/master/service-types', config),
                axios.get('/api/master/allocation-bases', config)
            ]);

            setTowers(towersRes.data);
            setBudgetHeads(budgetHeadsRes.data);
            setVendors(vendorsRes.data);
            setCostCentres(costCentresRes.data);
            setPOEntities(poEntitiesRes.data);
            setServiceTypes(serviceTypesRes.data);
            setAllocationBases(allocationBasesRes.data);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Master Data Management
            </Typography>

            <Paper elevation={2}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }} variant="scrollable" scrollButtons="auto">
                    <Tab label="Towers" />
                    <Tab label="Budget Heads" />
                    <Tab label="Vendors" />
                    <Tab label="Cost Centres" />
                    <Tab label="PO Entities" />
                    <Tab label="Service Types" />
                    <Tab label="Allocation Bases" />
                </Tabs>

                {tab === 0 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {towers.map((tower) => (
                                    <TableRow key={tower.id} hover>
                                        <TableCell>{tower.id}</TableCell>
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
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Tower</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {budgetHeads.map((head) => (
                                    <TableRow key={head.id} hover>
                                        <TableCell>{head.id}</TableCell>
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
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>GST Number</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Contact Person</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vendors.map((vendor) => (
                                    <TableRow key={vendor.id} hover>
                                        <TableCell>{vendor.id}</TableCell>
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
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Code</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {costCentres.map((cc) => (
                                    <TableRow key={cc.id} hover>
                                        <TableCell>{cc.id}</TableCell>
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
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {poEntities.map((entity) => (
                                    <TableRow key={entity.id} hover>
                                        <TableCell>{entity.id}</TableCell>
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
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {serviceTypes.map((type) => (
                                    <TableRow key={type.id} hover>
                                        <TableCell>{type.id}</TableCell>
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
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allocationBases.map((basis) => (
                                    <TableRow key={basis.id} hover>
                                        <TableCell>{basis.id}</TableCell>
                                        <TableCell>{basis.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default MasterData;
