import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, ShoppingCart } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import {
    pageContainerStyles,
    pageHeaderStyles,
    pageTitleStyles,
    pageTransitionStyles
} from '../styles/commonStyles';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBudget: 0,
        totalActual: 0,
        variance: 0,
        utilizationPercent: 0
    });

    const [towerData, setTowerData] = useState([]);
    const [vendorData, setVendorData] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports/dashboard`, config);
            const { summary, towerWise, vendorWise, monthlyTrend } = response.data;

            setStats({
                totalBudget: summary.budget,
                totalActual: summary.actuals,
                variance: summary.variance,
                utilizationPercent: summary.utilization
            });

            setTowerData(towerWise);
            setVendorData(vendorWise);
            setMonthlyTrend(monthlyTrend);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

    const formatCurrency = (value) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
        return `₹${(value / 1000).toFixed(0)}K`;
    };

    const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
        <Card elevation={2} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                            {formatCurrency(value)}
                        </Typography>
                        {trend !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                {trend > 0 ? <TrendingUp color="success" fontSize="small" /> : <TrendingDown color="error" fontSize="small" />}
                                <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                                    {Math.abs(trend).toFixed(1)}%
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{
                        backgroundColor: `${color}.main`,
                        borderRadius: 2,
                        p: 1.5,
                        color: 'white',
                        opacity: 0.9
                    }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

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
                    Dashboard Overview
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Budget"
                        value={stats.totalBudget}
                        icon={<AccountBalance />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Actuals"
                        value={stats.totalActual}
                        icon={<TrendingUp />}
                        trend={stats.utilizationPercent - 100}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Variance"
                        value={stats.variance}
                        icon={<TrendingDown />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom variant="body2">
                                Budget Utilization
                            </Typography>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                                {stats.utilizationPercent.toFixed(1)}%
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <ShoppingCart color="primary" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Tower-wise Budget vs Actual */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Tower-wise Budget vs Actual
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={towerData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis tickFormatter={formatCurrency} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                                <Bar dataKey="actuals" fill="#82ca9d" name="Actuals" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Vendor-wise Spend (Top 10) */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Top 10 Vendors by Spend
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={vendorData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={formatCurrency} />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="spend" fill="#0088FE" name="Spend" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Tower Distribution Pie Chart */}
                <Grid item xs={12} lg={4}>
                    <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Tower Budget Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={towerData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="budget"
                                >
                                    {towerData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Monthly Trend */}
                <Grid item xs={12} lg={8}>
                    <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Monthly Spend Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={formatCurrency} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="amount" stroke="#82ca9d" strokeWidth={2} name="Actuals" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
