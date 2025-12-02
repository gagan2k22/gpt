import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, ShoppingCart } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBudget: 0,
        totalActual: 0,
        variance: 0,
        poCount: 0
    });

    const [towerData, setTowerData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch budgets
            const budgetRes = await axios.get('/api/budgets?fiscal_year=2025', config);
            const totalBudget = budgetRes.data.reduce((sum, b) => sum + b.annual_budget_amount, 0);

            // Fetch actuals
            const actualsRes = await axios.get('/api/actuals?fiscal_year=2025', config);
            const totalActual = actualsRes.data.reduce((sum, a) => sum + a.actual_amount, 0);

            // Fetch POs
            const posRes = await axios.get('/api/pos', config);

            setStats({
                totalBudget,
                totalActual,
                variance: totalBudget - totalActual,
                poCount: posRes.data.length
            });

            // Process Tower Data
            const towerMap = {};
            budgetRes.data.forEach(b => {
                const towerName = b.tower ? b.tower.name : 'Unknown';
                towerMap[towerName] = (towerMap[towerName] || 0) + b.annual_budget_amount;
            });
            const processedTowerData = Object.keys(towerMap).map(name => ({
                name,
                value: towerMap[name]
            }));
            setTowerData(processedTowerData);

            // Process Monthly Data
            const monthNames = {
                1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
                7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
            };

            const monthMap = {};
            // Initialize all months
            for (let i = 1; i <= 12; i++) {
                monthMap[i] = {
                    month: monthNames[i],
                    budget: 0,
                    actual: 0,
                    sortOrder: i < 4 ? i + 12 : i // Apr(4) -> 4, ..., Dec(12) -> 12, Jan(1) -> 13, Feb(2) -> 14, Mar(3) -> 15
                };
            }

            // Sum Budgets
            budgetRes.data.forEach(b => {
                if (b.monthly_breakdown) {
                    b.monthly_breakdown.forEach(mb => {
                        if (monthMap[mb.month]) {
                            monthMap[mb.month].budget += mb.budget_amount;
                        }
                    });
                }
            });

            // Sum Actuals
            actualsRes.data.forEach(a => {
                if (monthMap[a.month]) {
                    monthMap[a.month].actual += a.actual_amount;
                }
            });

            const processedMonthlyData = Object.values(monthMap).sort((a, b) => a.sortOrder - b.sortOrder);
            setMonthlyData(processedMonthlyData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const StatCard = ({ title, value, icon, trend }) => (
        <Card elevation={2} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                            ₹{(value / 1000000).toFixed(2)}M
                        </Typography>
                        {trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                {trend > 0 ? <TrendingUp color="success" fontSize="small" /> : <TrendingDown color="error" fontSize="small" />}
                                <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                                    {Math.abs(trend).toFixed(1)}%
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{
                        backgroundColor: 'primary.main',
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

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Dashboard Overview
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Budget FY25"
                        value={stats.totalBudget}
                        icon={<AccountBalance />}
                        trend={5.2}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Actual FY25"
                        value={stats.totalActual}
                        icon={<TrendingUp />}
                        trend={-2.1}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Variance"
                        value={stats.variance}
                        icon={<TrendingDown />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom variant="body2">
                                Active POs
                            </Typography>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                                {stats.poCount}
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
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Budget vs Actual Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                                <Legend />
                                <Line type="monotone" dataKey="budget" stroke="#8884d8" strokeWidth={2} name="Budget" />
                                <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={2} name="Actual" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Tower-wise Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={towerData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {towerData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${(value / 1000000).toFixed(2)}M`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Monthly Comparison
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                                <Legend />
                                <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
